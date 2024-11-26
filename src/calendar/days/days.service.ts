import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { calendarDaysMarkup, calendarDaysMessage } from './responses';
import { getCtxData, getNowDateWithTZ, replyPhoto } from 'src/libs/common';
import { EventsMembersRepository } from '../repositories/event-member.repository';
import { CalendarEvent } from '../models/event.model';
import { BusyDaysRepository } from '../repositories/busy-day.repository';
import { getDateFromDataVal } from '../assets';
import { filterEventsByDate } from '../events/assets';
import { UserRepository } from 'src/users/repositories/user.repository';
import { sendMessage } from 'src/general';
import { CreatePaginationProps } from 'src/libs/pagination/types';
import { PaginationService } from 'src/libs/pagination/pagination.service';

@Injectable()
export class CalendarDaysService {
  constructor(
    private readonly eventsMembersRepository: EventsMembersRepository,
    private readonly usersRepository: UserRepository,
    private readonly busyDaysRepository: BusyDaysRepository,
    private readonly paginationService: PaginationService,
  ) {}

  async sendCalendarDay(ctx: Context, date: string) {
    const markupData = await this.getMarkupData(ctx, date);

    const markup = await calendarDaysMarkup({ date, ...markupData });

    await sendMessage(calendarDaysMessage(date), {
      ctx,
      reply_markup: markup,
      type: 'send',
    });
  }

  async changeToCalendarDay(ctx: Context, date: string) {
    const markupData = await this.getMarkupData(ctx, date);

    const markup = await calendarDaysMarkup({ date, ...markupData });

    await sendMessage(calendarDaysMessage(date), {
      ctx,
      reply_markup: markup,
    });
  }

  async setDayBusy(ctx: Context) {
    const { dataValue, ctxUser } = getCtxData(ctx);

    await this.createBusyDayByDateVal({
      dateVal: dataValue,
      userTelegramId: ctxUser.id,
      type: 'manually',
    });

    await this.changeToCalendarDay(ctx, dataValue);
  }

  async deleteBusyDay(ctx: Context) {
    const { dataValue, ctxUser } = getCtxData(ctx);

    await this.deleteBusyDayByDateVal({
      dateVal: dataValue,
      userTelegramId: ctxUser.id,
    });

    await this.changeToCalendarDay(ctx, dataValue);
  }

  async createBusyDayByDateVal({
    dateVal,
    userTelegramId,
    type = 'auto',
  }: {
    dateVal: string;
    userTelegramId: string;
    type?: string;
  }) {
    const [date, month, year] = dateVal.split('.');
    const user = await this.usersRepository.findByTgId(userTelegramId);

    if (!user) return;

    const busyDay = await this.busyDaysRepository.create({
      userId: user.id,
      userTelegramId,
      date: +date,
      month: +month,
      year: +year,
      type,
    });

    return busyDay;
  }

  async deleteBusyDayByDateVal({
    dateVal,
    userTelegramId,
  }: {
    dateVal: string;
    userTelegramId: string;
  }) {
    const [date, month, year] = dateVal.split('.');
    const user = await this.usersRepository.findByTgId(userTelegramId);

    if (!user) return;

    const data = await this.busyDaysRepository.destroy({
      where: {
        userId: user.id,
        userTelegramId,
        date: +date,
        month: +month,
        year: +year,
      },
    });

    return data;
  }

  private async getMarkupData(ctx: Context, dateVal: string) {
    const { ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;
    const user = await this.usersRepository.findByTgId(userTgId);
    const userId = user.id;
    const eventMembers = await this.eventsMembersRepository.findAll({
      where: {
        userTelegramId: userTgId,
      },
      include: [CalendarEvent],
    });
    const date = getDateFromDataVal(dateVal);
    const busyDay = await this.busyDaysRepository.findOne({
      where: {
        userId,
        month: date.getUTCMonth() + 1,
        date: date.getUTCDate(),
      },
    });

    const sortedEvents = filterEventsByDate(
      eventMembers.map((i) => ({
        ...i?.event?.dataValues,
        startTime: getNowDateWithTZ({
          initDate: i?.event?.startTime,
          timezone: user.timezone,
        }),
        endTime: getNowDateWithTZ({
          initDate: i?.event?.endTime,
          timezone: user.timezone,
        }),
      })),
      dateVal,
    );

    return {
      userId,
      events: sortedEvents,
      busyDay,
      createPagination: async (conf: Omit<CreatePaginationProps, 'userId'>) => {
        return await this.paginationService.create({
          userId: user.id,
          ...conf,
        });
      },
    };
  }
}
