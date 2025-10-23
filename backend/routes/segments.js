const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { buildAST } = require('../services/segments/ASTBuilder');
const { calculateAudience, validateAST } = require('../services/segments/AudienceEvaluator');
const Segments = require('../Models/segments/Segments');
const SegmentRules = require('../Models/segments/segmentRules');
const SegmentMetaData = require('../Models/segments/segmentMetaData');
const SegmentMembers = require('../Models/segments/segmentMembers');
const Users = require('../Models/users');

// Get all created segments
router.get('/segments', async (req, res) => {
    try {
        const segments = await Segments.findAll({
            order: [['createdAt', 'DESC']]
        });
        console.log("Segments data:", segments);
        res.json(segments);
    } catch (err) {
        console.error('Failed to fetch segments:', err.message);
        res.status(500).json({ error: 'Failed to fetch segments' });
    }
});

// Get specific segment by ID
router.get('/segments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const segment = await Segments.findByPk(id);
        
        if (!segment) {
            return res.status(404).json({ error: 'Segment not found' });
        }
        
        res.json(segment);
    } catch (err) {
        console.error('Failed to fetch segment:', err.message);
        res.status(500).json({ error: 'Failed to fetch segment' });
    }
});

// Calculate audience size based on rules (using AST)
router.post('/segments/calculate-audience', async (req, res) => {
    try {
        const { dsl, rules } = req.body;

        if (!dsl || !Array.isArray(dsl)) {
            return res.status(400).json({ error: 'DSL is required' });
        }

        // Build AST from DSL
        const map = new Map(dsl);
        const ast = buildAST(map);

        console.log('[Calculate Audience] AST:', JSON.stringify(ast, null, 2));

        // Validate AST
        const validation = validateAST(ast);
        if (!validation.valid) {
            console.error('[Calculate Audience] Invalid AST:', validation.errors);
            return res.status(400).json({ 
                error: 'Invalid segment rules', 
                details: validation.errors 
            });
        }

        // Calculate audience using AST evaluator
        const result = await calculateAudience(ast, { 
            returnCustomers: false 
        });

        console.log('[Calculate Audience] Result:', result.audienceSize);

        res.json({ 
            audienceSize: result.audienceSize,
            whereClause: result.whereClause // For debugging
        });
    } catch (err) {
        console.error('Audience calculation failed:', err.message);
        console.error('Full error:', err);
        res.status(500).json({ 
            error: 'Failed to calculate audience size', 
            details: err.message 
        });
    }
});

// Get customers for a segment (re-evaluates rules in real-time)
router.get('/segments/:id/customers', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 100, offset = 0 } = req.query;

        // Find the segment
        const segment = await Segments.findByPk(id);
        if (!segment) {
            return res.status(404).json({ error: 'Segment not found' });
        }

        // Get the segment rules
        const segmentRules = await SegmentRules.findByPk(segment.segmentRulesId);
        if (!segmentRules || !segmentRules.rules) {
            return res.status(400).json({ error: 'Segment rules not found' });
        }

        const ast = segmentRules.rules;
        console.log('[Get Segment Customers] Segment:', segment.name, 'AST:', JSON.stringify(ast, null, 2));

        // Validate AST
        const validation = validateAST(ast);
        if (!validation.valid) {
            console.error('[Get Segment Customers] Invalid AST:', validation.errors);
            return res.status(400).json({ 
                error: 'Invalid segment rules', 
                details: validation.errors 
            });
        }

        // Get customers using AST evaluator (real-time evaluation)
        const result = await calculateAudience(ast, { 
            returnCustomers: true,
            limit: parseInt(limit)
        });

        console.log('[Get Segment Customers] Found:', result.audienceSize, 'customers');

        res.json({ 
            segmentId: id,
            segmentName: segment.name,
            audienceSize: result.audienceSize,
            customers: result.customers,
            limit: parseInt(limit),
            offset: parseInt(offset),
            source: 'real-time-evaluation'
        });
    } catch (err) {
        console.error('Failed to get segment customers:', err.message);
        console.error('Full error:', err);
        res.status(500).json({ 
            error: 'Failed to get segment customers', 
            details: err.message 
        });
    }
});

// Get stored segment members (from segment_members table)
router.get('/segments/:id/members', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit = 100, offset = 0 } = req.query;

        // Find the segment
        const segment = await Segments.findByPk(id);
        if (!segment) {
            return res.status(404).json({ error: 'Segment not found' });
        }

        // Get segment members from the database
        const query = `
            SELECT 
                sm.id as membership_id,
                sm.created_at as added_to_segment,
                c.customer_id,
                c.full_name,
                c.email,
                c.phone_number,
                c.age,
                c.location,
                c.total_orders,
                c.total_amount
            FROM segment_members sm
            JOIN customers c ON sm."customerId" = c.customer_id
            WHERE sm."segmentId" = :segmentId
            ORDER BY sm.created_at DESC
            LIMIT :limit OFFSET :offset
        `;

        const countQuery = `
            SELECT COUNT(*) as count
            FROM segment_members
            WHERE "segmentId" = :segmentId
        `;

        const [members] = await sequelize.query(query, {
            replacements: { 
                segmentId: id, 
                limit: parseInt(limit), 
                offset: parseInt(offset) 
            }
        });

        const [countResult] = await sequelize.query(countQuery, {
            replacements: { segmentId: id }
        });

        const totalMembers = parseInt(countResult[0]?.count || 0);

        console.log('[Get Segment Members] Segment:', segment.name, 'Members:', totalMembers);

        res.json({
            segmentId: id,
            segmentName: segment.name,
            totalMembers,
            members,
            limit: parseInt(limit),
            offset: parseInt(offset),
            source: 'stored-snapshot'
        });
    } catch (err) {
        console.error('Failed to get segment members:', err.message);
        console.error('Full error:', err);
        res.status(500).json({ 
            error: 'Failed to get segment members', 
            details: err.message 
        });
    }
});


//Create Segment
router.post('/segments', async (req, res) => {
    try {
        // Log the start time for progress tracking
        const startTime = Date.now();
        console.log('[Segment Creation] Started at', new Date().toISOString());
        
        let userId = req.user?.id || null;
        console.log('User ID for segment creation:', userId);
        
        // Resolve a fallback user in non-production if not authenticated
        if (!userId) {
            const defaultEmail = process.env.DEFAULT_USER_EMAIL;
            let user = null;
            if (defaultEmail) {
                user = await Users.findOne({ where: { email: defaultEmail } });
            }
            if (!user) {
                user = await Users.findOne();
            }
            if (!user && process.env.NODE_ENV !== 'production') {
                user = await Users.create({
                    name: 'Auto Admin',
                    email: defaultEmail || 'admin@example.com',
                    role: 'admin',
                });
            }
            userId = user?.id || null;
        }
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        console.log('[Step 1/11] User authenticated:', userId);

        // MetaData for the segment
        const metaData = {
            "version": 1,
            "metrics": {
              "population": {
                "current": 0,
                "history": [
                  { "date": new Date().toISOString().split("T")[0], "count": 0 }
                ],
                "growthRate": 0
              },
              "engagement": {
                "avgOpenRate": 0,
                "avgClickRate": 0,
                "avgConversionRate": 0,
                "lastCampaign": {
                  "id": "NA",
                  "conversionRate": 0
                }
              },
              "value": {
                "avgRevenuePerUser": 0,
                "lifetimeValue": 0,
                "avgDealSize": 0
              },
              "retention": {
                "churnRate":0,
                "retentionRate": 0,
                "avgEngagementDuration": "NA"
              }
            },
            "audit": {
              "lastEvaluated": new Date().toISOString().split("T")[0],
              "createdBy": "admin_user",
              "updatedBy": "sujal"
            }
          };

        // Step 2: Validate input
        console.log('[Step 2/11] Validating segment data...');
        const { rules, rulesText, name, description, audienceSize } = req.body || {};

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Segment name is required' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ error: 'Segment description is required' });
        }

        const existingSegment = await Segments.findOne({ where: { name: name.trim() } });
        if (existingSegment) {
            return res.status(400).json({ error: 'A segment with this name already exists' });
        }

        // Step 3: Build AST
        console.log('[Step 3/11] Building segment rules AST...');
        
        let rulesAst = {};
        try {
            // Accept both DSL entries and mixed rules array
            if (Array.isArray(req.body?.dsl)) {
                console.log('Processing DSL:', req.body.dsl);
                
                // Validate DSL structure - shou
                // 
                // ld be array of [key, value] pairs
                if (!req.body.dsl.every(pair => Array.isArray(pair) && pair.length === 2)) {
                    console.error('Invalid DSL structure:', req.body.dsl);
                    return res.status(400).json({ error: 'Invalid DSL structure. Expected array of [key, value] pairs.' });
                }
                
                const m = new Map(req.body.dsl);
                console.log('DSL Map:', m);
                rulesAst = buildAST(m);
                console.log('Generated AST:', rulesAst);
            } else if (Array.isArray(rules)) {
                const operatorValueToSymbol = {
                    gte: ">=",
                    lte: "<=",
                    eq: "==",
                    gt: ">",
                    lt: "<",
                    contains: "contains",
                    not_contains: "not_contains",
                };
                const m = new Map();
                const firstOp = (rules.find(x => x.kind === 'op')?.op) || 'AND';
                m.set('operator', firstOp);
                let prevRuleId = null;
                rules.forEach(item => {
                    if (item.kind === 'rule') {
                        m.set(`rule-${item.id}`, {
                            id: item.id,
                            field: item.field,
                            operator: operatorValueToSymbol[item.operator] || item.operator,
                            value: item.value,
                        });
                        if (prevRuleId !== null) {
                            m.set(`op-${prevRuleId}_${item.id}`, firstOp);
                        }
                        prevRuleId = item.id;
                    }
                });
                rulesAst = buildAST(m);
            }
        } catch (e) {
            console.error('AST building error:', e);
            return res.status(400).json({ error: 'Invalid rules payload' });
        }

        // Step 4: Validate AST
        console.log('[Step 4/11] Validating segment rules...');
        const astValidation = validateAST(rulesAst);
        if (!astValidation.valid) {
            console.error('AST validation failed:', astValidation.errors);
            return res.status(400).json({ 
                error: 'Invalid segment rules', 
                details: astValidation.errors 
            });
        }

        // Step 5: Calculate audience
        console.log('[Step 5/11] Calculating audience size...');
        let actualAudienceSize = 0;
        let audienceCustomers = [];
        
        try {
            const audienceResult = await calculateAudience(rulesAst, { 
                returnCustomers: true
            });
            
            actualAudienceSize = audienceResult.audienceSize;
            audienceCustomers = audienceResult.customers || [];
            
            console.log('[Step 6/11] Found', actualAudienceSize, 'matching customers');
        } catch (evalError) {
            console.error('Audience evaluation failed:', evalError);
            return res.status(400).json({ 
                error: 'Failed to evaluate segment rules', 
                details: evalError.message 
            });
        }

        // Step 7: Create metadata
        console.log('[Step 7/11] Saving segment metadata...');
        const metaDataRow = await SegmentMetaData.create({ metaData });
        if (!metaDataRow) {
            return res.status(500).json({ error: 'MetaData creation failed' });
        }

        // Step 8: Create rules
        console.log('[Step 8/11] Saving segment rules...');
        const rulesRow = await SegmentRules.create({ 
            name: rulesText || name, 
            rules: rulesAst, 
            createdBy: userId 
        });
        if (!rulesRow) {
            return res.status(500).json({ error: 'Rules creation failed' });
        }

        // Step 9: Create segment
        console.log('[Step 9/11] Creating segment record...');
        const segment = await Segments.create({
            name,
            description,
            segmentRulesId: rulesRow.id,
            segmentMetaDataId: metaDataRow.id,
            createdBy: userId,
            audienceSize: actualAudienceSize,
        });
        if (!segment) {
            return res.status(500).json({ error: 'Segment creation failed' });
        }

        // Step 10: Store segment members
        console.log('[Step 10/11] Storing', audienceCustomers.length, 'segment members...');
        if (audienceCustomers.length > 0) {
            try {
                const segmentMembersData = audienceCustomers.map(customer => ({
                    segmentId: segment.id,
                    customerId: customer.customer_id
                }));
                
                await SegmentMembers.bulkCreate(segmentMembersData, {
                    ignoreDuplicates: true
                });
                
                console.log('[Step 11/11] Segment members stored successfully');
            } catch (memberError) {
                console.error('[Error] Failed to store segment members:', memberError);
            }
        }

        const duration = Date.now() - startTime;
        console.log('[Segment Creation] Completed in', duration, 'ms');

        return res.status(201).json({ 
            success: true, 
            message: 'Segment created successfully', 
            segment: {
                ...segment.toJSON(),
                actualAudienceSize,
                customersStored: audienceCustomers.length
            }
        });
    } catch (err) {
        console.error('Segment creation failed:', err.message);
        console.error('Full error details:', err);
        
        // Handle specific validation errors
        if (err.name === 'SequelizeValidationError') {
            const validationErrors = err.errors.map(e => ({
                field: e.path,
                message: e.message,
                value: e.value
            }));
            console.error('Validation errors:', validationErrors);
            return res.status(400).json({ 
                error: `Validation error: ${err.message}`,
                details: validationErrors
            });
        }
        
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'A segment with this name already exists' });
        }
        
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ error: 'Invalid reference to related data' });
        }
        
        res.status(500).json({ error: 'Segment creation failed' });
    }
});

// Update segment
router.put('/segments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, rules, rulesText, audienceSize } = req.body;
        
        // Find the segment
        const segment = await Segments.findByPk(id);
        if (!segment) {
            return res.status(404).json({ error: 'Segment not found' });
        }

        // Update rules if provided
        if (rules) {
            let rulesAst = {};
            try {
                if (Array.isArray(req.body?.dsl)) {
                    const m = new Map(req.body.dsl);
                    rulesAst = buildAST(m);
                } else if (Array.isArray(rules)) {
                    const operatorValueToSymbol = {
                        gte: ">=", lte: "<=", eq: "==", gt: ">", lt: "<",
                        contains: "contains", not_contains: "not_contains",
                    };
                    const m = new Map();
                    const firstOp = (rules.find(x => x.kind === 'op')?.op) || 'AND';
                    m.set('operator', firstOp);
                    let prevRuleId = null;
                    rules.forEach(item => {
                        if (item.kind === 'rule') {
                            m.set(`rule-${item.id}`, {
                                id: item.id,
                                field: item.field,
                                operator: operatorValueToSymbol[item.operator] || item.operator,
                                value: item.value,
                            });
                            if (prevRuleId !== null) {
                                m.set(`op-${prevRuleId}_${item.id}`, firstOp);
                            }
                            prevRuleId = item.id;
                        }
                    });
                    rulesAst = buildAST(m);
                }
            } catch (e) {
                return res.status(400).json({ error: 'Invalid rules payload' });
            }

            // Update the rules
            await SegmentRules.update(
                { name: rulesText || name, rules: rulesAst },
                { where: { id: segment.segmentRulesId } }
            );
        }

        // Update segment
        await Segments.update(
            {
                name: name || segment.name,
                description: description || segment.description,
                audienceSize: audienceSize !== undefined ? Number(audienceSize) : segment.audienceSize,
            },
            { where: { id } }
        );

        res.json({ success: true, message: 'Segment updated successfully' });
    } catch (err) {
        console.error('Segment update failed:', err.message);
        res.status(500).json({ error: 'Segment update failed' });
    }
});

// Delete segment
router.delete('/segments/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const segment = await Segments.findByPk(id);
        if (!segment) {
            return res.status(404).json({ error: 'Segment not found' });
        }

        // Delete related records
        await SegmentRules.destroy({ where: { id: segment.segmentRulesId } });
        await SegmentMetaData.destroy({ where: { id: segment.segmentMetaDataId } });
        await Segments.destroy({ where: { id } });

        res.json({ success: true, message: 'Segment deleted successfully' });
    } catch (err) {
        console.error('Segment deletion failed:', err.message);
        res.status(500).json({ error: 'Segment deletion failed' });
    }
});

module.exports = router;