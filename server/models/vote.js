const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vote = sequelize.define('Vote', {
    voteId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
        primarykey: true,
    },
    isLike: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
});

Vote.associate = (models) => {
    Vote.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE", // optional behavior
    });
};
Vote.associate = (models) => {
    Vote.belongsTo(models.Idea, {
      foreignKey: "ideaId",
      onDelete: "CASCADE", // optional behavior
    });
};

module.exports = Idea;