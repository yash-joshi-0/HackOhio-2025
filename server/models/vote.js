const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vote = sequelize.define('Vote', {
    isLike: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
});

Vote.associate = (models) => {
    Vote.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
    Vote.belongsTo(models.Idea, {
      foreignKey: "ideaId",
      onDelete: "CASCADE",
    });
};

module.exports = Vote;