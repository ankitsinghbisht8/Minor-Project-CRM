// RAG routes (Express + Sequelize + Gemini)
const express = require("express");
const router = express.Router();
const sequelize = require("../config/database");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const hasGemini = Boolean(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const llmModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


const EXPECTED_DIM = 1536;

async function getEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  const values = (result && result.embedding && Array.isArray(result.embedding.values))
    ? result.embedding.values
    : [];
  return normalizeEmbedding(values, EXPECTED_DIM);
}

function normalizeEmbedding(values, dim) {
  const trimmed = Array.isArray(values) ? values.slice(0, dim) : [];
  if (trimmed.length < dim) {
    return trimmed.concat(new Array(dim - trimmed.length).fill(0));
  }
  return trimmed;
}

function toSqlVector(arrayOfNumbers) {
  const safe = Array.isArray(arrayOfNumbers)
    ? arrayOfNumbers.map((v) => (typeof v === "number" && Number.isFinite(v) ? v : 0))
    : [];
  return `[${safe.join(",")}]`;
}

// POST /api/rag/upsert
router.post("/upsert", async (req, res) => {
  try {
    const { customerId, profileText, profileJson = {} } = req.body || {};
    if (!customerId || !profileText) {
      return res.status(400).json({ error: "customerId and profileText are required" });
    }

    const embedding = await getEmbedding(profileText);
    const embeddingLiteral = toSqlVector(embedding);

    const sql = `INSERT INTO customer_profiles_vec (customer_id, profile_json, embedding, updated_at)
                 VALUES (:customerId, :profileJson::jsonb, :embedding::vector, NOW())
     ON CONFLICT (customer_id)
     DO UPDATE SET profile_json = EXCLUDED.profile_json, 
                   embedding = EXCLUDED.embedding,
                               updated_at = NOW();`;

    await sequelize.query(sql, {
      replacements: {
        customerId,
        profileJson: JSON.stringify(profileJson),
        embedding: embeddingLiteral,
      },
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("Upsert embedding failed:", err);
    return res.status(500).json({ error: "Upsert failed" });
  }
});

// GET /api/rag/search?query=...&topK=5
router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.query || "").trim();
    const topK = Math.min(parseInt(req.query.topK, 10) || 5, 50);
    if (!query) return res.status(400).json({ error: "query is required" });

  const queryEmbedding = await getEmbedding(query);
    const embeddingLiteral = toSqlVector(queryEmbedding);

    const sql = `SELECT customer_id, profile_json
     FROM customer_profiles_vec
                 ORDER BY embedding <-> :embedding::vector
                 LIMIT :topK;`;
    const [rows] = await sequelize.query(sql, {
      replacements: { embedding: embeddingLiteral, topK },
    });

    return res.json(rows);
  } catch (err) {
    console.error("Search failed:", err);
    return res.status(500).json({ error: "Search failed" });
  }
});

// POST /api/rag/query { query }
router.post("/query", async (req, res) => {
  try {
    const { query } = req.body || {};
    if (!query) return res.status(400).json({ error: "query is required" });

    const topK = 5;
    const queryEmbedding = await getEmbedding(query);
    const embeddingLiteral = toSqlVector(queryEmbedding);

    const sql = `SELECT customer_id, profile_json
                 FROM customer_profiles_vec
                 ORDER BY embedding <-> :embedding::vector
                 LIMIT :topK;`;
    const [rows] = await sequelize.query(sql, {
      replacements: { embedding: embeddingLiteral, topK },
    });

    const context = rows
      .map((c, i) => `Customer ${i + 1} (ID: ${c.customer_id}): ${JSON.stringify(c.profile_json)}`)
    .join("\n\n");

    const prompt = `You are a CRM assistant. Answer the user query using the context below.\nIf context is not relevant, say "No relevant customer information found."\n\nContext:\n${context}\n\nQuery: ${query}\nAnswer:\n`;

    const result = await llmModel.generateContent(prompt);
    const answer = result?.response?.text?.() || "";

    return res.json({ answer, contextRows: rows });
  } catch (err) {
    console.error("RAG query failed:", err);
    return res.status(500).json({ error: "RAG query failed" });
  }
});

module.exports = router;
// --- Segmentation helpers and endpoints ---
// Build a compact profile text from relational data for quality embeddings
async function buildCustomerProfileText(customerId) {
  const [aggRows] = await sequelize.query(
    `WITH agg AS (
        SELECT c.customer_id,
               c.full_name,
               c.age,
               c.location,
               c.customer_segment,
               COALESCE(SUM(CASE WHEN o.order_status = 'Completed' THEN 1 ELSE 0 END), 0) AS num_orders,
               COALESCE(SUM(CASE WHEN o.order_status = 'Completed' THEN o.order_amount ELSE 0 END), 0) AS total_spend,
               MAX(CASE WHEN o.order_status = 'Completed' THEN o.order_date END) AS last_order_date,
               COALESCE(SUM(CASE WHEN i.interaction_type = 'Visit' THEN 1 ELSE 0 END), 0) AS visits
        FROM customers c
        LEFT JOIN orders o ON c.customer_id = o.customer_id
        LEFT JOIN interactions i ON c.customer_id = i.customer_id
        WHERE c.customer_id = :customerId
        GROUP BY c.customer_id
    )
    SELECT *, COALESCE(EXTRACT(DAY FROM NOW() - last_order_date), 999999)::int AS days_since_last_order
    FROM agg`,
    { replacements: { customerId } }
  );
  const a = aggRows[0];
  if (!a) return null;
  return {
    text: `Name: ${a.full_name}. Age: ${a.age}. Location: ${a.location}. Orders: ${a.num_orders}. Spend: ${a.total_spend}. DaysSinceLastOrder: ${a.days_since_last_order}. Visits: ${a.visits}. CurrentSegment: ${a.customer_segment || '-'} `,
    json: {
      age: a.age,
      location: a.location,
      num_orders: a.num_orders,
      total_spend: a.total_spend,
      days_since_last_order: a.days_since_last_order,
      visits: a.visits,
      current_segment: a.customer_segment,
    },
  };
}

function heuristicSegmentFromNumbers(num) {
  if (num.total_spend > 20000 && num.num_orders > 10 && num.days_since_last_order < 30) {
    return 'VIP';
  }
  if (num.total_spend > 10000 && num.num_orders > 5) {
    return 'Loyal';
  }
  if (num.days_since_last_order > 180) {
    return 'Churn Risk';
  }
  return 'Regular';
}

async function recommendSegmentForProfile(contextText, numericJson) {
  if (!hasGemini) {
    const seg = heuristicSegmentFromNumbers(numericJson || {});
    return { segment: seg, confidence: 0.6, rationale: 'Heuristic (no LLM key present)' };
  }

  const prompt = `You are an expert CRM analyst. Based on the customer profile below, assign the most suitable segment from {VIP, Loyal, Regular, Churn Risk}.
Return strict JSON with keys segment (string one of VIP/Loyal/Regular/Churn Risk), confidence (0-1), rationale (short sentence).

Profile:\n${contextText}`;
  try {
  const result = await llmModel.generateContent(prompt);
    const raw = result?.response?.text?.() || '';
    const parsed = JSON.parse(raw);
    const segment = String(parsed.segment || '').trim();
    const valid = new Set(['VIP','Loyal','Regular','Churn Risk']);
    if (!valid.has(segment)) throw new Error('invalid segment');
    return {
      segment,
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence || 0.5))),
      rationale: String(parsed.rationale || '').slice(0, 500),
    };
  } catch (err) {
    const seg = heuristicSegmentFromNumbers(numericJson || {});
    return { segment: seg, confidence: 0.55, rationale: 'Heuristic fallback' };
  }
}

// POST /api/rag/segment-one { customerId }
router.post('/segment-one', async (req, res) => {
  try {
    const { customerId } = req.body || {};
    if (!customerId) return res.status(400).json({ error: 'customerId is required' });
    const profile = await buildCustomerProfileText(customerId);
    if (!profile) return res.status(404).json({ error: 'Customer not found' });

    const embedding = await getEmbedding(profile.text);
    const embeddingLiteral = toSqlVector(embedding);

    // Upsert profile + embedding
    await sequelize.query(
      `INSERT INTO customer_profiles_vec (customer_id, num_orders, total_spend, days_since_last_order, visits, age, location, profile_json, embedding, updated_at)
       VALUES (:customerId, :num_orders, :total_spend, :days_since_last_order, :visits, :age, :location, :profile_json::jsonb, :embedding::vector, NOW())
       ON CONFLICT (customer_id) DO UPDATE SET
         num_orders = EXCLUDED.num_orders,
         total_spend = EXCLUDED.total_spend,
         days_since_last_order = EXCLUDED.days_since_last_order,
         visits = EXCLUDED.visits,
         age = EXCLUDED.age,
         location = EXCLUDED.location,
         profile_json = EXCLUDED.profile_json,
         embedding = EXCLUDED.embedding,
         updated_at = NOW();`,
      {
        replacements: {
          customerId,
          num_orders: profile.json.num_orders,
          total_spend: profile.json.total_spend,
          days_since_last_order: profile.json.days_since_last_order,
          visits: profile.json.visits,
          age: profile.json.age,
          location: profile.json.location,
          profile_json: JSON.stringify(profile.json),
          embedding: embeddingLiteral,
        },
      }
    );

    // Recommend segment
    const rec = await recommendSegmentForProfile(profile.text, profile.json);
    await sequelize.query(
      `UPDATE customers SET rag_recommended_segment = :segment, rag_confidence = :confidence, rag_rationale = :rationale, last_segmented_at = NOW() WHERE customer_id = :customerId`,
      { replacements: { customerId, segment: rec.segment, confidence: rec.confidence, rationale: rec.rationale } }
    );

    return res.json({ success: true, recommendation: rec });
  } catch (err) {
    console.error('segment-one failed:', err);
    return res.status(500).json({ error: 'Segmentation failed' });
  }
});

// POST /api/rag/segment-all { limit? }
router.post('/segment-all', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.body?.limit, 10) || 200, 1000);
    const [customers] = await sequelize.query(
      `SELECT customer_id FROM customers ORDER BY created_at DESC LIMIT :limit`,
      { replacements: { limit } }
    );

    const results = [];
    for (const row of customers) {
      // eslint-disable-next-line no-await-in-loop
      const profile = await buildCustomerProfileText(row.customer_id);
      if (!profile) continue;
      // eslint-disable-next-line no-await-in-loop
      const embedding = await getEmbedding(profile.text);
      const embeddingLiteral = toSqlVector(embedding);
      // eslint-disable-next-line no-await-in-loop
      await sequelize.query(
        `INSERT INTO customer_profiles_vec (customer_id, num_orders, total_spend, days_since_last_order, visits, age, location, profile_json, embedding, updated_at)
         VALUES (:customerId, :num_orders, :total_spend, :days_since_last_order, :visits, :age, :location, :profile_json::jsonb, :embedding::vector, NOW())
         ON CONFLICT (customer_id) DO UPDATE SET
           num_orders = EXCLUDED.num_orders,
           total_spend = EXCLUDED.total_spend,
           days_since_last_order = EXCLUDED.days_since_last_order,
           visits = EXCLUDED.visits,
           age = EXCLUDED.age,
           location = EXCLUDED.location,
           profile_json = EXCLUDED.profile_json,
           embedding = EXCLUDED.embedding,
           updated_at = NOW();`,
        {
          replacements: {
            customerId: row.customer_id,
            num_orders: profile.json.num_orders,
            total_spend: profile.json.total_spend,
            days_since_last_order: profile.json.days_since_last_order,
            visits: profile.json.visits,
            age: profile.json.age,
            location: profile.json.location,
            profile_json: JSON.stringify(profile.json),
            embedding: embeddingLiteral,
          },
        }
      );
      // eslint-disable-next-line no-await-in-loop
      const rec = await recommendSegmentForProfile(profile.text, profile.json);
      // eslint-disable-next-line no-await-in-loop
      await sequelize.query(
        `UPDATE customers SET rag_recommended_segment = :segment, rag_confidence = :confidence, rag_rationale = :rationale, last_segmented_at = NOW() WHERE customer_id = :customerId`,
        { replacements: { customerId: row.customer_id, segment: rec.segment, confidence: rec.confidence, rationale: rec.rationale } }
      );
      results.push({ customerId: row.customer_id, ...rec });
    }

    return res.json({ count: results.length, results });
  } catch (err) {
    console.error('segment-all failed:', err);
    return res.status(500).json({ error: 'Segmentation failed' });
  }
});

// --- Segment recommendations (LLM-generated rules) ---
async function getDatasetSummary() {
  const [summ] = await sequelize.query(
    `WITH cust AS (
        SELECT COUNT(*)::int AS customers,
               COALESCE(AVG(total_orders),0)::numeric(12,2) AS avg_orders,
               COALESCE(AVG(total_amount),0)::numeric(12,2) AS avg_spend,
               COALESCE(MAX(total_amount),0)::numeric(12,2) AS max_spend,
               COALESCE(MIN(total_amount),0)::numeric(12,2) AS min_spend,
               COALESCE(AVG(age),0)::numeric(12,2) AS avg_age
        FROM customers
    ), rec AS (
        SELECT COALESCE(EXTRACT(DAY FROM NOW() - MAX(o.order_date)), 999999)::int AS days_since_last_any
        FROM orders o
    ), visits AS (
        SELECT COALESCE(AVG(vcount),0)::numeric(12,2) AS avg_visits FROM (
            SELECT c.customer_id, SUM(CASE WHEN i.interaction_type = 'Visit' THEN 1 ELSE 0 END) AS vcount
            FROM customers c
            LEFT JOIN interactions i ON i.customer_id = c.customer_id
            GROUP BY c.customer_id
        ) t
    ), loc AS (
        SELECT json_agg(x) AS top_locations FROM (
            SELECT location, COUNT(*) AS cnt
            FROM customers
            WHERE COALESCE(location,'') <> ''
            GROUP BY location
            ORDER BY cnt DESC
            LIMIT 5
        ) x
    )
    SELECT row_to_json(cust) AS cust, row_to_json(rec) AS rec, row_to_json(visits) AS visits, row_to_json(loc) AS loc
    FROM cust, rec, visits, loc;`
  );
  const row = summ[0] || {};
  return {
    customers: row.cust?.customers || 0,
    avg_orders: String(row.cust?.avg_orders || '0'),
    avg_spend: String(row.cust?.avg_spend || '0'),
    max_spend: String(row.cust?.max_spend || '0'),
    min_spend: String(row.cust?.min_spend || '0'),
    avg_age: String(row.cust?.avg_age || '0'),
    days_since_last_any: row.rec?.days_since_last_any || null,
    avg_visits: String(row.visits?.avg_visits || '0'),
    top_locations: row.loc?.top_locations || [],
  };
}

function coerceSuggestionRules(rules) {
  const validFields = new Set(['totalSpend','totalOrders','visits','lastPurchase','registrationDate','age','location']);
  const validOps = new Set(['gte','lte','eq','gt','lt','contains','not_contains']);
  const out = [];
  if (Array.isArray(rules)) {
    for (const r of rules) {
      const field = String(r.field || '').trim();
      const operator = String(r.operator || '').trim();
      const value = r.value ?? '';
      if (validFields.has(field) && validOps.has(operator)) {
        out.push({ field, operator, value: String(value) });
      }
    }
  }
  return out.slice(0, 6);
}

function fallbackSuggestions(summary) {
  return [
    {
      name: 'VIP Spenders',
      description: 'Top spenders with high lifetime value',
      rules: [
        { field: 'totalSpend', operator: 'gte', value: '10000' },
        { field: 'totalOrders', operator: 'gte', value: '10' }
      ]
    },
    {
      name: 'Loyal Regulars',
      description: 'Frequent buyers with steady orders',
      rules: [
        { field: 'totalOrders', operator: 'gte', value: '5' },
        { field: 'totalSpend', operator: 'gte', value: '5000' }
      ]
    },
    {
      name: 'Churn Risk',
      description: 'Customers with long inactivity',
      rules: [
        { field: 'lastPurchase', operator: 'lte', value: '180' }
      ]
    },
    {
      name: 'New Customers',
      description: 'Recently registered users',
      rules: [
        { field: 'registrationDate', operator: 'gte', value: '30' }
      ]
    }
  ];
}

// POST /api/rag/recommendations { limit? }
router.post('/recommendations', async (req, res) => {
  try {
    const summary = await getDatasetSummary();
    // Ask Gemini to propose 3-6 segment suggestions with strict schema
    const prompt = `You are a CRM segmentation expert. Given the dataset summary below, propose 3-6 audience segment suggestions.
Return STRICT JSON array. Each item must be: {"name": string, "description": string, "rules": Array<{"field": "totalSpend"|"totalOrders"|"visits"|"lastPurchase"|"registrationDate"|"age"|"location", "operator": "gte"|"lte"|"eq"|"gt"|"lt"|"contains"|"not_contains", "value": string}>}.
No markdown, no explanations. Only JSON.

Summary:\n${JSON.stringify(summary)}\n`;
    let raw = '';
    if (hasGemini) {
      const result = await llmModel.generateContent(prompt);
      raw = result?.response?.text?.() || '';
    }
    let suggestions = [];
    try {
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        suggestions = parsed.map((s) => ({
          name: String(s.name || '').slice(0, 80),
          description: String(s.description || '').slice(0, 280),
          rules: coerceSuggestionRules(s.rules),
        })).filter((s) => s.name && s.rules.length);
      }
    } catch (_) {
      suggestions = [];
    }
    if (!suggestions.length) suggestions = fallbackSuggestions(summary);
    return res.json({ summary, suggestions });
  } catch (err) {
    console.error('recommendations failed:', err);
    return res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});
