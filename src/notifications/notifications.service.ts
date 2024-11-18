import { Injectable } from '@nestjs/common';
import { getCtxData } from 'src/libs/common';
import { Context } from 'telegraf';
import {
  basicNotificationsMarkup,
  basicNotificationsMessage,
  setEventNotificationMarkup,
  setEventNotificationMessage,
} from './responses';
import { BasicNotificationRepository } from './repositories/basic-notification.repository';
import { sendMessage } from 'src/general';
import { NoiseNotificationRepository } from './repositories/noise-notification.repository';
import { UserRepository } from 'src/users/repositories/user.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly basicNotificationRepository: BasicNotificationRepository,
    private readonly noiseNotificationRepository: NoiseNotificationRepository,
    private readonly userRepository: UserRepository,
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

  async changeToCalendarNotification(ctx: Context) {
    const { ctxUser, dataValue } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);

    const notification = await this.noiseNotificationRepository.findOne({
      where: {
        userId: user.id,
        type: `event_${dataValue}`,
      },
    });

    if (notification) {
      return; // изменить/убрать напоминание
    }

    await sendMessage(setEventNotificationMessage(), {
      ctx,
      reply_markup: setEventNotificationMarkup(dataValue),
    });
  }
}
