const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Segments = sequelize.define('Segments', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
    ,
    audienceSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
    ,
    status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
    },
    segmentRulesId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'segment_rules',
            key: 'id'
        }
    },
    segmentMetaDataId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'segment_meta_data',
            key: 'id'
        }
    }
}, {
    tableName: 'segments',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['name']
        }
    ]
});

module.exports = Segments;