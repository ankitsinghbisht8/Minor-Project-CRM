const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport');
const sequelize = require('./config/database');
const Users = require('./Models/users');
const googleAuthRoutes = require('./auth/googleAuth');
const jwtAuthRoutes = require('./auth/jwtAuthRoute');
const cookieParser = require('cookie-parser');
const ragRoutes = require('./routes/rag');
// const { authenticateToken } = require('./middleware/auth');
const customersRoutes = require('./routes/customers');

// Basic setup
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(
    process.env.COOKIE_SECRET || 'your-cookie-secret-key'
    
));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Setting up CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Auth routes
app.use('/auth', googleAuthRoutes);
app.use('/api/auth', jwtAuthRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/customers', customersRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend is running!',
        database: 'PostgreSQL with Neon',
        timestamp: new Date().toISOString()
    });
});

// Segmentation endpoint (RFM + demographics)
app.get('/api/customers/segments', async (req, res) => {
    try {
        const query = `WITH agg AS (
            SELECT
                c.customer_id,
                c.full_name,
                SUM(CASE WHEN o.order_status = 'Completed' THEN 1 ELSE 0 END) AS num_orders,
                COALESCE(SUM(CASE WHEN o.order_status = 'Completed' THEN o.order_amount ELSE 0 END), 0) AS total_spend,
                MAX(CASE WHEN o.order_status = 'Completed' THEN o.order_date END) AS last_order_date,
                SUM(CASE WHEN i.interaction_type = 'Visit' THEN 1 ELSE 0 END) AS visits,
                c.age,
                c.location
            FROM customers c
            LEFT JOIN orders o ON c.customer_id = o.customer_id
            LEFT JOIN interactions i ON c.customer_id = i.customer_id
            GROUP BY c.customer_id, c.full_name, c.age, c.location
        )
        SELECT
          agg.*,
          COALESCE(EXTRACT(DAY FROM NOW() - agg.last_order_date), 999999)::int AS days_since_last_order,
          CASE
            WHEN total_spend > 20000 AND num_orders > 10 AND COALESCE(EXTRACT(DAY FROM NOW() - agg.last_order_date), 999999) < 30 THEN 'VIP'
            WHEN total_spend > 10000 AND num_orders > 5 THEN 'Loyal'
            WHEN COALESCE(EXTRACT(DAY FROM NOW() - agg.last_order_date), 999999) > 180 THEN 'Churn Risk'
            ELSE 'Regular'
          END AS segment
        FROM agg;`;
        const [rows] = await sequelize.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Segmentation query failed:', err.message);
        res.status(500).json({ error: 'Segmentation query failed' });
    }
});

// Backwards-compatible alias
app.get('/api/dashboard/segments', async (req, res) => {
    try {
        const query = `WITH agg AS (
            SELECT
                c.customer_id,
                c.full_name,
                SUM(CASE WHEN o.order_status = 'Completed' THEN 1 ELSE 0 END) AS num_orders,
                COALESCE(SUM(CASE WHEN o.order_status = 'Completed' THEN o.order_amount ELSE 0 END), 0) AS total_spend,
                MAX(CASE WHEN o.order_status = 'Completed' THEN o.order_date END) AS last_order_date,
                SUM(CASE WHEN i.interaction_type = 'Visit' THEN 1 ELSE 0 END) AS visits,
                c.age,
                c.location
            FROM customers c
            LEFT JOIN orders o ON c.customer_id = o.customer_id
            LEFT JOIN interactions i ON c.customer_id = i.customer_id
            GROUP BY c.customer_id, c.full_name, c.age, c.location
        )
        SELECT
          agg.*,
          COALESCE(EXTRACT(DAY FROM NOW() - agg.last_order_date), 999999)::int AS days_since_last_order,
          CASE
            WHEN total_spend > 20000 AND num_orders > 10 AND COALESCE(EXTRACT(DAY FROM NOW() - agg.last_order_date), 999999) < 30 THEN 'VIP'
            WHEN total_spend > 10000 AND num_orders > 5 THEN 'Loyal'
            WHEN COALESCE(EXTRACT(DAY FROM NOW() - agg.last_order_date), 999999) > 180 THEN 'Churn Risk'
            ELSE 'Regular'
          END AS segment
        FROM agg;`;
        const [rows] = await sequelize.query(query);
        res.json(rows);
    } catch (err) {
        console.error('Segmentation query failed:', err.message);
        res.status(500).json({ error: 'Segmentation query failed' });
    }
});

// Sync database models
const syncDatabase = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database models synchronized successfully');
    } catch (error) {
        console.error('Database sync failed:', error.message);
    }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(` Server is running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    await syncDatabase();
});

