import { Injectable } from '@nestjs/common';
import { EventsRepository } from '../repositories/event.repository';
import { EventsMembersRepository } from '../repositories/event-member.repository';
import { getDayDate, sendMessage } from 'src/general';
import { BusyDaysRepository } from '../repositories/busy-day.repository';
import { getDateFromDataVal, getFreeIntervals } from '../assets';
import { CalendarEvent } from '../models/event.model';
import { filterEventsByDate } from './assets';
import { Context, Telegraf } from 'telegraf';
import {
  getCtxData,
  getDateFromTZToUTC,
  getNowDateWithTZ,
  getZero,
} from 'src/libs/common';
import {
  deletedEventMarkup,
  deletedEventMessage,
  eventMarkup,
  eventMessage,
  leavedEventMarkup,
  leavedEventMessage,
} from './responses';
import { User } from 'src/users/models/user.model';
import { CalendarEventMember } from '../models/event-member.model';
import { InjectBot } from 'nestjs-telegraf';
import { UserRepository } from 'src/users/repositories/user.repository';
import { Waiter } from 'src/listeners/models/waiter.model';

interface CreateEvent {
  creatorTgId: string;
  membersTgIds: string[];
  title?: string;
  startTime: Date;
  endTime: Date;
}

interface CheckIsDayBusy {
  userId: string;
  userTelegramId: string;
  dateVal: string;
}

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly eventsMembersRepository: EventsMembersRepository,
    private readonly usersRepository: UserRepository,
    private readonly busyDaysRepository: BusyDaysRepository,
    @InjectBot() private bot: Telegraf<Context>,
  ) {}

  async createEvent({
    creatorTgId,
    membersTgIds,
    title,
    startTime,
    endTime,
  }: CreateEvent) {
    const type = membersTgIds.length > 1 ? 'multiplayer' : 'solo';

    const creator = await this.usersRepository.findByTgId(creatorTgId);

    const UTCStartTime = getDateFromTZToUTC({
      initDate: startTime,
      timezone: creator.timezone,
    });

    const UTCEndTime = getDateFromTZToUTC({
      initDate: endTime,
      timezone: creator.timezone,
    });

    const event = await this.eventsRepository.create({
      title,
      startTime: UTCStartTime,
      endTime: UTCEndTime,
      type,
      creatorId: creator.id,
    });

    const dates = [];

    const fromDate = getDayDate(UTCStartTime);
    if (!dates.includes(fromDate)) dates.push(fromDate);

    const tillDate = getDayDate(UTCEndTime);
    if (!dates.includes(tillDate)) dates.push(tillDate);

    for (let memberTgId of membersTgIds) {
      const user = await this.usersRepository.findByTgId(memberTgId);

      await this.eventsMembersRepository.create({
        calendarEventId: event.id,
        userTelegramId: memberTgId,
        userId: user.id,
      });

      for (let date of dates) {
        await this.checkIsDayBusy({
          userId: user.id,
          userTelegramId: memberTgId,
          dateVal: date,
        });
      }
    }

    return event;
  }

  async deleteEvent({ eventId }) {
    const event = await this.eventsRepository.findByPk(eventId, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });
    if (!event) return;

    await this.eventsRepository.destroy({ where: { id: eventId } });

    const creator = await this.usersRepository.findByPk(event.creatorId);

    const startDate = getNowDateWithTZ({
      initDate: event.startTime,
      timezone: creator.timezone,
    });

    await this.checkIsDayBusy({
      userId: creator.id,
      userTelegramId: creator.telegramId,
      dateVal: getDayDate(startDate),
    });

    for (let member of event.members) {
      const memberId = member.userId;
      const memberTgId = member.userTelegramId;

      if (creator.id !== memberId) {
        sendMessage(deletedEventMessage(member?.user, event), {
          bot: this.bot,
          chatId: member?.user?.telegramId,
          reply_markup: deletedEventMarkup(),
          type: 'send',
        });
      }

      await this.eventsMembersRepository.destroy({ where: { id: member.id } });

      await this.checkIsDayBusy({
        userId: memberId,
        userTelegramId: memberTgId,
        dateVal: getDayDate(startDate),
      });
    }

    return event;
  }

  async leaveEvent({ eventId, userTgId }) {
    const event = await this.eventsRepository.findByPk(eventId);
    if (!event) return;

    await this.eventsMembersRepository.destroy({
      where: { calendarEventId: eventId, userTelegramId: userTgId },
    });
    const user = await this.usersRepository.findByTgId(userTgId);

    const startDate = getNowDateWithTZ({
      initDate: event.startTime,
      timezone: user.timezone,
    });

    await this.checkIsDayBusy({
      userId: user.id,
      userTelegramId: userTgId,
      dateVal: getDayDate(startDate),
    });

    const creator = await this.usersRepository.findByPk(event?.creatorId);

    sendMessage(leavedEventMessage(user), {
      bot: this.bot,
      chatId: creator?.telegramId,
      reply_markup: leavedEventMarkup(event.id),
      type: 'send',
    });

    return event;
  }

  async createEventByDataValue({
    dataValue,
    creatorTgId,
    membersTgIds,
    title,
  }: {
    dataValue: string;
    creatorTgId: string;
    membersTgIds: string[];
    title?: string;
  }) {
    const [timeData, userId] = dataValue.split('_');
    const [date, startVal, endVal] = timeData.split('-');

    const [day, month, year] = date.split('.');
    const startTime = new Date(
      `${year}-${getZero(month)}-${getZero(day)}T${startVal}:00.000Z`,
    );
    const endTime = new Date(
      `${year}-${getZero(month)}-${getZero(day)}T${endVal}:00.000Z`,
    );

    const event = await this.createEvent({
      creatorTgId,
      membersTgIds,
      title,
      startTime,
      endTime,
    });
    const newEvent = await this.eventsRepository.findByPk(event.id, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });

    return newEvent;
  }

  async changeToEvent(ctx: Context, eventId: string) {
    const { ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;

    const user = await this.usersRepository.findByTgId(userTgId);
    const event = await this.eventsRepository.findByPk(eventId, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });

    const type = user?.id === event?.creatorId ? 'owner' : 'inviter';

    await sendMessage(eventMessage(event, user), {
      ctx,
      reply_markup: eventMarkup({
        event,
        type,
        userId: user.id,
        timezone: user.timezone,
      }),
    });
  }

  async sendEvent(ctx: Context, eventId: string) {
    const { ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;

    const user = await this.usersRepository.findByTgId(userTgId);
    const event = await this.eventsRepository.findByPk(eventId, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });

    const type = user?.id === event?.creatorId ? 'owner' : 'inviter';

    await sendMessage(eventMessage(event, user), {
      ctx,
      reply_markup: eventMarkup({
        event,
        type,
        userId: user.id,
        timezone: user.timezone,
      }),
      type: 'send',
    });
  }

  async changeToEventByMess(
    chatId: string,
    messageId: string,
    eventId: string,
    userId: string,
  ) {
    const event = await this.eventsRepository.findByPk(eventId, {
      include: [{ model: CalendarEventMember, include: [User] }],
    });
    const type = userId === event?.creatorId ? 'owner' : 'inviter';

    const user = await this.usersRepository.findByPk(userId);

    await sendMessage(eventMessage(event, user), {
      bot: this.bot,
      chatId,
      messageId: +messageId,
      reply_markup: eventMarkup({
        event,
        type,
        userId: user.id,
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

    const event = await this.createEventByDataValue({
      title,
      dataValue: extraData,
      creatorTgId: userTgId,
      membersTgIds: [userTgId],
    });

    await this.changeToEventByMess(chatId, messageId, event.id, userId);
  }

  async checkIsDayBusy({ userId, userTelegramId, dateVal }: CheckIsDayBusy) {
    const [date, month, year] = dateVal.split('.');
    const newDate = getDateFromDataVal(dateVal);

    const eventMembers = await this.eventsMembersRepository.findAll({
      where: {
        userId,
      },
      include: [CalendarEvent],
    });

    const events = eventMembers.map((i) => i?.event);
    const sortedEvents = filterEventsByDate(events, dateVal);
    const freeIntervals = getFreeIntervals(newDate, sortedEvents);

    if (freeIntervals.length) {
      await this.busyDaysRepository.destroy({
        where: {
          userId,
          userTelegramId,
          date: +date,
          month: +month,
          year: +year,
          type: 'auto',
        },
      });
    } else {
      await this.busyDaysRepository.create({
        userId,
        userTelegramId,
        date: +date,
        month: +month,
        year: +year,
        type: 'auto',
      });
    }
  }
}
