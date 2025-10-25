const express = require('express')
const router = express.Router()
const sequelize = require('../config/database')

// GET /api/orders - list all orders with optional filters
// Query: page, limit, search (user name/email), status, payment, minAmount, maxAmount
router.get('/', async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100)
    const offset = (page - 1) * limit

    const { search, status, payment, minAmount, maxAmount } = req.query
    const conditions = []
    const params = {}

    if (search) {
      conditions.push('(LOWER(c.full_name) LIKE :search OR LOWER(c.email) LIKE :search)')
      params.search = `%${String(search).toLowerCase()}%`
    }
    if (status) {
      conditions.push('o.order_status = :status')
      params.status = status
    }
    if (payment) {
      conditions.push('o.payment_method = :payment')
      params.payment = payment
    }
    if (minAmount) {
      conditions.push('o.order_amount >= :minAmount')
      params.minAmount = Number(minAmount)
    }
    if (maxAmount) {
      conditions.push('o.order_amount <= :maxAmount')
      params.maxAmount = Number(maxAmount)
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const listSql = `SELECT o.order_id, o.customer_id, o.order_date, o.order_amount, o.category,
        o.order_status, o.payment_method, o.created_at,
        c.full_name, c.email
      FROM orders o
      JOIN customers c ON c.customer_id = o.customer_id
      ${whereClause}
      ORDER BY o.order_date DESC
      LIMIT :limit OFFSET :offset`
    const countSql = `SELECT COUNT(*)::int AS total FROM orders o JOIN customers c ON c.customer_id = o.customer_id ${whereClause}`

    const [rows] = await sequelize.query(listSql, { replacements: { ...params, limit, offset } })
    const [countRows] = await sequelize.query(countSql, { replacements: params })

    return res.json({ page, limit, total: countRows[0]?.total || 0, data: rows })
  } catch (err) {
    console.error('List orders failed:', err.message)
    return res.status(500).json({ error: 'Failed to list orders' })
  }
})

// POST /api/orders - create an order for a customer
router.post('/', async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { customer_id, order_amount, category, order_status = 'Completed', payment_method = 'Card', order_date } = req.body || {}
    if (!customer_id) { await t.rollback(); return res.status(400).json({ error: 'customer_id is required' }) }
    if (!order_amount || isNaN(Number(order_amount))) { await t.rollback(); return res.status(400).json({ error: 'order_amount is required' }) }

    const [custRows] = await sequelize.query('SELECT customer_id FROM customers WHERE customer_id = :id', { replacements: { id: customer_id }, transaction: t })
    if (!custRows.length) { await t.rollback(); return res.status(404).json({ error: 'Customer not found' }) }

    const [rows] = await sequelize.query(
      `INSERT INTO orders (customer_id, order_date, order_amount, category, order_status, payment_method)
       VALUES (:id, COALESCE(:order_date, NOW()), :order_amount, :category, :order_status, :payment_method)
       RETURNING order_id, customer_id, order_date, order_amount, category, order_status, payment_method, created_at`,
      { replacements: { id: customer_id, order_date: order_date || null, order_amount: Number(order_amount), category: category || null, order_status, payment_method }, transaction: t }
    )

    if (String(order_status).toLowerCase() === 'completed') {
      await sequelize.query(
        `UPDATE customers SET total_orders = COALESCE(total_orders,0) + 1, total_amount = COALESCE(total_amount,0) + :amount, updated_at = NOW() WHERE customer_id = :id`,
        { replacements: { id: customer_id, amount: Number(order_amount) }, transaction: t }
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

// GET /api/orders/metrics - counts and recent activity for dashboard
router.get('/metrics', async (_req, res) => {
  try {
    const [kpiRows] = await sequelize.query(`
      SELECT
        COALESCE(COUNT(*) FILTER (WHERE order_status = 'Completed'),0)::int AS completed_orders,
        COALESCE(COUNT(*)::int,0) AS total_orders,
        COALESCE(SUM(CASE WHEN order_status='Completed' THEN order_amount ELSE 0 END),0)::numeric(12,2) AS revenue,
        COALESCE(AVG(order_amount),0)::numeric(12,2) AS avg_order
      FROM orders
    `)

    const [recentOrders] = await sequelize.query(`
      SELECT o.order_id, o.order_date, o.order_amount, o.order_status, c.full_name
      FROM orders o JOIN customers c ON c.customer_id = o.customer_id
      ORDER BY o.order_date DESC
      LIMIT 5
    `)

    const [recentActivity] = await sequelize.query(`
      SELECT o.order_id as id, o.order_date as ts, 'Payment received' as title,
             c.full_name as subtitle, o.order_amount as amount
      FROM orders o JOIN customers c ON c.customer_id = o.customer_id
      ORDER BY o.order_date DESC
      LIMIT 6
    `)

    return res.json({ kpis: kpiRows[0] || {}, recentOrders, recentActivity })
  } catch (err) {
    console.error('Fetch order metrics failed:', err.message)
    return res.status(500).json({ error: 'Failed to load order metrics' })
  }
})

// PUT /api/orders/:id - update an order and fix aggregates if status/amount changes
router.put('/:id', async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { id } = req.params
    const [existingRows] = await sequelize.query(
      'SELECT order_id, customer_id, order_amount, order_status FROM orders WHERE order_id = :id',
      { replacements: { id }, transaction: t }
    )
    if (!existingRows.length) { await t.rollback(); return res.status(404).json({ error: 'Order not found' }) }
    const existing = existingRows[0]

    const allowed = ['order_date', 'order_amount', 'category', 'order_status', 'payment_method']
    const updates = []
    const params = { id }
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
        const value = req.body[key]
        if (key === 'order_amount') {
          updates.push('order_amount = :order_amount')
          params.order_amount = Number(value)
        } else if (key === 'order_date') {
          updates.push('order_date = COALESCE(:order_date, order_date)')
          params.order_date = value || null
        } else {
          updates.push(`${key} = :${key}`)
          params[key] = (value === '' || typeof value === 'undefined') ? null : value
        }
      }
    }
    if (!updates.length) { await t.rollback(); return res.status(400).json({ error: 'No fields to update' }) }

    // Adjust aggregates if the completion status or amount changed relative to Completed status
    const newStatus = Object.prototype.hasOwnProperty.call(params, 'order_status') ? String(params.order_status) : existing.order_status
    const newAmount = Object.prototype.hasOwnProperty.call(params, 'order_amount') ? Number(params.order_amount) : Number(existing.order_amount)
    const wasCompleted = String(existing.order_status).toLowerCase() === 'completed'
    const nowCompleted = String(newStatus).toLowerCase() === 'completed'

    // Run the updates
    const [rows] = await sequelize.query(
      `UPDATE orders SET ${updates.join(', ')} WHERE order_id = :id
       RETURNING order_id, customer_id, order_date, order_amount, category, order_status, payment_method, created_at`,
      { replacements: params, transaction: t }
    )

    if (wasCompleted && !nowCompleted) {
      // subtract previous amount and decrement order count
      await sequelize.query(
        `UPDATE customers SET total_orders = GREATEST(COALESCE(total_orders,0) - 1, 0), total_amount = COALESCE(total_amount,0) - :prevAmount, updated_at = NOW() WHERE customer_id = :cid`,
        { replacements: { cid: existing.customer_id, prevAmount: Number(existing.order_amount) }, transaction: t }
      )
    } else if (!wasCompleted && nowCompleted) {
      // add new amount and increment order count
      await sequelize.query(
        `UPDATE customers SET total_orders = COALESCE(total_orders,0) + 1, total_amount = COALESCE(total_amount,0) + :newAmount, updated_at = NOW() WHERE customer_id = :cid`,
        { replacements: { cid: existing.customer_id, newAmount }, transaction: t }
      )
    } else if (wasCompleted && nowCompleted && Number(existing.order_amount) !== newAmount) {
      // completed both before and after, adjust revenue delta
      const delta = newAmount - Number(existing.order_amount)
      if (delta !== 0) {
        await sequelize.query(
          `UPDATE customers SET total_amount = COALESCE(total_amount,0) + :delta, updated_at = NOW() WHERE customer_id = :cid`,
          { replacements: { cid: existing.customer_id, delta }, transaction: t }
        )
      }
    }

    await t.commit()
    return res.json(rows[0])
  } catch (err) {
    await t.rollback()
    console.error('Update order failed:', err.message)
    return res.status(500).json({ error: 'Failed to update order' })
  }
})

// DELETE /api/orders/:id - delete an order and adjust aggregates when needed
router.delete('/:id', async (req, res) => {
  const t = await sequelize.transaction()
  try {
    const { id } = req.params
    const [existingRows] = await sequelize.query(
      'SELECT order_id, customer_id, order_amount, order_status FROM orders WHERE order_id = :id',
      { replacements: { id }, transaction: t }
    )
    if (!existingRows.length) { await t.rollback(); return res.status(404).json({ error: 'Order not found' }) }
    const existing = existingRows[0]

    await sequelize.query('DELETE FROM orders WHERE order_id = :id', { replacements: { id }, transaction: t })

    if (String(existing.order_status).toLowerCase() === 'completed') {
      await sequelize.query(
        `UPDATE customers SET total_orders = GREATEST(COALESCE(total_orders,0) - 1, 0), total_amount = COALESCE(total_amount,0) - :amount, updated_at = NOW() WHERE customer_id = :cid`,
        { replacements: { cid: existing.customer_id, amount: Number(existing.order_amount) }, transaction: t }
      )
    }

    await t.commit()
    return res.status(204).send()
  } catch (err) {
    await t.rollback()
    console.error('Delete order failed:', err.message)
    return res.status(500).json({ error: 'Failed to delete order' })
  }
})

module.exports = router


