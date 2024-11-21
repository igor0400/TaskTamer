import { Injectable } from '@nestjs/common';
import { getCtxData } from 'src/libs/common';
import { Context, Telegraf } from 'telegraf';
import {
  basicNotificationsMarkup,
  basicNotificationsMessage,
  chnageEventTimeNotificationMarkup,
  eventNotificationPageMarkup,
  eventNotificationPageMessage,
  noiseNotificationMarkup,
  noiseNotificationMessage,
  setEventNotificationMarkup,
  setEventNotificationMessage,
} from './responses';
import { BasicNotificationRepository } from './repositories/basic-notification.repository';
import { sendMessage } from 'src/general';
import { NoiseNotificationRepository } from './repositories/noise-notification.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { EventsRepository } from 'src/calendar/repositories/event.repository';
import { EventsService } from 'src/calendar/events/events.service';
import { Cron } from '@nestjs/schedule';
import { InjectBot } from 'nestjs-telegraf';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly basicNotificationRepository: BasicNotificationRepository,
    private readonly noiseNotificationRepository: NoiseNotificationRepository,
    private readonly eventsRepository: EventsRepository,
    private readonly eventsService: EventsService,
    private readonly userRepository: UserRepository,
    @InjectBot() private bot: Telegraf<Context>,
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

    const event = await this.eventsRepository.findByPk(dataValue);

    if (notification) {
      return sendMessage(
        eventNotificationPageMessage({ event, notifi: notification }),
        {
          ctx,
          reply_markup: eventNotificationPageMarkup(dataValue),
        },
      );
    }

    await sendMessage(setEventNotificationMessage(), {
      ctx,
      reply_markup: setEventNotificationMarkup(dataValue),
    });
  }

  async setEventNotification(ctx: Context) {
    const { dataValue } = getCtxData(ctx);
    const [eventId] = dataValue.split(':');

    const event = await this.eventsRepository.findByPk(eventId);

    const notification = await this.createEventNotification({ ctx });

    try {
      await ctx.answerCbQuery(`✅ Напоминание установлено`, {
        show_alert: true,
      });
    } catch (e) {}

    await sendMessage(
      eventNotificationPageMessage({ event, notifi: notification }),
      {
        ctx,
        reply_markup: eventNotificationPageMarkup(eventId),
      },
    );
  }

  async startChangeEventNotification(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await sendMessage(setEventNotificationMessage(), {
      ctx,
      reply_markup: chnageEventTimeNotificationMarkup(dataValue),
    });
  }

  async changeEventNotification(ctx: Context) {
    const { ctxUser, dataValue } = getCtxData(ctx);
    const [eventId] = dataValue.split(':');

    const user = await this.userRepository.findByTgId(ctxUser.id);

    const event = await this.eventsRepository.findByPk(eventId);

    await this.noiseNotificationRepository.destroy({
      where: {
        userId: user.id,
        type: `event_${eventId}`,
      },
    });

    const notification = await this.createEventNotification({ ctx });

    try {
      await ctx.answerCbQuery(`✅ Напоминание обновлено`, {
        show_alert: true,
      });
    } catch (e) {}

    await sendMessage(
      eventNotificationPageMessage({ event, notifi: notification }),
      {
        ctx,
        reply_markup: eventNotificationPageMarkup(eventId),
      },
    );
  }

  async deleteEventNotification(ctx: Context) {
    const { ctxUser, dataValue } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);

    await this.noiseNotificationRepository.destroy({
      where: {
        userId: user.id,
        type: `event_${dataValue}`,
      },
    });

    try {
      await ctx.answerCbQuery(`✅ Напоминание удалено`, {
        show_alert: true,
      });
    } catch (e) {}

    await this.eventsService.changeToEvent(ctx, dataValue);
  }

  private async createEventNotification({ ctx }) {
    const { ctxUser, dataValue } = getCtxData(ctx);
    const [eventId, addHours] = dataValue.split(':');

    const user = await this.userRepository.findByTgId(ctxUser.id);

    const event = await this.eventsRepository.findByPk(eventId);

    const sendTime = new Date(event.startTime);

    sendTime.setUTCHours(sendTime.getUTCHours() + Number(addHours));

    return this.noiseNotificationRepository.create({
      userId: user.id,
      type: `event_${eventId}`,
      title: 'Напоминание',
      text: noiseNotificationMessage({ event, addHours }),
      sendTime,
      extraData: addHours,
    });
  }

  @Cron('*/5 * * * *')
  async checkNotificationsToSend() {
    const allNotifications = await this.noiseNotificationRepository.findAll({});

    for (let notification of allNotifications) {
      if (
        new Date(new Date().toUTCString()) >= new Date(notification.sendTime)
      ) {
        const datesDiff =
          // @ts-ignore
          new Date(new Date().toUTCString()) - new Date(notification.sendTime);
        const diffMins = datesDiff / 1000 / 60;

        if (diffMins <= 10) {
          const user = await this.userRepository.findByPk(notification.userId);

          await sendMessage(notification.text, {
            bot: this.bot,
            type: 'send',
            isBanner: false,
            chatId: user.telegramId,
            reply_markup: JSON.parse(notification.markup),
          });
        }

        await this.noiseNotificationRepository.destroy({
          where: { id: notification.id },
        });
      }
    }
  }
}
