import { Injectable } from '@nestjs/common';
import { Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { menuMarkup, menuMessage } from './responses';
import { sendMessage } from 'src/general';

@Injectable()
export class MenuService {
  async sendMenu(@Ctx() ctx: Context) {
    await sendMessage(menuMessage(), {
      ctx,
      reply_markup: menuMarkup,
      type: 'send',
    });
  }

  async changeToMenu(@Ctx() ctx: Context) {
    await sendMessage(menuMessage(), {
      ctx,
      reply_markup: menuMarkup,
    });
  }
}
