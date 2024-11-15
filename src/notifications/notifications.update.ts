import { Action, Update } from 'nestjs-telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { Context } from 'telegraf';
import { NotificationsService } from './notifications.service';
import { getCtxData } from 'src/libs/common';

@Update()
export class NotificationsUpdate {
  constructor(
    private readonly middlewares: GeneralMiddlewares,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Action(['user_notifications', 'back_to_user_notifications'])
  async userNotificationsBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.notificationsService.changeToBasicNotifications(ctx),
    );
  }

  @Action(/.*::user_notification/)
  async userNotificationBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.notificationsService.changeToBasicNotification(ctx, dataValue),
    );
  }
}
