import { Injectable } from '@nestjs/common';
import { MenuService } from 'src/menu/menu.service';
import { Context } from 'telegraf';
import { StartArgsService } from './args.service';

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
    await this.menuService.sendMainKeyboard(ctx);
    await this.menuService.sendMenu(ctx);
  }
}
