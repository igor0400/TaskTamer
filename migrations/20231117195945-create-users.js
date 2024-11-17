'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      telegramId: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      firstName: {
        type: Sequelize.STRING(100),
      },
      lastName: {
        type: Sequelize.STRING(100),
      },
      userName: {
        type: Sequelize.STRING(100),
      },
      timezone: {
        type: Sequelize.STRING(5),
        defaultValue: '+3',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable('Users');
  },
};
