import { Injectable } from '@nestjs/common';
import { replyPhoto } from 'src/libs/common';
import { Context } from 'telegraf';
import { calendarMonthsMarkup, calendarMonthsMessage } from './responses';
import { getCtxData, getNowDate } from 'src/libs/common';
import { BusyDaysRepository } from '../repositories/busy-day.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { sendMessage } from 'src/general';

@Injectable()
export class CalendarMonthsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly busyDaysRepository: BusyDaysRepository,
  ) {}

  async sendMonth(ctx: Context, incMonth: number = 0) {
    await this.sendContent(ctx, incMonth, true);
  }

  async changeToMonth(ctx: Context, incMonth: number = 0) {
    await this.sendContent(ctx, incMonth, false);
  }

  async navMonthItem(ctx: Context, type: 'next' | 'prev') {
    const { data } = getCtxData(ctx);
    const monthInt = +data.split('::')[0];
    const incMonth = type === 'prev' ? monthInt - 1 : monthInt + 1;

    await this.sendContent(ctx, incMonth, false);
  }

  private async sendContent(
    ctx: Context,
    incMonth: number = 0,
    isSend: boolean = true,
  ) {
    const { ctxUser } = getCtxData(ctx);
    const userId = ctxUser.id;
    const user = await this.userRepository.findByTgId(userId);
    const busyDays = await this.busyDaysRepository.findAll({
      where: {
        userId: user.id,
        month: getNowDate().getUTCMonth() + 1 + incMonth,
      },
    });

    await sendMessage(calendarMonthsMessage(), {
      ctx,
      reply_markup: calendarMonthsMarkup(
        user?.id,
        busyDays,
        incMonth,
        user.timezone,
      ),
      type: isSend ? 'send' : 'edit',
    });
  }
}
