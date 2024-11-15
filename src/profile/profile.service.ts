import { Injectable } from '@nestjs/common';
import { getCtxData, replyPhoto } from 'src/libs/common';
import { Context } from 'telegraf';
import { profileMarkup, profileMessage } from './responses';
import { UserRepository } from 'src/users/repositories/user.repository';
import { BasicNotificationRepository } from 'src/notifications/repositories/basic-notification.repository';
import { sendMessage } from 'src/general';

@Injectable()
export class ProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly basicNotificationRepository: BasicNotificationRepository,
  ) {}

  async sendProfile(ctx: Context) {
    await this.profileDefaultHandler(ctx, 'send');
  }

  async changeToProfile(ctx: Context) {
    await this.profileDefaultHandler(ctx, 'edit');
  }

  private async profileDefaultHandler(
    ctx: Context,
    type: 'edit' | 'send' = 'send',
  ) {
    const { ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;
    const user = await this.userRepository.findByTgId(userTgId);
    const notifications = await this.basicNotificationRepository.findAll({
      where: { userTelegramId: userTgId },
    });
    const isFull = Boolean(notifications?.length);

    await sendMessage(profileMessage(user), {
      ctx,
      reply_markup: profileMarkup(user.id, isFull),
      type,
    });
  }
}
