const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Neon PostgreSQL configuration
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// Test the connection
sequelize.authenticate()
    .then(() => {
        console.log('Neon PostgreSQL connection established successfully');
    })
    .catch((err) => {
        console.error(' Unable to connect to Neon PostgreSQL:', err.message);
    });

module.exports = sequelize;