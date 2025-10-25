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
      foreignKey: "id",
      onDelete: "CASCADE", // optional behavior
    });
};
Vote.associate = (models) => {
    Vote.belongsTo(models.Idea, {
      foreignKey: "id",
      onDelete: "CASCADE", // optional behavior
    });
};

module.exports = Vote;