const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const SegmentMetaData = sequelize.define('SegmentMetaData', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    metaData: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    tableName: 'segment_meta_data',
    timestamps: true
});

module.exports = SegmentMetaData;