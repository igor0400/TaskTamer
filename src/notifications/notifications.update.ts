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

  @Action(/.*::notifi_to_calendar_event/)
  async calendarEventNotificationBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.notificationsService.changeToCalendarNotification(ctx),
    );
  }

  @Action(/.*::set_event_notifi/)
  async setEventNotifiBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.notificationsService.setEventNotification(ctx),
    );
  }

  @Action(/.*::start_change_notifi_event_time/)
  async startChangeNotifiEventTimeBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.notificationsService.startChangeEventNotification(ctx),
    );
  }

  @Action(/.*::change_notifi_event_time/)
  async changNotifiEventTimeBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.notificationsService.changeEventNotification(ctx),
    );
  }

  @Action(/.*::delete_notifi_event_time/)
  async deleteNotifiEventTimeBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.notificationsService.deleteEventNotification(ctx),
    );
  }
}
