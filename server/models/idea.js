const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Idea = sequelize.define('Idea', {
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
      foreignKey: "id",
      onDelete: "CASCADE", // optional behavior
    });
};
Idea.associate = (models) => {
    Idea.hasMany(models.Vote, {
      foreignKey: "id",
    });
};

module.exports = Idea;