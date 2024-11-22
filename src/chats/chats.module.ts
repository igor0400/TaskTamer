import { Module } from '@nestjs/common';
import { ChatsUpdate } from './chats.update';
import { ChatsService } from './chats.service';

@Module({
  providers: [ChatsService, ChatsUpdate],
})
export class ChatsModule {}
