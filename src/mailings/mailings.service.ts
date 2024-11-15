import { Injectable } from '@nestjs/common';
import { backMarkup, sendMessage } from 'src/general';
import { Context, Telegraf } from 'telegraf';
import {
  createGlobalMailingTemplateMarkup,
  createGlobalMailingTemplateMessage,
  createMailingMarkup,
  createMailingMessage,
  createMailingTemplateMessage,
  createQueueMailingMessage,
  deleteMailingTemplateConfirmationMarkup,
  deleteMailingTemplateConfirmationMessage,
  mailingTemplateMarkup,
  mailingTemplateMessage,
  mailingTemplatesMarkup,
  mailingTemplatesMessage,
  sendMailingConfirmationMarkup,
  sendMailingConfirmationMessage,
  sendMailingMessage,
  sendedMailingMessage,
  setMailingTemplateTitleMarkup,
  setMailingTemplateTitleMessage,
} from './responses';
import { MailingTemplateRepository } from './repositories/mailing-template.repository';
import { MailingRepository } from './repositories/mailing.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import {
  formatHTML,
  getCtxData,
  sendTempMessage,
  timeout,
} from 'src/libs/common';
import { InjectBot } from 'nestjs-telegraf';
import { MenuService } from 'src/menu/menu.service';
import { Op, Sequelize } from 'sequelize';
import { CreatePaginationProps } from 'src/libs/pagination/types';
import { PaginationService } from 'src/libs/pagination/pagination.service';
import { MailingTemplateType } from './models/mailing-template.model';
import { MailingQueueItemRepository } from './repositories/mailing-queue-item.repository';
import { User } from 'src/users/models/user.model';
import { UserRoles } from 'src/roles/models/user-roles.model';
import { isStaffUser, isUserAdmin } from 'src/roles/assets';

@Injectable()
export class MailingsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailingRepository: MailingRepository,
    private readonly mailingTemplateRepository: MailingTemplateRepository,
    private readonly menuService: MenuService,
    private readonly paginationService: PaginationService,
    private readonly mailingQueueItemRepository: MailingQueueItemRepository,
    @InjectBot() private readonly bot: Telegraf<Context>,
  ) {}

  async changeToStartCreateMailing(
    ctx: Context,
    isDeleteInitMess: boolean = false,
  ) {
    const { ctxUser } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id, {
      include: [UserRoles],
    });

    if (!isStaffUser(user?.roles)) {
      return await sendTempMessage({
        ctx,
        bot: this.bot,
        text: '🚫 <b>У вас нет прав на использование этой команды.</b>',
      });
    }

    if (isDeleteInitMess) {
      try {
        await ctx.deleteMessage();
      } catch (e) {}
    }

    const message: any = await sendMessage(createMailingMessage(), {
      ctx,
      reply_markup: createMailingMarkup,
      type: 'send',
    });

    await this.mailingRepository.create({
      userId: user.id,
      chatId: message?.chat?.id,
      messageId: message?.message_id,
    });
  }

  async changeToStartCreateMailingTemplate(
    ctx: Context,
    type?: MailingTemplateType,
  ) {
    const { ctxUser } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);

    const message: any = await sendMessage(setMailingTemplateTitleMessage(), {
      ctx,
      reply_markup: setMailingTemplateTitleMarkup,
    });

    await this.mailingTemplateRepository.create({
      userId: user.id,
      messageId: message?.message_id,
      type,
    });
  }

  async onTextMessage(ctx: Context) {
    if (ctx?.chat?.type !== 'private') return;

    await this.onCreateMailing(ctx);
    await this.onCreateMailingTemplate(ctx);
    await this.onWriteMailingTemplateTitle(ctx);
  }

  async onAnimationMessage(ctx: Context) {
    if (ctx?.chat?.type !== 'private') return;

    await this.onCreateMailing(ctx, 'animation', 'animationFileId');
    await this.onCreateMailingTemplate(ctx, 'animation', 'animationFileId');
  }

  async onAudioMessage(ctx: Context) {
    if (ctx?.chat?.type !== 'private') return;

    await this.onCreateMailing(ctx, 'audio', 'audioFileId');
    await this.onCreateMailingTemplate(ctx, 'audio', 'audioFileId');
  }

  async onDocumentMessage(ctx: Context) {
    if (ctx?.chat?.type !== 'private') return;

    await this.onCreateMailing(ctx, 'document', 'documentFileId');
    await this.onCreateMailingTemplate(ctx, 'document', 'documentFileId');
  }

  async onVideoMessage(ctx: Context) {
    if (ctx?.chat?.type !== 'private') return;

    await this.onCreateMailing(ctx, 'video', 'videoFileId');
    await this.onCreateMailingTemplate(ctx, 'video', 'videoFileId');
  }

  async onPhotoMessage(ctx: Context) {
    if (ctx?.chat?.type !== 'private') return;

    await this.onCreateMailing(ctx, 'photo', 'photoFileId');
    await this.onCreateMailingTemplate(ctx, 'photo', 'photoFileId');
  }

  async onVoiceMessage(ctx: Context) {
    if (ctx?.chat?.type !== 'private') return;

    await this.onCreateMailing(ctx, 'voice', 'voiceFileId');
    await this.onCreateMailingTemplate(ctx, 'voice', 'voiceFileId');
  }

  async onStickerMessage(ctx: Context) {
    if (ctx?.chat?.type !== 'private') return;

    await this.onCreateMailing(ctx, 'sticker', 'stickerFileId');
    await this.onCreateMailingTemplate(ctx, 'sticker', 'stickerFileId');
  }

  private async onCreateMailing(
    ctx: Context,
    messageType?: string,
    mailingFieldName?: string,
  ) {
    const { ctxUser, message } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);
    const mailing = await this.mailingRepository.findOne({
      where: { userId: user.id, status: 'CREATING' },
    });

    if (!mailing) return;

    try {
      await ctx.deleteMessage();
      await ctx.deleteMessage(+mailing.messageId);
    } catch (e) {}

    let fileId = message[messageType]?.file_id;
    const caption = message.text ?? message.caption;

    if (messageType === 'photo') {
      fileId = message.photo[2]?.file_id;
    }

    if (caption) {
      mailing.text = caption;
    }

    if (mailing[mailingFieldName] !== undefined && fileId) {
      mailing[mailingFieldName] = fileId;
    }

    mailing.status = 'CONFIRMING';

    await mailing.save();

    await this.sendMailingConfirmation(ctx, mailing.id);
  }

  private async onWriteMailingTemplateTitle(ctx: Context) {
    const { ctxUser, message } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);
    const mailingTemplate = await this.mailingTemplateRepository.findOne({
      where: { userId: user.id, status: 'CREATING', title: null },
    });

    if (!mailingTemplate) return;

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    const text = message.text;

    if (!text || text?.length > 50) {
      return await sendTempMessage({
        bot: this.bot,
        ctx,
        isDeleteInitMess: true,
        text: '🚫 <b>Максимальная длина <code>50</code> символов.</b>',
      });
    }

    mailingTemplate.title = text;
    await mailingTemplate.save();

    await sendMessage(createMailingTemplateMessage(), {
      bot: this.bot,
      chatId: ctx.chat.id,
      messageId: +mailingTemplate.messageId,
    });
  }

  private async onCreateMailingTemplate(
    ctx: Context,
    messageType?: string,
    mailingFieldName?: string,
  ) {
    const { ctxUser, message } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);
    const mailingTemplate = await this.mailingTemplateRepository.findOne({
      where: {
        userId: user.id,
        status: 'CREATING',
        title: {
          [Op.not]: null,
        },
      },
    });

    if (!mailingTemplate || !mailingTemplate?.title) return;

    try {
      await ctx.deleteMessage();
      await ctx.deleteMessage(+mailingTemplate.messageId);
    } catch (e) {}

    let fileId = message[messageType]?.file_id;
    const caption = message.text ?? message.caption;

    if (messageType === 'photo') {
      fileId = message.photo[2]?.file_id;
    }

    if (caption) {
      mailingTemplate.text = caption;
    }

    if (mailingTemplate[mailingFieldName] !== undefined && fileId) {
      mailingTemplate[mailingFieldName] = fileId;
    }

    mailingTemplate.status = 'CREATED';

    await mailingTemplate.save();

    await this.changeToMailingTemplate(ctx, mailingTemplate.id);
  }

  async sendMailingConfirmation(ctx: Context, mailingId: string) {
    const mailing = await this.mailingRepository.findByPk(mailingId);

    if (!mailing) return;

    try {
      const caption = formatHTML(sendMailingConfirmationMessage(mailing.text));
      const reply_markup = sendMailingConfirmationMarkup(mailing.id);

      if (mailing.animationFileId) {
        return await ctx.sendAnimation(mailing.animationFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailing.audioFileId) {
        return await ctx.sendAudio(mailing.audioFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailing.documentFileId) {
        return await ctx.sendDocument(mailing.documentFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailing.videoFileId) {
        return await ctx.sendVideo(mailing.videoFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailing.photoFileId) {
        return await ctx.sendPhoto(mailing.photoFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailing.voiceFileId) {
        return await ctx.sendVoice(mailing.voiceFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailing.stickerFileId) {
        return await ctx.sendSticker(mailing.stickerFileId, {
          reply_markup,
        });
      }

      if (mailing.text) {
        return await sendMessage(caption, {
          ctx,
          type: 'send',
          reply_markup,
        });
      }
    } catch (e) {}
  }

  async sendMailingToUser(mailingId: string, chatId: string) {
    const mailing = await this.mailingRepository.findByPk(mailingId);

    if (!mailing) return;

    try {
      const caption = mailing.text ? formatHTML(mailing.text) : undefined;

      if (mailing.animationFileId) {
        return await this.bot.telegram.sendAnimation(
          chatId,
          mailing.animationFileId,
          {
            parse_mode: 'HTML',
            caption,
          },
        );
      }

      if (mailing.audioFileId) {
        return await this.bot.telegram.sendAudio(chatId, mailing.audioFileId, {
          parse_mode: 'HTML',
          caption,
        });
      }

      if (mailing.documentFileId) {
        return await this.bot.telegram.sendDocument(
          chatId,
          mailing.documentFileId,
          {
            parse_mode: 'HTML',
            caption,
          },
        );
      }

      if (mailing.videoFileId) {
        return await this.bot.telegram.sendVideo(chatId, mailing.videoFileId, {
          parse_mode: 'HTML',
          caption,
        });
      }

      if (mailing.photoFileId) {
        return await this.bot.telegram.sendPhoto(chatId, mailing.photoFileId, {
          parse_mode: 'HTML',
          caption,
        });
      }

      if (mailing.voiceFileId) {
        return await this.bot.telegram.sendVoice(chatId, mailing.voiceFileId, {
          parse_mode: 'HTML',
          caption,
        });
      }

      if (mailing.stickerFileId) {
        return await this.bot.telegram.sendSticker(
          chatId,
          mailing.stickerFileId,
        );
      }

      if (mailing.text) {
        return await sendMessage(caption, {
          bot: this.bot,
          type: 'send',
          isBanner: false,
          chatId,
        });
      }
    } catch (e) {}
  }

  async cancelMailing(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await this.mailingRepository.destroy({ where: { id: dataValue } });

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    await this.menuService.sendMenu(ctx);
  }

  async sendMailing(mailingId: string) {
    const mailing = await this.mailingRepository.findByPk(mailingId);

    if (!mailing) return;

    mailing.status = 'SENDING';
    await mailing.save();

    const users = await this.userRepository.findAll({});
    let sendingCount = 0;

    try {
      await this.bot.telegram.deleteMessage(mailing.chatId, +mailing.messageId);
    } catch (e) {}

    const message: any = await sendMessage(
      sendMailingMessage(sendingCount, users.length - 1),
      {
        bot: this.bot,
        chatId: mailing.chatId,
        type: 'send',
      },
    );

    for (let user of users) {
      if (user.id !== mailing.userId) {
        await this.sendMailingToUser(mailingId, user.telegramId);
        sendingCount++;

        await sendMessage(sendMailingMessage(sendingCount, users.length - 1), {
          bot: this.bot,
          chatId: message.chat?.id,
          messageId: message.message_id,
        });
        await timeout(500);
      }
    }

    await this.mailingRepository.destroy({ where: { id: mailingId } });

    await sendMessage(sendedMailingMessage(sendingCount), {
      bot: this.bot,
      chatId: message.chat?.id,
      messageId: message.message_id,
      reply_markup: backMarkup,
    });

    await this.sendQueueMailingItems();
  }

  async acceptMailing(ctx: Context) {
    const { dataValue, ctxUser } = getCtxData(ctx);

    await this.clearExpiredMailings();

    const isAllreadyMailingSending = await this.mailingRepository.findOne({
      where: {
        status: {
          [Op.or]: ['WAIT_SENDING', 'SENDING'],
        },
      },
    });

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    if (isAllreadyMailingSending) {
      const user = await this.userRepository.findByTgId(ctxUser.id);

      await this.mailingRepository.update(
        { status: 'WAIT_SENDING' },
        { where: { id: dataValue } },
      );
      const queueItem = await this.createQueueItem({
        userId: user.id,
        mailingId: dataValue,
      });

      const newMessage: any = await sendMessage(
        createQueueMailingMessage(queueItem?.serialNum + 1),
        { ctx, type: 'send' },
      );

      await this.mailingRepository.update(
        {
          messageId: newMessage?.message_id,
          chatId: newMessage?.chat?.id,
        },
        { where: { id: dataValue } },
      );

      return;
    }

    this.sendMailing(dataValue);
  }

  async changeToMailingTemplates(ctx: Context) {
    const { ctxUser } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id, {
      include: [UserRoles],
    });

    const types = ['global'];

    if (isUserAdmin(user.roles)) {
      types.push('admins');
    }

    const generalTemplates = await this.mailingTemplateRepository.findAll({
      where: {
        status: 'CREATED',
        type: {
          [Op.or]: types,
        },
        userId: {
          [Op.not]: user.id,
        },
      },
      order: [['usingCount', 'DESC']],
    });

    const userTemplates = await this.mailingTemplateRepository.findAll({
      where: {
        status: 'CREATED',
        userId: user.id,
      },
      order: [['usingCount', 'DESC']],
    });

    const markup = await mailingTemplatesMarkup(
      [...userTemplates, ...generalTemplates],
      user.roles,
      async (conf: Omit<CreatePaginationProps, 'userId'>) => {
        return await this.paginationService.create({
          userId: user.id,
          ...conf,
        });
      },
    );

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    await sendMessage(mailingTemplatesMessage(), {
      ctx,
      type: 'send',
      reply_markup: markup,
    });
  }

  async changeToMailingTemplate(ctx: Context, initTemplateId?: string) {
    const { dataValue, ctxUser } = getCtxData(ctx);

    const templateId = initTemplateId ?? dataValue;

    const mailingTemplate = await this.mailingTemplateRepository.findByPk(
      templateId,
    );
    const user = await this.userRepository.findByTgId(ctxUser.id, {
      include: [UserRoles],
    });

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    try {
      const caption = formatHTML(mailingTemplateMessage(mailingTemplate));
      const reply_markup = mailingTemplateMarkup(mailingTemplate, user.roles);

      if (mailingTemplate.animationFileId) {
        return await ctx.sendAnimation(mailingTemplate.animationFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailingTemplate.audioFileId) {
        return await ctx.sendAudio(mailingTemplate.audioFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailingTemplate.documentFileId) {
        return await ctx.sendDocument(mailingTemplate.documentFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailingTemplate.videoFileId) {
        return await ctx.sendVideo(mailingTemplate.videoFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailingTemplate.photoFileId) {
        return await ctx.sendPhoto(mailingTemplate.photoFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailingTemplate.voiceFileId) {
        return await ctx.sendVoice(mailingTemplate.voiceFileId, {
          parse_mode: 'HTML',
          caption,
          reply_markup,
        });
      }

      if (mailingTemplate.stickerFileId) {
        return await ctx.sendSticker(mailingTemplate.stickerFileId, {
          reply_markup,
        });
      }

      if (mailingTemplate.text) {
        return await sendMessage(caption, {
          ctx,
          type: 'send',
          reply_markup,
        });
      }
    } catch (e) {}
  }

  async mailingConfirmByTemplate(ctx: Context) {
    const { ctxUser, dataValue, message } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);
    const mailingTemplate = await this.mailingTemplateRepository.findByPk(
      dataValue,
    );

    mailingTemplate.usingCount += 1;
    await mailingTemplate.save();

    const mailing = await this.mailingRepository.create({
      ...mailingTemplate.dataValues,
      status: 'CONFIRMING',
      chatId: message?.chat?.id,
      messageId: message?.message_id,
      userId: user.id,
    });

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    await this.sendMailingConfirmation(ctx, mailing.id);
  }

  async changeToDeleteMailingTemplateConfirm(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    const mailingTemplate = await this.mailingTemplateRepository.findByPk(
      dataValue,
    );

    try {
      await ctx.deleteMessage();
    } catch (e) {}

    await sendMessage(
      deleteMailingTemplateConfirmationMessage(mailingTemplate?.title),
      {
        ctx,
        type: 'send',
        reply_markup: deleteMailingTemplateConfirmationMarkup(dataValue),
      },
    );
  }

  async changeToDeleteMailingTemplate(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await this.mailingTemplateRepository.destroy({ where: { id: dataValue } });

    await this.changeToMailingTemplates(ctx);
  }

  async changeToSelectMailingTemplateType(ctx: Context) {
    await sendMessage(createGlobalMailingTemplateMessage(), {
      ctx,
      reply_markup: createGlobalMailingTemplateMarkup,
    });
  }

  async createQueueItem(opts: { userId: string; mailingId: string }) {
    const allItems = await this.mailingQueueItemRepository.findAll({
      order: [['serialNum', 'DESC']],
    });

    const lastItem = allItems[0];

    return await this.mailingQueueItemRepository.create({
      ...opts,
      serialNum: lastItem ? allItems[0].serialNum + 1 : 0,
    });
  }

  async sendQueueMailingItems() {
    const allItems = await this.mailingQueueItemRepository.findAll({
      order: [['serialNum', 'ASC']],
    });

    const item = allItems[0];

    if (item?.mailingId) {
      await this.mailingQueueItemRepository.destroy({ where: { id: item.id } });
      await this.mailingQueueItemRepository.update({
        serialNum: Sequelize.literal('serialNum - 1'),
      });

      this.sendMailing(item.mailingId);
    }
  }

  async clearExpiredMailings() {
    const milings = await this.mailingRepository.findAll({
      where: { status: 'SENDING' },
      include: [User],
    });

    let isDeleted = false;

    for (let miling of milings) {
      const isMailingExpired =
        Math.floor(
          (Date.parse(new Date().toISOString()) -
            Date.parse(new Date(miling.createdAt).toISOString())) /
            1000 /
            60,
        ) > 5;

      if (isMailingExpired) {
        await this.mailingRepository.destroy({ where: { id: miling.id } });

        isDeleted = true;
      }
    }

    if (isDeleted) {
      await this.sendQueueMailingItems();
    }
  }
}
