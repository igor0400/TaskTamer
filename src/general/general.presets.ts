import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
import { sendMessage } from './assets';

@Injectable()
export class GeneralPresets {
  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {}

  async sendLoading(ctx: Context, initText = '♻️ Загрузка') {
    let isWork = true;
    let count = 2;
    let type = 'dec';

    const message = await ctx.sendMessage(this.textWrapper(`${initText}...`), {
      parse_mode: 'HTML',
      disable_notification: true,
    });

    const internalId = setInterval(async () => {
      let text = initText;
      for (let i = 0; i < count; i++) {
        text += '.';
      }

      if (type === 'inc') {
        count++;
      } else {
        count--;
      }

      if (count === 0) {
        type = 'inc';
      }

      if (count === 3) {
        type = 'dec';
      }

      await sendMessage(this.textWrapper(text), {
        bot: this.bot,
        chatId: message.chat.id,
        messageId: message.message_id,
        isBanner: false,
      });
    }, 500);

    const chatId = message.chat.id;
    const messageId = message.message_id;

    return {
      messageId,
      chatId,
      isWork,
      stop: () => {
        isWork = false;
        clearInterval(internalId);
      },
      stopAndDelete: async () => {
        isWork = false;
        clearInterval(internalId);
        try {
          await this.bot.telegram.deleteMessage(chatId, messageId);
        } catch (e) {}
      },
    };
  }

  async sendTempMessage({
    ctx,
    text,
    isDeleteInitMess = false,
    time = 3000,
  }: {
    ctx: Context;
    text: string;
    isDeleteInitMess?: boolean;
    time?: number;
  }) {
    const mess = await ctx.reply(text, {
      parse_mode: 'HTML',
    });

    setTimeout(async () => {
      if (isDeleteInitMess) {
        try {
          await ctx.deleteMessage();
        } catch (e) {}
      }
      try {
        await this.bot.telegram.deleteMessage(mess.chat.id, mess.message_id);
      } catch (e) {}
    }, time);
  }

  private textWrapper(text: string) {
    return `<b>${text}</b>`;
  }
}
