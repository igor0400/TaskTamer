import { Action, Update } from 'nestjs-telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { TimezoneService } from './timezone.service';
import { Context } from 'telegraf';

@Update()
export class TimezoneUpdate {
  constructor(
    private readonly middlewares: GeneralMiddlewares,
    private readonly timezoneService: TimezoneService,
  ) {}

  @Action('change_user_timezone')
  async changeUserTZBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.timezoneService.changeUserTimezone(ctx),
    );
  }

  @Action(/.*::change_set_tz_hours/)
  async changeSetTZHoursBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.timezoneService.changeSetTimezoneHours(ctx),
    );
  }

  @Action(/.*::save_timezone/)
  async saveTimezoneBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.timezoneService.saveTimezone(ctx),
    );
  }
}
