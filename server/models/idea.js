const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Idea = sequelize.define('Idea', {
    ideaDescription: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ideaTitle: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    ideaCrits: {
        type: DataTypes.DECIMAL,
        allowNull: false,
    },
});

Idea.associate = (models) => {
    Idea.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    Idea.hasMany(models.Vote, {
      foreignKey: "ideaId",
    });
};

module.exports = Idea;