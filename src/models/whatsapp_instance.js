const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class WhatsappInstance extends Model {
    static associate(models) {
      WhatsappInstance.belongsTo(models.User, { foreignKey: 'userId' });
      WhatsappInstance.hasMany(models.Rule, { foreignKey: 'instanceId' });
    }
  }

  WhatsappInstance.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('disconnected', 'connecting', 'connected'),
      defaultValue: 'disconnected'
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    sessionData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    messageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastActivity: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'WhatsappInstance'
  });

  return WhatsappInstance;
}; 