import { Action, Update } from 'nestjs-telegraf';
import { CalendarDaysService } from './days.service';
import { Context } from 'telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { getCtxData } from 'src/libs/common';

@Update()
export class CalendarDaysUpdate {
  constructor(
    private readonly calendarDaysService: CalendarDaysService,
    private readonly middlewares: GeneralMiddlewares,
  ) {}

  @Action([/.*::calendar_date/, /.*::back_to_calendar_date/])
  async calendarDayBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.calendarDaysService.changeToCalendarDay(
        ctx,
        dataValue.split('_')[0],
      ),
    );
  }

  @Action(/.*::sey_busy_calendar_day/)
  async setBusyDayBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.calendarDaysService.setDayBusy(ctx),
    );
  }

  @Action(/.*::set_unbusy_calendar_day/)
  async deleteBusyDayBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.calendarDaysService.deleteBusyDay(ctx),
    );
  }
}
