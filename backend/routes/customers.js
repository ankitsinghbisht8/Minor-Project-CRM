const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');

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

module.exports = router;


