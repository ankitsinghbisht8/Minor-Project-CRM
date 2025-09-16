// rag.js
import pg from "pg";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL, // PostgreSQL connection
});
await client.connect();

// 🔹 Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Embedding model
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
// LLM model
const llmModel = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Generate embedding for text using Gemini
 */
async function getEmbedding(text) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values; // Array of floats
}

/**
 * Upsert customer embedding into Postgres
 */
export async function upsertCustomerEmbedding(customerId, profileText, profileJson = {}) {
  const vector = await getEmbedding(profileText);

  await client.query(
    `INSERT INTO customer_profiles_vec (customer_id, profile_json, embedding, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (customer_id)
     DO UPDATE SET profile_json = EXCLUDED.profile_json, 
                   embedding = EXCLUDED.embedding,
                   updated_at = NOW();`,
    [customerId, profileJson, vector]
  );
}

/**
 * Semantic search over customer profiles
 */
export async function searchSimilarCustomers(query, topK = 5) {
  const queryEmbedding = await getEmbedding(query);

  const result = await client.query(
    `SELECT customer_id, profile_json
     FROM customer_profiles_vec
     ORDER BY embedding <-> $1::vector
     LIMIT $2;`,
    [queryEmbedding, topK]
  );

  return result.rows;
}

/**
 * RAG Query:
 * 1. Semantic search in Postgres
 * 2. Feed results + query into Gemini LLM
 */
export async function ragQuery(query) {
  const similarCustomers = await searchSimilarCustomers(query, 5);

  // Build context from retrieved profiles
  const context = similarCustomers
    .map(
      (c, i) =>
        `Customer ${i + 1} (ID: ${c.customer_id}): ${JSON.stringify(c.profile_json)}`
    )
    .join("\n\n");

  const prompt = `
  You are a CRM assistant. Answer the user query using the context below.
  If context is not relevant, say "No relevant customer information found."

  Context:
  ${context}

  Query: ${query}
  Answer:
  `;

  const result = await llmModel.generateContent(prompt);
  return result.response.text();
}
