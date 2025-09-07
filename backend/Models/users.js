const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Users = sequelize.define('Users', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [2, 255]
        }
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
            notEmpty: true
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            len: {
                args: [8, 255],
                msg: 'Password must be between 8 and 255 characters'
            },
            notEmpty: {
                args: true,
                msg: 'Password cannot be empty if provided'
            }
        }
    },
    googleSub: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    },
    profilePicture: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
            isUrl: {
                args: true,
                msg: 'Profile picture must be a valid URL'
            }
        }
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLogin: {
        type: DataTypes.DATE,
        allowNull: true
    },
    role: {
        type: DataTypes.ENUM('admin', 'user', 'manager'),
        defaultValue: 'user'
    }
  
}, {
    tableName: 'users',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['googleSub']
        }
    ]
});

module.exports = Users;