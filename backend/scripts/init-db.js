const dotenv = require('dotenv');
dotenv.config();

const sequelize = require('../config/database');

async function init() {
    const statements = [
        `CREATE EXTENSION IF NOT EXISTS pgcrypto;`,
        `CREATE EXTENSION IF NOT EXISTS vector;`,
        `CREATE TABLE IF NOT EXISTS customers (
            customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            full_name VARCHAR(100),
            email VARCHAR(100) UNIQUE,
            phone_number VARCHAR(15),
            age INT,
            gender VARCHAR(10),
            location VARCHAR(100),
            preferred_category VARCHAR(50),
            mode_of_communication VARCHAR(20) CHECK (mode_of_communication IN ('SMS','WhatsApp','Email','Call','In-App')),
            total_orders INT DEFAULT 0,
            total_amount NUMERIC(12,2) DEFAULT 0,
            last_visited TIMESTAMP,
            last_contacted TIMESTAMP,
            customer_segment VARCHAR(50),
            subscribed BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );`,
        `CREATE TABLE IF NOT EXISTS orders (
            order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE,
            order_date TIMESTAMP DEFAULT NOW(),
            order_amount NUMERIC(10,2) NOT NULL,
            category VARCHAR(50),
            order_status VARCHAR(20) CHECK (order_status IN ('Pending','Completed','Cancelled','Returned')),
            payment_method VARCHAR(20) CHECK (payment_method IN ('Cash','Card','UPI','Wallet','NetBanking')),
            created_at TIMESTAMP DEFAULT NOW()
        );`,
        `CREATE TABLE IF NOT EXISTS interactions (
            interaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID REFERENCES customers(customer_id) ON DELETE CASCADE,
            interaction_type VARCHAR(20) CHECK (interaction_type IN ('Visit','Email','SMS','Call','WhatsApp')),
            interaction_date TIMESTAMP DEFAULT NOW(),
            notes TEXT
        );`,
        // Vector table for RAG profiles
        `CREATE TABLE IF NOT EXISTS customer_profiles_vec (
            customer_id UUID PRIMARY KEY REFERENCES customers(customer_id) ON DELETE CASCADE,
            num_orders INT,
            total_spend NUMERIC(12,2),
            days_since_last_order INT,
            visits INT,
            age INT,
            location VARCHAR(100),
            profile_json JSONB,
            embedding vector(1536),
            updated_at TIMESTAMP DEFAULT NOW()
        );`,
        `CREATE INDEX IF NOT EXISTS idx_customer_profiles_vec_embedding ON customer_profiles_vec USING ivfflat (embedding vector_cosine_ops);`
    ];

    try {
        for (const sql of statements) {
            // eslint-disable-next-line no-await-in-loop
            await sequelize.query(sql);
        }
        console.log('Database initialized successfully');
    } catch (err) {
        console.error('Database initialization failed:', err.message);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
}

init();


