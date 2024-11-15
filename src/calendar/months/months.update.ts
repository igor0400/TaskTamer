import { Action, Command, Update } from 'nestjs-telegraf';
import { CalendarMonthsService } from './months.service';
import { Context } from 'telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { getCtxData } from 'src/libs/common';
import { getMonthDifferenceByDateVal } from './assets';

@Update()
export class CalendarMonthsUpdate {
  constructor(
    private readonly monthsService: CalendarMonthsService,
    private readonly middlewares: GeneralMiddlewares,
  ) {}

  @Command('calendar')
  async calendarCommand(ctx: Context) {
    await this.middlewares.commandMiddleware(ctx, (ctx: Context) =>
      this.monthsService.sendMonth(ctx),
    );
  }

  @Action('calendar_service')
  async calendarBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.monthsService.changeToMonth(ctx),
    );
  }

  @Action(/.*::next_calendar_month/)
  async nextMonthBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.monthsService.navMonthItem(ctx, 'next'),
    );
  }

  @Action(/.*::prev_calendar_month/)
  async prevMonthBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.monthsService.navMonthItem(ctx, 'prev'),
    );
  }

  @Action(/.*::back_to_calendar_month/)
  async backToMonthBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);
    const incMonths = getMonthDifferenceByDateVal(dataValue);

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.monthsService.changeToMonth(ctx, incMonths),
    );
  }
}
