import { Injectable } from '@nestjs/common';
import { getCtxData } from 'src/libs/common';
import { Context } from 'telegraf';
import {
  basicNotificationsMarkup,
  basicNotificationsMessage,
} from './responses';
import { BasicNotificationRepository } from './repositories/basic-notification.repository';
import { sendMessage } from 'src/general';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly basicNotificationRepository: BasicNotificationRepository,
  ) {}

  async changeToBasicNotifications(ctx: Context) {
    const { ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;
    const notifications = await this.basicNotificationRepository.findAll({
      where: {
        userTelegramId: userTgId,
      },
    });

    await sendMessage(basicNotificationsMessage(), {
      ctx,
      reply_markup: basicNotificationsMarkup(notifications),
    });
  }

  async changeToBasicNotification(ctx: Context, notificationId: string) {
    const notification = await this.basicNotificationRepository.findByPk(
      notificationId,
    );

    await sendMessage(notification.text, {
      ctx,
      reply_markup: notification.markup
        ? JSON.parse(notification.markup)
        : undefined,
    });
  }

  async changeToCalendarNotification(ctx: Context) {}
}
