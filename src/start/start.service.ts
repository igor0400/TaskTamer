import { Injectable } from '@nestjs/common';
import { MenuService } from 'src/menu/menu.service';
import { Context } from 'telegraf';
import { StartArgsService } from './args.service';
import { sendMessage } from 'src/general';

@Injectable()
export class StartService {
  constructor(
    private readonly menuService: MenuService,
    private readonly argsService: StartArgsService,
  ) {}

  async sendStart(ctx: Context | any) {
    const args = ctx.args;

    if (args.length) {
      return await this.argsService.argsHandler(ctx);
    }

    await this.sendStartMessage(ctx);
  }

  async sendStartMessage(ctx: Context) {
    await sendMessage('👋', {
      ctx,
      type: 'send',
      isBanner: false,
    });
    await this.menuService.sendMenu(ctx);
  }
}
