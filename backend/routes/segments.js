const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { buildAST } = require('../services/segments/ASTBuilder');
const { calculateAudience, validateAST } = require('../services/segments/AudienceEvaluator');
const Segments = require('../Models/segments/Segments');
const SegmentRules = require('../Models/segments/segmentRules');
const SegmentMetaData = require('../Models/segments/segmentMetaData');
const Users = require('../Models/users');

// Get all created segments
router.get('/segments', async (req, res) => {
    try {
        const segments = await Segments.findAll({
            order: [['createdAt', 'DESC']]
        });
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

// Get customers for a segment based on its rules
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

        // Get customers using AST evaluator
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
            offset: parseInt(offset)
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


//Create Segment
router.post('/segments', async (req, res) => {
    try {
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

        console.log('User ID for segment creation:', userId);

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

        // Build rules AST from frontend payload
        const { rules, rulesText, name, description, audienceSize } = req.body || {};

        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Segment name is required' });
        }
        if (!description || !description.trim()) {
            return res.status(400).json({ error: 'Segment description is required' });
        }

        // Check if segment name already exists
        const existingSegment = await Segments.findOne({ where: { name: name.trim() } });
        if (existingSegment) {
            return res.status(400).json({ error: 'A segment with this name already exists' });
        }

        // Frontend may send mixed list; backend ASTBuilder expects a Map-like sequence
        let rulesAst = {};
        try {
            // Accept both DSL entries and mixed rules array
            if (Array.isArray(req.body?.dsl)) {
                console.log('Processing DSL:', req.body.dsl);
                
                // Validate DSL structure - should be array of [key, value] pairs
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

        console.log('Creating metadata with:', { metaData });
        const metaDataRow = await SegmentMetaData.create({ metaData });
        if (!metaDataRow) {
            return res.status(500).json({ error: 'MetaData creation failed' });
        }

        console.log('Creating rules with:', { 
            name: rulesText || name, 
            rules: rulesAst, 
            createdBy: userId 
        });
        const rulesRow = await SegmentRules.create({ name: rulesText || name, rules: rulesAst, createdBy: userId });
        if (!rulesRow) {
            return res.status(500).json({ error: 'Rules creation failed' });
        }

        console.log('Creating segment with:', {
            name,
            description,
            segmentRulesId: rulesRow.id,
            segmentMetaDataId: metaDataRow.id,
            createdBy: userId,
            audienceSize: Number(audienceSize) || 0,
        });
        const segment = await Segments.create({
            name,
            description,
            segmentRulesId: rulesRow.id,
            segmentMetaDataId: metaDataRow.id,
            createdBy: userId,
            audienceSize: Number(audienceSize) || 0,
        });
        if (!segment) {
            return res.status(500).json({ error: 'Segment creation failed' });
        }
        return res.status(201).json({ success: true, message: 'Segment created successfully', segment });
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