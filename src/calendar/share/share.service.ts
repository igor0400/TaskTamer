import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { ShareCalendarMonthsService } from '../months/share-months.service';
import { getMonthDifferenceByDateVal } from '../months/assets';
import { getZero } from 'src/libs/common';
import { ShareCalendarDaysService } from '../days/share-days.service';
import { ShareEventsService } from '../events/share-events.service';
import { CalendarMonthsService } from '../months/months.service';

@Injectable()
export class ShareCalendarService {
  constructor(
    private readonly monthsService: CalendarMonthsService,
    private readonly shareMonthsService: ShareCalendarMonthsService,
    private readonly shareDaysService: ShareCalendarDaysService,
    private readonly shareEventsService: ShareEventsService,
  ) {}

  async argsHandler(ctx: Context | any) {
    const args = ctx?.args[0]?.split('-');
    const serviceType = args[1];
    const userId = args[args.length - 1];

    if (serviceType === 'm') {
      const [month, year] = args[2]?.split('_');
      const incMonths = getMonthDifferenceByDateVal(
        `02.${getZero(month)}.${year}`,
      );

      return await this.shareMonthsService.sendMonth(ctx, userId, incMonths);
    }

    if (serviceType === 'd') {
      const dateVal = args[2]?.replaceAll('_', '.');

      return await this.shareDaysService.sendCalendarDay(ctx, dateVal, userId);
    }

    if (serviceType === 'e') {
      const actionType = args[2];
      const eventId = args[3];

      if (actionType === 'j') {
        return await this.shareEventsService.sendInviteEvent(
          ctx,
          eventId,
          userId,
        );
      }
    }

    await this.monthsService.sendMonth(ctx);
  }
}
