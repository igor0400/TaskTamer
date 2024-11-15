'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable('MailingTemplates', {
      id: {
        type: Sequelize.STRING(500),
        allowNull: false,
        unique: true,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.STRING(500),
      },
      type: Sequelize.STRING(50),
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'CREATING',
      },
      messageId: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      usingCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      title: Sequelize.STRING(50),
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
    return queryInterface.dropTable('MailingTemplates');
  },
};
