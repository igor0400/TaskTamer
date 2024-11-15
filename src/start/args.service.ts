import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Context } from 'telegraf';
import { StartService } from './start.service';
import { ShareCalendarService } from 'src/calendar/share/share.service';
import { sendMessage } from 'src/general';

@Injectable()
export class StartArgsService {
  constructor(
    @Inject(forwardRef(() => StartService))
    private readonly startService: StartService,
    private readonly shareCalendarService: ShareCalendarService,
  ) {}

  async argsHandler(ctx: Context | any) {
    const args = ctx?.args[0]?.split('-');
    const serviceType = args[0];

    if (serviceType === 'cal') {
      return await this.shareCalendarService.argsHandler(ctx);
    }

    await sendMessage('⚠️ <b>Возможно ссылка устарела!</b>', {
      ctx,
      type: 'send',
      isBanner: false,
    });
    await this.startService.sendStartMessage(ctx);
  }
}
