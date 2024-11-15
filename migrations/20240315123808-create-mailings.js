'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('Mailings', {
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
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'CREATING',
      },
      chatId: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      messageId: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      text: Sequelize.STRING(700),
      animationFileId: Sequelize.STRING(500),
      audioFileId: Sequelize.STRING(500),
      documentFileId: Sequelize.STRING(500),
      videoFileId: Sequelize.STRING(500),
      photoFileId: Sequelize.STRING(500),
      voiceFileId: Sequelize.STRING(500),
      stickerFileId: Sequelize.STRING(500),
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
    return queryInterface.dropTable('Mailings');
  },
};
