import { Injectable } from '@nestjs/common';
import { Context } from 'telegraf';
import { servicesMarkup, servicesMessage } from './responses';
import { sendMessage } from 'src/general';

@Injectable()
export class ServicesService {
  async sendServices(ctx: Context) {
    await sendMessage(servicesMessage(), {
      ctx,
      reply_markup: servicesMarkup,
      type: 'send',
    });
  }

  async changeToServices(ctx: Context) {
    await sendMessage(servicesMessage(), {
      ctx,
      reply_markup: servicesMarkup,
    });
  }
}
