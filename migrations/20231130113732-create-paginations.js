'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('Paginations', {
      id: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      items: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      pageItemsCount: {
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      rowLen: {
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      isEmptyFill: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isShowCount: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      dontHideNavbar: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    return queryInterface.dropTable('Paginations');
  },
};
