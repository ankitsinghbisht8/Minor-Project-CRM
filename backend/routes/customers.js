const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

// POST /api/customers - create a new customer
router.post('/', async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone_number,
            age,
            gender,
            location,
            preferred_category,
            mode_of_communication,
            subscribed
        } = req.body || {}

        if (!full_name || !String(full_name).trim()) {
            return res.status(400).json({ error: 'full_name is required' })
        }
        if (!email || !String(email).trim()) {
            return res.status(400).json({ error: 'email is required' })
        }

        const clean = (v) => (v === '' || typeof v === 'undefined' ? null : v)
        const cleanInt = (v) => (v === '' || v === null || typeof v === 'undefined' ? null : Number(v))

        const [rows] = await sequelize.query(
            `INSERT INTO customers (
                full_name, email, phone_number, age, gender, location, preferred_category,
                mode_of_communication, subscribed, created_at, updated_at
            ) VALUES (
                :full_name, :email, :phone_number, :age, :gender, :location, :preferred_category,
                :mode_of_communication, COALESCE(:subscribed, TRUE), NOW(), NOW()
            ) RETURNING customer_id, full_name, email, phone_number, age, gender, location,
              preferred_category, mode_of_communication, total_orders, total_amount, created_at, updated_at`,
            {
                replacements: {
                    full_name: String(full_name).trim(),
                    email: String(email).trim(),
                    phone_number: clean(phone_number),
                    age: cleanInt(age),
                    gender: clean(gender),
                    location: clean(location),
                    preferred_category: clean(preferred_category),
                    mode_of_communication: mode_of_communication || null,
                    subscribed: typeof subscribed === 'boolean' ? subscribed : null,
                }
            }
        )

        return res.status(201).json(rows[0])
    } catch (err) {
        const code = err?.original?.code || err?.parent?.code
        if (code === '23505') {
            return res.status(409).json({ error: 'Email already exists' })
        }
        console.error('Create customer failed:', err.message)
        return res.status(500).json({ error: 'Failed to create customer' })
    }
})

// GET /api/customers
// Query params: page, limit, search, location, minOrders, segment, subscribed, sortBy, sortDir
router.get('/', async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const offset = (page - 1) * limit;
        const { search, location, minOrders, segment, subscribed, sortBy, sortDir } = req.query;

        const conditions = [];
        const params = {};

        if (search) {
            conditions.push('(LOWER(full_name) LIKE :search OR LOWER(email) LIKE :search)');
            params.search = `%${String(search).toLowerCase()}%`;
        }
        if (location) {
            conditions.push('LOWER(location) = :location');
            params.location = String(location).toLowerCase();
        }
        if (minOrders) {
            conditions.push('total_orders >= :minOrders');
            params.minOrders = Number(minOrders);
        }
        if (segment) {
            conditions.push('LOWER(customer_segment) = :segment');
            params.segment = String(segment).toLowerCase();
        }
        if (typeof subscribed !== 'undefined') {
            conditions.push('subscribed = :subscribed');
            params.subscribed = String(subscribed) === 'true';
        }

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const sortableColumns = new Set(['created_at', 'total_orders', 'total_amount', 'full_name']);
        const orderColumn = sortableColumns.has(String(sortBy)) ? String(sortBy) : 'created_at';
        const orderDirection = String(sortDir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

        const listSql = `SELECT customer_id, full_name, email, phone_number, age, gender, location, preferred_category,
            mode_of_communication, total_orders, total_amount, last_visited, last_contacted, customer_segment, subscribed,
            rag_recommended_segment, rag_confidence, rag_rationale, last_segmented_at,
            created_at, updated_at
            FROM customers
            ${whereClause}
            ORDER BY ${orderColumn} ${orderDirection}
            LIMIT :limit OFFSET :offset`;

        const countSql = `SELECT COUNT(*)::int AS total FROM customers ${whereClause}`;

        const [rows] = await sequelize.query(listSql, { replacements: { ...params, limit, offset } });
        const [countRows] = await sequelize.query(countSql, { replacements: params });

        res.json({
            page,
            limit,
            total: countRows[0]?.total || 0,
            data: rows
        });
    } catch (err) {
        console.error('List customers failed:', err.message);
        res.status(500).json({ error: 'Failed to list customers' });
    }
});

// GET /api/customers/:id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const detailSql = `SELECT * FROM customers WHERE customer_id = :id`;
        const [rows] = await sequelize.query(detailSql, { replacements: { id } });
        if (!rows.length) return res.status(404).json({ error: 'Customer not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error('Get customer failed:', err.message);
        res.status(500).json({ error: 'Failed to get customer' });
    }
});

// GET /api/customers/:id/orders
router.get('/:id/orders', async (req, res) => {
    try {
        const { id } = req.params;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const offset = (page - 1) * limit;
        const status = req.query.status;
        const conditions = ['customer_id = :id'];
        const params = { id };
        if (status) {
            conditions.push('order_status = :status');
            params.status = status;
        }
        const whereClause = `WHERE ${conditions.join(' AND ')}`;

        const listSql = `SELECT order_id, order_date, order_amount, category, order_status, payment_method, created_at
            FROM orders
            ${whereClause}
            ORDER BY order_date DESC
            LIMIT :limit OFFSET :offset`;
        const countSql = `SELECT COUNT(*)::int AS total FROM orders ${whereClause}`;

        const [rows] = await sequelize.query(listSql, { replacements: { ...params, limit, offset } });
        const [countRows] = await sequelize.query(countSql, { replacements: params });
        res.json({ page, limit, total: countRows[0]?.total || 0, data: rows });
    } catch (err) {
        console.error('List customer orders failed:', err.message);
        res.status(500).json({ error: 'Failed to list customer orders' });
    }
});

// GET /api/customers/:id/interactions
router.get('/:id/interactions', async (req, res) => {
    try {
        const { id } = req.params;
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
        const offset = (page - 1) * limit;
        const type = req.query.type;
        const conditions = ['customer_id = :id'];
        const params = { id };
        if (type) {
            conditions.push('interaction_type = :type');
            params.type = type;
        }
        const whereClause = `WHERE ${conditions.join(' AND ')}`;

        const listSql = `SELECT interaction_id, interaction_type, interaction_date, notes
            FROM interactions
            ${whereClause}
            ORDER BY interaction_date DESC
            LIMIT :limit OFFSET :offset`;
        const countSql = `SELECT COUNT(*)::int AS total FROM interactions ${whereClause}`;

        const [rows] = await sequelize.query(listSql, { replacements: { ...params, limit, offset } });
        const [countRows] = await sequelize.query(countSql, { replacements: params });
        res.json({ page, limit, total: countRows[0]?.total || 0, data: rows });
    } catch (err) {
        console.error('List customer interactions failed:', err.message);
        res.status(500).json({ error: 'Failed to list customer interactions' });
    }
});

// POST /api/customers/:id/orders - create a new order for a customer
router.post('/:id/orders', async (req, res) => {
    const t = await sequelize.transaction()
    try {
        const { id } = req.params
        const {
            order_amount,
            category,
            order_status = 'Pending',
            payment_method = 'Card',
            order_date
        } = req.body || {}

        if (!order_amount || isNaN(Number(order_amount))) {
            await t.rollback()
            return res.status(400).json({ error: 'order_amount is required' })
        }

        const [custRows] = await sequelize.query('SELECT customer_id FROM customers WHERE customer_id = :id', { replacements: { id }, transaction: t })
        if (!custRows.length) {
            await t.rollback()
            return res.status(404).json({ error: 'Customer not found' })
        }

        const [rows] = await sequelize.query(
            `INSERT INTO orders (customer_id, order_date, order_amount, category, order_status, payment_method)
             VALUES (:id, COALESCE(:order_date, NOW()), :order_amount, :category, :order_status, :payment_method)
             RETURNING order_id, customer_id, order_date, order_amount, category, order_status, payment_method, created_at`,
            {
                replacements: {
                    id,
                    order_date: order_date || null,
                    order_amount: Number(order_amount),
                    category: category || null,
                    order_status,
                    payment_method
                },
                transaction: t
            }
        )

        // update aggregates for completed orders
        if (String(order_status).toLowerCase() === 'completed') {
            await sequelize.query(
                `UPDATE customers
                 SET total_orders = COALESCE(total_orders,0) + 1,
                     total_amount = COALESCE(total_amount,0) + :amount,
                     updated_at = NOW()
                 WHERE customer_id = :id`,
                { replacements: { id, amount: Number(order_amount) }, transaction: t }
            )
        }

        await t.commit()
        return res.status(201).json(rows[0])
    } catch (err) {
        await t.rollback()
        console.error('Create order failed:', err.message)
        return res.status(500).json({ error: 'Failed to create order' })
    }
})

module.exports = router;


