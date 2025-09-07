const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshTokens = sequelize.define('RefreshTokens', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    token: {
        type: DataTypes.TEXT,
        allowNull: false
    }
    ,
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
    ,
    userAgent: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
    
},{
    tableName: 'refreshTokens',
    timestamps: true,
}

);

module.exports = RefreshTokens;