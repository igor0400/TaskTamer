import { Action, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { getCtxData } from 'src/libs/common';
import { ShareCalendarDaysService } from './share-days.service';

@Update()
export class ShareCalendarDaysUpdate {
  constructor(
    private readonly calendarDaysService: ShareCalendarDaysService,
    private readonly middlewares: GeneralMiddlewares,
  ) {}

  @Action([/.*::share_calendar_date/, /.*::back_to_share_calendar_date/])
  async calendarDayBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);
    const splitData = dataValue.split('_');
    const date = splitData[0];
    const userId = splitData[1];

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.calendarDaysService.changeToCalendarDay(ctx, date, userId),
    );
  }
}
