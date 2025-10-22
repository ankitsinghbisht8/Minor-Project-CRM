const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const SegmentMembers = sequelize.define('SegmentMembers', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'customers',
            key: 'id'
        }
    },
    segmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Segments',
            key: 'id'
        }
    }
}, {
    tableName: 'segment_members',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['customerId', 'segmentId']
        }
    ]
});