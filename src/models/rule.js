const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Rule extends Model {
    static associate(models) {
      Rule.belongsTo(models.User, { foreignKey: 'userId' });
      Rule.belongsTo(models.WhatsappInstance, { foreignKey: 'instanceId' });
    }
  }

  Rule.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    instanceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'WhatsappInstances',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    trigger: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('text', 'ai', 'media'),
      allowNull: false
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lastTriggered: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Rule'
  });

  return Rule;
}; 