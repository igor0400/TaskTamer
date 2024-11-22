import { Injectable } from '@nestjs/common';
import { getCtxData } from 'src/libs/common';
import { Context } from 'telegraf';

@Injectable()
export class ChatsService {
  async onBotAddedToChat(ctx: Context) {
    const { message } = getCtxData(ctx);
    const { chat, new_chat_member } = message;

    if (
      (new_chat_member &&
        new_chat_member.username === process.env.BOT_USERNAME) ||
      !new_chat_member
    ) {
      ctx.reply('Hello!');
    }

    const admins = await ctx.telegram.getChatAdministrators(chat.id);

    console.log(admins);
  }
}
