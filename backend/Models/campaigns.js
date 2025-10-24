const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Minimal Campaign model to track progress of sending messages to a segment
const Campaign = sequelize.define('Campaign', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    segmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'segments',
            key: 'id'
        }
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    totalUsers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    sentCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    successCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    failureCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('queued', 'in_progress', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'queued'
    },
    error: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'campaigns',
    timestamps: true
});

module.exports = Campaign;


