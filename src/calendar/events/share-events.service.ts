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
  inlineEventInviteMarkup,
  inlineEventInviteMessage,
  writeInlineRequestTemplate,
} from './responses';
import { User } from 'src/users/models/user.model';
import { CalendarEventMember } from '../models/event-member.model';
import { InjectBot } from 'nestjs-telegraf';
import { UserRepository } from 'src/users/repositories/user.repository';
import { EventsService } from './events.service';
import {
  getCtxData,
  getNowDateWithTZ,
  getUserName,
  sendTempChatIdMessage,
} from 'src/libs/common';
import { EventsMembersRepository } from '../repositories/event-member.repository';
import { backMarkup, getDayDate, sendMessage } from 'src/general';
import { BasicNotificationRepository } from 'src/notifications/repositories/basic-notification.repository';
import { Waiter } from 'src/listeners/models/waiter.model';
import { MenuService } from 'src/menu/menu.service';

@Injectable()
export class ShareEventsService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly eventsRepository: EventsRepository,
    private readonly eventsMembersRepository: EventsMembersRepository,
    private readonly usersRepository: UserRepository,
    private readonly basicNotificationRepository: BasicNotificationRepository,
    private readonly menuService: MenuService,
    @InjectBot() private bot: Telegraf<Context>,
  ) {}

  async changeToEvent(ctx: Context, eventId: string, inviterId: string) {
    const { ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;

    const user = await this.usersRepository.findByTgId(userTgId);
    const event = await this.eventsRepository.findByPk(eventId, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });

    await sendMessage(eventMessage(event, user), {
      ctx,
      reply_markup: eventMarkup({
        event,
        type: 'owner',
        userId: user.id,
        inviterId,
        timezone: user.timezone,
      }),
    });
  }

  async changeToEventByMess(
    chatId: string,
    messageId: string,
    eventId: string,
    userId: string,
    inviterId: string,
  ) {
    const user = await this.usersRepository.findByPk(userId);

    const event = await this.eventsRepository.findByPk(eventId, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });

    await sendMessage(eventMessage(event, user), {
      bot: this.bot,
      chatId,
      messageId: +messageId,
      reply_markup: eventMarkup({
        event,
        type: 'owner',
        userId,
        inviterId,
        timezone: user.timezone,
      }),
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
      sendMessage(eventInviteMessage(event, owner, invitedUser), {
        bot: this.bot,
        chatId: invitedUserTgId,
        reply_markup: eventInviteMarkup(event.id),
        type: 'send',
      });

      this.basicNotificationRepository.create({
        userTelegramId: invitedUserTgId,
        title: 'Приглашение',
        text: eventInviteMessage(event, owner, invitedUser),
        markup: JSON.stringify(eventInviteMarkup(event.id, invitedUserId)),
        extraData: event.id,
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

    // проверять не занято ли это время !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    const isAleradyEventMember = await this.eventsMembersRepository.findOne({
      where: {
        calendarEventId: eventId,
        userTelegramId: userTgId,
      },
    });

    if (!isAleradyEventMember) {
      await this.eventsMembersRepository.create({
        calendarEventId: eventId,
        userTelegramId: userTgId,
        userId,
      });

      const startDate = getNowDateWithTZ({
        initDate: event.startTime,
        timezone: user.timezone,
      });

      await this.eventsService.checkIsDayBusy({
        userId,
        userTelegramId: userTgId,
        dateVal: getDayDate(startDate),
      });
    }

    await this.eventsService.changeToEvent(ctx, eventId);

    if (!isAleradyEventMember) {
      const creator = await this.usersRepository.findByPk(event?.creatorId);

      sendMessage(eventAcceptedMessage(user), {
        bot: this.bot,
        chatId: creator?.telegramId,
        reply_markup: eventAcceptedMarkup(eventId),
        type: 'send',
      });
    }

    await this.basicNotificationRepository.destroy({
      where: { userTelegramId: userTgId, extraData: event.id },
    });
  }

  async rejectEventInvite(ctx: Context) {
    const { dataValue, ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;
    const eventId = dataValue;
    const event = await this.eventsRepository.findByPk(eventId);
    const user = await this.usersRepository.findByTgId(userTgId);

    await ctx.deleteMessage();

    const isAleradyEventMember = await this.eventsMembersRepository.findOne({
      where: {
        calendarEventId: eventId,
        userTelegramId: userTgId,
      },
    });

    if (!isAleradyEventMember) {
      const creator = await this.usersRepository.findByPk(event?.creatorId);

      sendMessage(eventRejectedMessage(user), {
        bot: this.bot,
        chatId: creator?.telegramId,
        reply_markup: eventRejectedMarkup(eventId),
        type: 'send',
      });
    }

    await this.basicNotificationRepository.destroy({
      where: { userTelegramId: userTgId, extraData: event.id },
    });

    await this.menuService.sendMenu(ctx);
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

    await sendMessage(eventInviteMessage(event, owner, user), {
      ctx,
      reply_markup: eventInviteMarkup(event.id),
      type: 'send',
    });
  }

  async onInlineRequest(ctx: Context) {
    const { ctxUser } = getCtxData(ctx);

    const query = ctx?.inlineQuery?.query;

    // сразу проверять не занято ли время

    if (!query || query.trim() === '') {
      try {
        return await ctx.answerInlineQuery([
          {
            type: 'article',
            id: '1',
            title: 'Введите название события и время',
            input_message_content: {
              message_text: writeInlineRequestTemplate(),
              parse_mode: 'HTML',
              disable_web_page_preview: true,
            },
          },
        ]);
      } catch (e) {}
    }

    const user = await this.usersRepository.findByTgId(ctxUser.id);

    const event = await this.eventsRepository.findOne({
      where: {
        creatorId: user.id,
      },
    });

    try {
      await ctx.answerInlineQuery([
        {
          type: 'article',
          id: '1',
          title: `Создать событие "${query}" 15 января в 15:00`,
          input_message_content: {
            message_text: inlineEventInviteMessage(event, user),
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          },
          reply_markup: inlineEventInviteMarkup({
            eventId: event.id,
            userId: user.id,
          }),
        },
      ]);
    } catch (e) {}
  }
}
