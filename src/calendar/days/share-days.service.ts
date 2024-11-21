import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { shareCalendarDaysMarkup, shareCalendarDaysMessage } from './responses';
import { EventsMembersRepository } from '../repositories/event-member.repository';
import { CalendarEvent } from '../models/event.model';
import { BusyDaysRepository } from '../repositories/busy-day.repository';
import { getDateFromDataVal } from '../assets';
import { filterEventsByDate } from '../events/assets';
import { UserRepository } from 'src/users/repositories/user.repository';
import { sendMessage } from 'src/general';
import { getCtxData } from 'src/libs/common';

@Injectable()
export class ShareCalendarDaysService {
  constructor(
    private readonly eventsMembersRepository: EventsMembersRepository,
    private readonly usersRepository: UserRepository,
    private readonly busyDaysRepository: BusyDaysRepository,
  ) {}

  async sendCalendarDay(ctx: Context, date: string, userId: string) {
    const user = await this.usersRepository.findByPk(userId);
    const markupData = await this.getMarkupData(date, userId, ctx);

    await sendMessage(shareCalendarDaysMessage(date, user), {
      ctx,
      reply_markup: shareCalendarDaysMarkup({ date, ...markupData }),
      type: 'send',
    });
  }

  async changeToCalendarDay(ctx: Context, date: string, userId: string) {
    const user = await this.usersRepository.findByPk(userId);
    const markupData = await this.getMarkupData(date, userId, ctx);

    await sendMessage(shareCalendarDaysMessage(date, user), {
      ctx,
      reply_markup: shareCalendarDaysMarkup({ date, ...markupData }),
    });
  }

  private async getMarkupData(dateVal: string, userId: string, ctx: Context) {
    const { ctxUser } = getCtxData(ctx);
    const user = await this.usersRepository.findByTgId(ctxUser.id);

    const eventMembers = await this.eventsMembersRepository.findAll({
      where: {
        userId,
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
      eventMembers.map((i) => i.event),
      dateVal,
    );

    return {
      userId,
      events: sortedEvents,
      busyDay,
      timezone: user.timezone,
    };
  }
}
