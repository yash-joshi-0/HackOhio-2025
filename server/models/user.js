const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    crits: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
});

User.associate = (models) => {
    User.hasMany(models.Idea, {
      foreignKey: "userId",
    });
    User.hasMany(models.Vote, {
      foreignKey: "userId",
    });
};

User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;