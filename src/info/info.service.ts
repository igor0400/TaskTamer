import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { infoMarkup, infoMessage } from './responses';
import { sendMessage } from 'src/general';

@Injectable()
export class InfoService {
  async changeToInfo(ctx: Context) {
    await sendMessage(infoMessage(), {
      ctx,
      reply_markup: infoMarkup,
    });
  }
}
