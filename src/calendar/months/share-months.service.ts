import { Injectable } from '@nestjs/common';
import { replyPhoto } from 'src/libs/common';
import { Context } from 'telegraf';
import {
  shareCalendarMonthsMessage,
  shareCalendarMonthsMarkup,
} from './responses';
import { getCtxData, getNowDate } from 'src/libs/common';
import { BusyDaysRepository } from '../repositories/busy-day.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { sendMessage } from 'src/general';

@Injectable()
export class ShareCalendarMonthsService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly busyDaysRepository: BusyDaysRepository,
  ) {}

  async sendMonth(ctx: Context, userId: string, incMonth: number = 0) {
    await this.sendContent(ctx, userId, incMonth, true);
  }

  async changeToMonth(ctx: Context, userId: string, incMonth: number = 0) {
    await this.sendContent(ctx, userId, incMonth, false);
  }

  async navMonthItem(ctx: Context, type: 'next' | 'prev') {
    const { dataValue } = getCtxData(ctx);
    const splitData = dataValue.split('_');
    const monthInt = +splitData[0];
    const incMonth = type === 'prev' ? monthInt - 1 : monthInt + 1;

    await this.sendContent(ctx, splitData[1], incMonth, false);
  }

  private async sendContent(
    ctx: Context,
    userId: string,
    incMonth: number = 0,
    isSend: boolean = true,
  ) {
    const user = await this.userRepository.findByPk(userId);
    const busyDays = await this.busyDaysRepository.findAll({
      where: {
        userId: user.id,
        month: getNowDate().getUTCMonth() + 1 + incMonth,
      },
    });

    await sendMessage(shareCalendarMonthsMessage(user), {
      ctx,
      reply_markup: shareCalendarMonthsMarkup(
        user?.id,
        busyDays,
        incMonth,
        user.timezone,
      ),
      type: isSend ? 'send' : 'edit',
    });
  }
}
