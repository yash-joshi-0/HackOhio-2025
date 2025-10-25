const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Idea = sequelize.define('Idea', {
    ideaId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primarykey: true,
    },
    ideaDescription: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ideaCrits: {
        type: DataTypes.INTEGER,
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