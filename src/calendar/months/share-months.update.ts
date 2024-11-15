import { Action, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { getCtxData } from 'src/libs/common';
import { ShareCalendarMonthsService } from './share-months.service';
import { getMonthDifferenceByDateVal } from './assets';

@Update()
export class ShareCalendarMonthsUpdate {
  constructor(
    private readonly shareMonthsService: ShareCalendarMonthsService,
    private readonly middlewares: GeneralMiddlewares,
  ) {}

  @Action(/.*::next_share_calendar_month/)
  async nextMonthBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.shareMonthsService.navMonthItem(ctx, 'next'),
    );
  }

  @Action(/.*::prev_share_calendar_month/)
  async prevMonthBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.shareMonthsService.navMonthItem(ctx, 'prev'),
    );
  }

  @Action(/.*::back_to_share_calendar_month/)
  async backToMonthBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);
    const [date, userId] = dataValue.split('_');
    const incMonths = getMonthDifferenceByDateVal(date);

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.shareMonthsService.changeToMonth(ctx, userId, incMonths),
    );
  }
}
