import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../repositories/event.repository';
import { Context, Telegraf } from 'telegraf';
import {
  eventMessage,
  eventMarkup,
  eventInviteMessage,
  eventInviteMarkup,
  eventAcceptedMessage,
  eventAcceptedMarkup,
  eventRejectedMessage,
  eventRejectedMarkup,
  alreadyActiveInviteMessage,
} from './responses';
import { User } from 'src/users/models/user.model';
import { CalendarEventMember } from '../models/event-member.model';
import { InjectBot } from 'nestjs-telegraf';
import { UserRepository } from 'src/users/repositories/user.repository';
import { EventsService } from './events.service';
import {
  getCtxData,
  getUserName,
  replyPhoto,
  sendTempChatIdMessage,
} from 'src/libs/common';
import { EventsMembersRepository } from '../repositories/event-member.repository';
import { backMarkup, getDayDate, sendMessage } from 'src/general';
import { BasicNotificationRepository } from 'src/notifications/repositories/basic-notification.repository';
import { Waiter } from 'src/listeners/models/waiter.model';

@Injectable()
export class ShareEventsService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly eventsRepository: EventsRepository,
    private readonly eventsMembersRepository: EventsMembersRepository,
    private readonly usersRepository: UserRepository,
    private readonly basicNotificationRepository: BasicNotificationRepository,
    @InjectBot() private bot: Telegraf<Context>,
  ) {}

  async changeToEvent(ctx: Context, eventId: string, inviterId: string) {
    const { ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;

    const user = await this.usersRepository.findByTgId(userTgId);
    const event = await this.eventsRepository.findByPk(eventId, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });

    await sendMessage(eventMessage(event), {
      ctx,
      reply_markup: eventMarkup(event, 'owner', user.id, inviterId),
    });
  }

  async changeToEventByMess(
    chatId: string,
    messageId: string,
    eventId: string,
    userId: string,
    inviterId: string,
  ) {
    const event = await this.eventsRepository.findByPk(eventId, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });

    await sendMessage(eventMessage(event), {
      bot: this.bot,
      chatId,
      messageId: +messageId,
      reply_markup: eventMarkup(event, 'owner', userId, inviterId),
    });
  }

  async createEventByTitleListener({
    textWaiter,
    title,
    userTgId,
    userId,
  }: {
    textWaiter: Waiter;
    title: string;
    userTgId: string;
    userId: string;
  }) {
    const { extraData, chatId, messageId } = textWaiter;

    const splitExtra = extraData.split('_');
    const dataValue = splitExtra[0];
    const invitedUserId = splitExtra[1];
    const invitedUser = await this.usersRepository.findByPk(invitedUserId);
    const invitedUserTgId = invitedUser?.telegramId;
    const owner = await this.usersRepository.findByPk(userId);

    const event = await this.eventsService.createEventByDataValue({
      title,
      dataValue,
      creatorTgId: userTgId,
      membersTgIds: [userTgId],
    });

    await this.changeToEventByMess(
      chatId,
      messageId,
      event.id,
      userId,
      invitedUserId,
    );

    try {
      await this.bot.telegram.sendPhoto(invitedUserTgId, replyPhoto(), {
        caption: eventInviteMessage(event, owner),
        reply_markup: eventInviteMarkup(event.id),
        parse_mode: 'HTML',
      });

      await this.basicNotificationRepository.create({
        userTelegramId: invitedUserTgId,
        title: 'Приглашение',
        text: eventInviteMessage(event, owner),
        markup: JSON.stringify(eventInviteMarkup(event.id, invitedUserId)),
      });
    } catch (e) {}

    await sendTempChatIdMessage({
      bot: this.bot,
      chatId: userTgId,
      text: `✅ <b>Пользователю ${getUserName(
        invitedUser,
      )} отправлено предложение присоединиться к событию!</b>`,
      time: 5000,
    });
  }

  async acceptEventInvite(ctx: Context) {
    const { dataValue, ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;
    const user = await this.usersRepository.findByTgId(userTgId);
    const userId = user.id;
    const eventId = dataValue;

    const event = await this.eventsRepository.findByPk(eventId);

    await this.eventsMembersRepository.create({
      calendarEventId: eventId,
      userTelegramId: userTgId,
      userId,
    });

    await this.eventsService.checkIsDayBusy({
      userId,
      userTelegramId: userTgId,
      dateVal: getDayDate(event?.startTime),
    });

    await this.eventsService.changeToEvent(ctx, eventId);

    const creator = await this.usersRepository.findByPk(event?.creatorId);

    try {
      await this.bot.telegram.sendPhoto(creator?.telegramId, replyPhoto(), {
        caption: eventAcceptedMessage(user),
        reply_markup: eventAcceptedMarkup(eventId),
        parse_mode: 'HTML',
      });
    } catch (e) {}

    await this.basicNotificationRepository.destroy({
      where: { userTelegramId: userTgId },
    });
  }

  async rejectEventInvite(ctx: Context) {
    const { dataValue, ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;
    const eventId = dataValue;
    const event = await this.eventsRepository.findByPk(eventId);
    const user = await this.usersRepository.findByTgId(userTgId);

    await ctx.deleteMessage();

    const creator = await this.usersRepository.findByPk(event?.creatorId);

    try {
      await this.bot.telegram.sendPhoto(creator?.telegramId, replyPhoto(), {
        caption: eventRejectedMessage(user),
        reply_markup: eventRejectedMarkup(eventId),
        parse_mode: 'HTML',
      });
    } catch (e) {}

    await this.basicNotificationRepository.destroy({
      where: { userTelegramId: userTgId },
    });
  }

  async sendInviteEvent(ctx: Context, eventId: string, userId: string) {
    const { ctxUser } = getCtxData(ctx);
    const user = await this.usersRepository.findByTgId(ctxUser.id);

    const isUserActivated = await this.eventsMembersRepository.findOne({
      where: {
        calendarEventId: eventId,
        userId: user.id,
      },
    });

    if (isUserActivated) {
      return sendMessage(alreadyActiveInviteMessage(), {
        ctx,
        reply_markup: backMarkup,
        type: 'send',
      });
    }

    const event = await this.eventsRepository.findByPk(eventId, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });
    const owner = await this.usersRepository.findByPk(userId);

    await sendMessage(eventInviteMessage(event, owner), {
      ctx,
      reply_markup: eventInviteMarkup(event.id),
      type: 'send',
    });
  }
}
