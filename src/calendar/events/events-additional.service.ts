import { Injectable } from '@nestjs/common';
import { getCtxData, getZero } from 'src/libs/common';
import { Context } from 'telegraf';
import {
  selectEventHoursMarkup,
  selectEventHoursMessage,
  writeTitleMarkup,
  writeTitleMessage,
  deleteEventConfirmMessage,
  deleteEventConfirmMarkup,
  leaveEventConfirmMessage,
  leaveEventConfirmMarkup,
} from './responses';
import { EventsMembersRepository } from '../repositories/event-member.repository';
import { CalendarEvent } from '../models/event.model';
import { getDateFromDataVal, getFreeIntervals } from '../assets';
import { filterEventsByDate, filterMultyEvents } from './assets';
import { EventsService } from './events.service';
import { UserRepository } from 'src/users/repositories/user.repository';
import { Op } from 'sequelize';
import { WaitersRepository } from 'src/listeners/repositories/waiter.repository';
import { PaginationService } from 'src/libs/pagination/pagination.service';
import { CreatePaginationProps } from 'src/libs/pagination/types';
import { sendMessage } from 'src/general';

export interface ChangeToSelectHoursOpts {
  callbackDataTitle: string;
  type: 'start' | 'end';
  calType?: 'pers' | 'share';
  userId?: string;
  startTime?: string;
}

@Injectable()
export class EventsAdditionalService {
  constructor(
    private readonly eventsMembersRepository: EventsMembersRepository,
    private readonly paginationService: PaginationService,
    private readonly waitersRepository: WaitersRepository,
    private readonly userRepository: UserRepository,
    private readonly eventsService: EventsService,
  ) {}

  async changeToSelectHours(ctx: Context, options: ChangeToSelectHoursOpts) {
    const { ctxUser, dataValue } = getCtxData(ctx);

    const dateVal =
      options.calType === 'pers'
        ? dataValue?.split('-')[0]
        : dataValue?.split('_')[0]?.split('-')[0];

    const user = await this.userRepository.findByPk(options?.userId ?? '');
    const userTgId = options.userId ? user?.telegramId : ctxUser.id;
    const creatorTgId = ctxUser.id;
    const creator = await this.userRepository.findByTgId(creatorTgId);

    const userId = options?.userId ?? creator.id;

    const eventsMembers = await this.eventsMembersRepository.findAll({
      where: {
        userTelegramId: {
          [Op.or]: [userTgId, creatorTgId],
        },
      },
      include: [CalendarEvent],
    });
    const events = eventsMembers.map((i) => i.event);
    const filteredEvents = filterMultyEvents(
      filterEventsByDate(events, dateVal),
    );
    const sortedEvents = filterEventsByDate(filteredEvents, dateVal);
    const initDate = getDateFromDataVal(dateVal);

    const freeIntervals = getFreeIntervals(
      initDate,
      sortedEvents,
      options.type === 'start' ? 0 : 1,
      options.type === 'start' ? '23:45' : '23:46',
    );

    const hoursIntervals = [];

    for (let freeInterval of freeIntervals) {
      const startTime = new Date(freeInterval.startTime);
      const endTime = new Date(freeInterval.endTime);
      const startTimeHours = startTime.getUTCHours();
      const startTimeMinutes = startTime.getUTCMinutes();
      const endTimeHours = endTime.getUTCHours();
      const endTimeMinutes = endTime.getUTCMinutes();

      if (options.startTime) {
        const optStartDate = freeInterval?.startTime?.replace(
          /T\d\d:\d\d/,
          `T${options.startTime.slice(0, 4)}${
            +options.startTime.slice(4, 5) + 1
          }`,
        );

        if (
          startTime < new Date(optStartDate) &&
          new Date(optStartDate) < endTime
        ) {
          hoursIntervals.push({
            startHours: startTimeHours,
            startMinutes: startTimeMinutes,
            endHours: endTimeHours,
            endMinutes: endTimeMinutes,
          });
        }
      } else {
        hoursIntervals.push({
          startHours: startTimeHours,
          startMinutes: startTimeMinutes,
          endHours: endTimeHours,
          endMinutes: endTimeMinutes,
        });
      }
    }

    const hoursTexts = [];

    for (let {
      startHours,
      startMinutes,
      endHours,
      endMinutes,
    } of hoursIntervals) {
      for (let i = startHours; i < endHours + 1; i++) {
        if (i === endHours) {
          for (let x = 0; x < endMinutes; x += 15) {
            hoursTexts.push(`${getZero(i)}:${getZero(x)}`);
          }
        } else if (i === startHours) {
          for (let x = startMinutes; x < 60; x += 15) {
            hoursTexts.push(`${getZero(i)}:${getZero(x)}`);
          }
        } else {
          for (let x = 0; x < 60; x += 15) {
            hoursTexts.push(`${getZero(i)}:${getZero(x)}`);
          }
        }
      }
    }

    const sortedHoursTexts = options.startTime
      ? hoursTexts.filter((i) => {
          const splI = i.split(':');
          const hours = +splI[0];
          const minutes = +splI[1];
          const splStart = options.startTime.split(':');
          const startHours = +splStart[0];
          const startMinutes = +splStart[1];

          if (hours < startHours) return false;

          if (hours === startHours) {
            if (minutes > startMinutes) return true;

            return false;
          }

          return true;
        })
      : hoursTexts;

    const markup = await selectEventHoursMarkup(
      dateVal,
      sortedHoursTexts,
      { ...options, userId },
      async (conf: Omit<CreatePaginationProps, 'userTelegramId'>) => {
        return await this.paginationService.create({
          userId,
          ...conf,
        });
      },
    );

    await sendMessage(selectEventHoursMessage(options), {
      ctx,
      reply_markup: markup,
    });
  }

  async changeToWriteTitle(ctx: Context) {
    const { dataValue, ctxUser, message } = getCtxData(ctx);
    const userTgId = ctxUser.id;
    const user = await this.userRepository.findByTgId(userTgId);

    await this.waitersRepository.create({
      type: 'create_pers_cal_event_title',
      kind: 'text',
      userId: user?.id,
      chatId: message?.chat?.id,
      messageId: message?.message_id,
      extraData: dataValue,
    });

    await sendMessage(writeTitleMessage(), {
      ctx,
      reply_markup: writeTitleMarkup(dataValue),
    });
  }

  async skipWriteTitle(ctx: Context) {
    const { dataValue, ctxUser } = getCtxData(ctx);

    const event = await this.eventsService.createEventByDataValue({
      dataValue,
      creatorTgId: ctxUser.id,
      membersTgIds: [ctxUser.id],
    });

    await this.eventsService.changeToEvent(ctx, event.id);
  }

  async deleteEventConfirm(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await sendMessage(deleteEventConfirmMessage(), {
      ctx,
      reply_markup: deleteEventConfirmMarkup(dataValue),
    });
  }

  async leaveEventConfirm(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await sendMessage(leaveEventConfirmMessage(), {
      ctx,
      reply_markup: leaveEventConfirmMarkup(dataValue),
    });
  }
}
