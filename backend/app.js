const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport');
const sequelize = require('./config/database');
const Users = require('./Models/users');
const Campaign = require('./Models/campaigns');
const googleAuthRoutes = require('./auth/googleAuth');
const jwtAuthRoutes = require('./auth/jwtAuthRoute');
const cookieParser = require('cookie-parser');
const ragRoutes = require('./routes/rag');
// const { authenticateToken } = require('./middleware/auth');
const customersRoutes = require('./routes/customers');
const segmentsRoutes = require('./routes/segments');
const campaignsRoutes = require('./routes/campaigns');
const ordersRoutes = require('./routes/orders');

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
// Backward/alias route to avoid 404 if frontend points to singular path
app.use('/api/customer', customersRoutes);
app.use('/api', segmentsRoutes);
app.use('/api', campaignsRoutes);
app.use('/api/orders', ordersRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend is running!',
        database: 'PostgreSQL with Neon',
        timestamp: new Date().toISOString()
    });
});

// Segmentation routes moved to routes/segments.js

// Sync database models
const syncDatabase = async () => {
    try {
        // Pre-flight repair: ensure campaigns table either doesn't exist or has proper id PK
        try {
            const [[exists]] = await sequelize.query(
                "SELECT to_regclass('public.campaigns') IS NOT NULL AS exists"
            );
            if (exists && (exists.exists === true || exists.exists === 't')) {
                const [colRows] = await sequelize.query(
                    "SELECT column_name FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'id'"
                );
                const hasId = Array.isArray(colRows) && colRows.length > 0;
                if (!hasId) {
                    // If legacy table has no rows, drop and recreate
                    const [[countRow]] = await sequelize.query("SELECT COUNT(*)::int AS count FROM campaigns");
                    const count = countRow?.count || 0;
                    if (count === 0) {
                        await sequelize.query('DROP TABLE IF EXISTS campaigns CASCADE');
                        console.log("Dropped legacy 'campaigns' table without 'id'");
                    } else {
                        // Attempt in-place repair with pgcrypto for gen_random_uuid()
                        try { await sequelize.query('CREATE EXTENSION IF NOT EXISTS pgcrypto'); } catch (_) {}
                        await sequelize.query('ALTER TABLE campaigns ADD COLUMN id uuid');
                        await sequelize.query('UPDATE campaigns SET id = gen_random_uuid() WHERE id IS NULL');
                        await sequelize.query('ALTER TABLE campaigns ADD PRIMARY KEY (id)');
                        await sequelize.query('ALTER TABLE campaigns ALTER COLUMN id SET NOT NULL');
                        await sequelize.query('ALTER TABLE campaigns ALTER COLUMN id SET DEFAULT gen_random_uuid()');
                        console.log("Repaired legacy 'campaigns' table and added primary key");
                    }
                }
            }
        } catch (preErr) {
            console.warn('Pre-flight campaigns table repair skipped:', preErr.message);
        }

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

