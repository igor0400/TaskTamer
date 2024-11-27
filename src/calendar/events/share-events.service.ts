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
  inlineEventInviteMessage,
  writeInlineRequestTemplate,
  inlineLoadingEventInviteMarkup,
  inlineReadyEventInviteMarkup,
  createEventDescriptionMessage,
  createAlCrEventDescriptionMessage,
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
  numUid,
  sendTempChatIdMessage,
  sendTempMessage,
} from 'src/libs/common';
import { EventsMembersRepository } from '../repositories/event-member.repository';
import { backMarkup, getDayDate, sendMessage } from 'src/general';
import { BasicNotificationRepository } from 'src/notifications/repositories/basic-notification.repository';
import { Waiter } from 'src/listeners/models/waiter.model';
import { MenuService } from 'src/menu/menu.service';
import {
  filterEventsByDate,
  filterMultyEvents,
  parseEventDataFromRequest,
} from './assets';
import { v4 as uuid } from 'uuid';
import { Op } from 'sequelize';
import { CalendarEvent } from '../models/event.model';
import { getDateFromDataVal, getFreeIntervals } from '../assets';

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

    const isAleradyEventMember = await this.eventsMembersRepository.findOne({
      where: {
        calendarEventId: eventId,
        userTelegramId: userTgId,
      },
    });

    if (!isAleradyEventMember) {
      const isTimeBusy = await this.checkIsTimeBusy({
        startTime: event.startTime,
        endTime: event.endTime,
        userTgId,
      });

      if (isTimeBusy) {
        return await sendTempMessage({
          bot: this.bot,
          ctx,
          text: '🚫 Это время у вас уже занято',
          time: 5000,
          isDeleteInitMess: false,
        });
      }
    }

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
      return this.eventsService.sendEvent(ctx, eventId);
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

    const user = await this.usersRepository.findByTgId(ctxUser.id);

    const { startTime, endTime, eventTitle } = parseEventDataFromRequest(
      query,
      user.timezone,
    );

    const emptyResponse: any = [
      {
        type: 'article',
        thumbnail_url:
          'https://res.cloudinary.com/dnur7812w/image/upload/v1732562790/iuqgg3w2vmwcxuchk5sj.jpg',
        id: '1',
        title: 'Введите название события и время',
        description: 'Уборка завтра с 18 до 19',
        input_message_content: {
          message_text: writeInlineRequestTemplate(),
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        },
      },
    ];

    if (!startTime && !eventTitle) {
      try {
        return await ctx.answerInlineQuery(emptyResponse, {
          is_personal: true,
          cache_time: 60,
        });
      } catch (e) {}
    }

    const isTimeBusy = await this.checkIsTimeBusy({
      startTime,
      endTime,
      userTgId: user.telegramId,
    });

    const results = [];

    const matchedEvents = await this.getMatchedEvents({
      creatorId: user.id,
      eventTitle,
      startTime,
    });

    if (matchedEvents?.length) {
      for (let matchedEvent of matchedEvents) {
        results.push({
          type: 'article',
          thumbnail_url:
            'https://res.cloudinary.com/dnur7812w/image/upload/v1732562545/ckk1ubgev4hsit66vuwj.jpg',
          id: numUid(20),
          title: `Создать приглашение${
            matchedEvent.title ? ` на "${matchedEvent.title}"` : ''
          }`,
          description: createAlCrEventDescriptionMessage(
            {
              startTime: matchedEvent.startTime,
              endTime: matchedEvent.endTime,
            },
            user.timezone,
          ),
          input_message_content: {
            message_text: inlineEventInviteMessage(matchedEvent.title, user),
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          },
          reply_markup: inlineReadyEventInviteMarkup({
            eventId: matchedEvent.id,
            userId: user.id,
          }),
        });
      }
    }

    if (startTime && !isTimeBusy) {
      results.push({
        type: 'article',
        thumbnail_url:
          'https://res.cloudinary.com/dnur7812w/image/upload/v1732562545/larwoev5qfpara3h129d.jpg',
        id: `create_${numUid(10)}`,
        title: `Создать событие${eventTitle ? ` "${eventTitle}"` : ''}`,
        description: createEventDescriptionMessage(
          { startTime, endTime },
          user.timezone,
        ),
        input_message_content: {
          message_text: inlineEventInviteMessage(eventTitle, user),
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        },
        reply_markup: inlineLoadingEventInviteMarkup(),
      });
    }

    if (results.length) {
      try {
        return await ctx.answerInlineQuery(results, {
          is_personal: true,
          cache_time: 60,
        });
      } catch (e) {}
    }

    if (isTimeBusy) {
      try {
        return await ctx.answerInlineQuery(
          [
            {
              type: 'article',
              thumbnail_url:
                'https://res.cloudinary.com/dnur7812w/image/upload/v1732570057/tc4d96ietgrundkpt0kj.jpg',
              id: '2',
              title: 'Это время у вас уже занято',
              description: 'Выберите свободное время в своем календаре',
              input_message_content: {
                message_text: writeInlineRequestTemplate(),
                parse_mode: 'HTML',
                disable_web_page_preview: true,
              },
            },
          ],
          {
            is_personal: true,
            cache_time: 60,
          },
        );
      } catch (e) {}
    }

    if (!startTime) {
      try {
        return await ctx.answerInlineQuery(emptyResponse, {
          is_personal: true,
          cache_time: 60,
        });
      } catch (e) {}
    }
  }

  private async getMatchedEvents({ creatorId, eventTitle, startTime }) {
    const whereCondition: any = {
      creatorId,
      [Op.or]: [],
    };

    if (eventTitle) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);

      whereCondition[Op.or].push({
        [Op.and]: [
          {
            title: {
              [Op.like]: `%${eventTitle}%`,
            },
          },
          {
            startTime: {
              [Op.gte]: yesterday,
            },
          },
        ],
      });
    }

    if (startTime) {
      whereCondition[Op.or].push({
        startTime,
      });
    }

    if (whereCondition[Op.or].length === 0) {
      delete whereCondition[Op.or];
    }

    return await this.eventsRepository.findAll({
      where: whereCondition,
    });
  }

  async onInlineSelected(ctx: Context) {
    const { ctxUser } = getCtxData(ctx);

    const { inline_message_id, query, result_id } = ctx.chosenInlineResult;

    const type = result_id?.split('_')?.[0];

    if (type === 'create' && inline_message_id) {
      const user = await this.usersRepository.findByTgId(ctxUser?.id);

      const eventData = parseEventDataFromRequest(query, user?.timezone);

      const newEvent = await this.eventsService.createEvent({
        creatorTgId: ctxUser?.id,
        title: eventData?.eventTitle,
        startTime: getNowDateWithTZ({
          initDate: eventData?.startTime,
          timezone: user?.timezone,
        }),
        endTime: getNowDateWithTZ({
          initDate: eventData?.endTime,
          timezone: user?.timezone,
        }),
        membersTgIds: [ctxUser?.id],
      });

      try {
        await ctx.telegram.editMessageReplyMarkup(
          undefined,
          undefined,
          inline_message_id,
          inlineReadyEventInviteMarkup({
            userId: user.id,
            eventId: newEvent.id,
          }),
        );
      } catch (e) {}
    }
  }

  async checkIsTimeBusy({ startTime, endTime, userTgId }) {
    const stDate = new Date(startTime);
    const edDate = new Date(endTime);

    const dateVal = `${stDate.getDate()}.${
      stDate.getMonth() + 1
    }.${stDate.getFullYear()}`;

    const eventsMembers = await this.eventsMembersRepository.findAll({
      where: {
        userTelegramId: userTgId,
      },
      include: [CalendarEvent],
    });
    const events = eventsMembers.map((i) => i.event);
    const filteredEvents = filterMultyEvents(
      filterEventsByDate(events, dateVal),
    );
    const sortedEvents = filterEventsByDate(filteredEvents, dateVal);

    let isBusy = false;

    for (let busyEvent of sortedEvents) {
      const isStartBusy =
        new Date(busyEvent.startTime) <= stDate &&
        new Date(busyEvent.endTime) > stDate;
      const isEndBusy =
        new Date(busyEvent.startTime) < edDate &&
        new Date(busyEvent.endTime) >= edDate;

      const isAllMore =
        new Date(busyEvent.startTime) >= stDate &&
        new Date(busyEvent.endTime) <= edDate;

      if (isStartBusy || isEndBusy || isAllMore) {
        isBusy = true;
      }
    }

    return isBusy;
  }
}
