module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WhatsappInstances', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('disconnected', 'connecting', 'connected'),
        defaultValue: 'disconnected'
      },
      qrCode: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sessionData: {
        type: Sequelize.JSON,
        allowNull: true
      },
      messageCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      lastActivity: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WhatsappInstances');
  }
}; 