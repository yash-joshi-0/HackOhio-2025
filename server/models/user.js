const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
    userId:{
        type: DataTypes.INTEGER,
        primarykey: true,
        allowNull: false,
    },
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
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

User.associate = (models) => {
    User.hasMany(models.Idea, {
      foreignKey: "userId", // this creates the foreign key in the Post table
    });
};
User.associate = (models) => {
    User.hasMany(models.Vote, {
      foreignKey: "userId",
    });
};

User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

module.exports = User;