'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('ChainFields', {
      id: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      chainId: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      serNum: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(100),
        defaultValue: 'text',
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      cancelBtnCallbackData: {
        type: Sequelize.STRING(100),
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isSkip: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isSkipped: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      userResponse: Sequelize.BLOB,
      validations: Sequelize.TEXT,
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
    return queryInterface.dropTable('ChainFields');
  },
};
