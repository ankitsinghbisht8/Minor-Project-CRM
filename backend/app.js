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
const segmentsRoutes = require('./routes/segments');

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
app.use('/api', segmentsRoutes);

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

