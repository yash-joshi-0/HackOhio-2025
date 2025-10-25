const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const Idea = sequelize.define('Idea', {
    ideaid: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primarykey: true,
    },
    ideadescription: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

Idea.associate = (models) => {
    Idea.belongsTo(models.user, {
      foreignKey: "userId",
      onDelete: "CASCADE", // optional behavior
    });
};

module.exports = Idea;