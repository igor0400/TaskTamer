import { On, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ChatsService } from './chats.service';

@Update()
export class ChatsUpdate {
  constructor(private readonly chatsService: ChatsService) {}

  @On(['new_chat_members', 'group_chat_created'])
  async onAddToChat(ctx: Context) {
    await this.chatsService.onBotAddedToChat(ctx);
  }
}
