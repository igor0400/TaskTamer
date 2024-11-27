import { Injectable } from '@nestjs/common';
import { commandsLocale } from './locale';
import { CommandType } from './types';
import { Context } from 'telegraf';
import { WaitersRepository } from 'src/listeners/repositories/waiter.repository';
import { ChainRepository } from 'src/libs/chain/repositories/chain.repository';
import { UserRepository } from 'src/users/repositories/user.repository';
import { getCtxData, getNowDateWithTZ } from 'src/libs/common';
import { parseEventDataFromRequest } from 'src/calendar/events/assets';
import { ShareEventsService } from 'src/calendar/events/share-events.service';
import { EventsService } from 'src/calendar/events/events.service';
import { sendMessage } from 'src/general';
import { helpCommandsMessage } from './responses';
import { Op } from 'sequelize';
import { EventsRepository } from 'src/calendar/repositories/event.repository';
import { GeneralPresets } from 'src/general/general.presets';
import { MailingRepository } from 'src/mailings/repositories/mailing.repository';
import { MailingTemplateRepository } from 'src/mailings/repositories/mailing-template.repository';

interface CommandsType {
  [key: string]: CommandType;
}

@Injectable()
export class CommandsService {
  constructor(
    private readonly waitersRepository: WaitersRepository,
    private readonly chainRepository: ChainRepository,
    private readonly userRepository: UserRepository,
    private readonly shareEventsService: ShareEventsService,
    private readonly eventsService: EventsService,
    private readonly eventsRepository: EventsRepository,
    private readonly generalPresets: GeneralPresets,
    private readonly mailingRepository: MailingRepository,
    private readonly mailingTemplateRepository: MailingTemplateRepository,
  ) {}

  inlineEventsCommands = (lang: string = 'ru'): CommandsType => ({
    create: {
      ...commandsLocale(lang).create,
      action: (...args) => this.createEventByInlineArgs(...args),
    },
    find: {
      ...commandsLocale(lang).find,
      action: (...args) => this.findEventByInlineArgs(...args),
    },
  });

  async createEventByInlineArgs(ctx: Context, args: string[]) {
    const { ctxUser } = getCtxData(ctx);

    const query = args.join(' ');

    const user = await this.userRepository.findByTgId(ctxUser.id);

    const { startTime, endTime, eventTitle } = parseEventDataFromRequest(
      query,
      user.timezone,
    );

    if (!startTime) {
      // парсить чисто дату или месяц если есть то присылать дату или месяц
      // пример ввода, 22.11, 22.11.2024, январь, январь 2025, 5 января

      return sendMessage(helpCommandsMessage(), {
        ctx,
        type: 'send',
        isBanner: false,
      });
    }

    const isTimeBusy = await this.shareEventsService.checkIsTimeBusy({
      startTime,
      endTime,
      userTgId: user.telegramId,
    });

    if (isTimeBusy) {
      return sendMessage('🚫 <b>Это время у вас уже занято</b>', {
        ctx,
        type: 'send',
        isBanner: false,
      });
    }

    const newEvent = await this.eventsService.createEvent({
      creatorTgId: ctxUser?.id,
      title: eventTitle,
      startTime: getNowDateWithTZ({
        initDate: startTime,
        timezone: user?.timezone,
      }),
      endTime: getNowDateWithTZ({
        initDate: endTime,
        timezone: user?.timezone,
      }),
      membersTgIds: [ctxUser?.id],
    });

    await this.eventsService.sendEvent(ctx, newEvent.id);
  }

  async findEventByInlineArgs(ctx: Context, args: string[]) {
    const { ctxUser } = getCtxData(ctx);

    const query = args.join(' ');

    const loading = await this.generalPresets.sendLoading(ctx, '🔎 Поиск');

    const user = await this.userRepository.findByTgId(ctxUser.id);

    const { startTime, eventTitle } = parseEventDataFromRequest(
      query,
      user.timezone,
    );

    if (!startTime && !eventTitle) {
      // проверять на дату или месяц

      return sendMessage(helpCommandsMessage(), {
        ctx,
        type: 'send',
        isBanner: false,
      });
    }

    const matchedEvent = await this.getMatchedEvent({
      creatorId: user.id,
      startTime,
      eventTitle,
    });

    await loading.stopAndDelete();

    if (matchedEvent) {
      await this.eventsService.sendEvent(ctx, matchedEvent.id);
    } else {
      // проверять на дату или месяц

      return sendMessage('🤷‍♂️ <b>Событие не найдено</b>', {
        ctx,
        type: 'send',
        isBanner: false,
      });
    }
  }

  private async getMatchedEvent({ creatorId, eventTitle, startTime }) {
    const whereCondition: any = {
      creatorId,
      [Op.or]: [],
    };

    if (eventTitle) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);

      whereCondition[Op.or].push({
        title: {
          [Op.like]: `%${eventTitle}%`,
        },
      });
    }

    if (startTime) {
      whereCondition[Op.or].push({
        startTime,
      });
    }

    if (whereCondition[Op.or].length === 0) {
      delete whereCondition[Op.or];
    }

    return await this.eventsRepository.findOne({
      where: whereCondition,
    });
  }

  async onTextMessage(ctx: Context, initChatCommand?: string) {
    const { ctxUser, message } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);
    const userId = user.id;

    const textWaiter = await this.waitersRepository.findOne({
      where: { userId, kind: 'text' },
    });

    const chain = await this.chainRepository.findOne({
      where: { userId },
    });

    const mailing = await this.mailingRepository.findOne({
      where: { userId: user.id, status: 'CREATING' },
    });

    const mailingTemplate = await this.mailingTemplateRepository.findOne({
      where: { userId: user.id, status: 'CREATING' },
    });

    if (
      textWaiter ||
      chain ||
      mailing ||
      mailingTemplate ||
      ctx?.chat?.type !== 'private'
    ) {
      return;
    }

    const chatCommand = initChatCommand
      ? initChatCommand?.trim()?.toLowerCase()
      : message.text?.trim()?.toLowerCase();

    const commandsList = this.inlineEventsCommands('ru');

    for (let command in commandsList) {
      const commandData = commandsList[command];
      const titles = commandData?.titles ?? [];

      for (let title of titles) {
        const titleLen = title?.split(' ').length;
        const commandTitle = chatCommand
          ?.split(' ')
          ?.slice(0, titleLen)
          ?.join(' ');

        if (commandTitle === title) {
          const clearArgs = chatCommand
            .replaceAll(new RegExp(title, 'gi'), '')
            ?.trim()
            ?.split(' ')
            ?.filter((i) => !commandData?.replaceArgs?.includes(i) && i);

          await commandData.action(ctx, clearArgs);
          return true;
        }
      }
    }

    const args = chatCommand?.split(' ');
    commandsList.create.action(ctx, args);
  }

  async onVoiceMessage(ctx: Context) {
    console.log(ctx);
  }
}

// сделать команды: удали, напомни

// сделать функцию на парсинг только даты или месяца
