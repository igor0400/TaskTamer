import { Command, On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ChatsService } from './chats.service';

@Update()
export class ChatsUpdate {
  constructor(private readonly chatsService: ChatsService) {}

  // @On(['new_chat_members', 'group_chat_created'])
  async onAddToChat(ctx: Context) {
    await this.chatsService.onBotAddedToChat(ctx);
  }

  // @Command('test_chats')
  async startCommand(ctx: Context) {
    // Отправляем кнопку запроса группы
    await ctx.reply('Нажмите кнопку ниже, чтобы выбрать группу:', {
      reply_markup: {
        keyboard: [
          [
            {
              text: 'Выбрать чат',
              // @ts-ignore
              request_chat: {
                request_id: 1,
                chat_is_channel: false,
                user_administrator_rights: null,
                bot_administrator_rights: null,
              },
            },
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
        remove_keyboard: true,
      },
    });
  }

  // @On('chat_shared')
  async onChatShared(ctx: Context) {
    // @ts-ignore
    const chatId = ctx.message.chat_shared.chat_id;

    // @ts-ignore
    console.log(ctx.message.chat_shared);

    await ctx.reply(`Вы выбрали группу с ID: ${chatId}`);
  }
}
