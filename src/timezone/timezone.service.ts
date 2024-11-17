import { Injectable } from '@nestjs/common';
import { sendMessage } from 'src/general';
import { Context } from 'telegraf';
import { setTimezoneMarkup, setTimezoneMessage } from './responses';
import { getCtxData } from 'src/libs/common';
import { UserRepository } from 'src/users/repositories/user.repository';
import { ProfileService } from 'src/profile/profile.service';

@Injectable()
export class TimezoneService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileService: ProfileService,
  ) {}

  async changeUserTimezone(ctx: Context) {
    const { ctxUser } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);

    await sendMessage(setTimezoneMessage(), {
      ctx,
      reply_markup: setTimezoneMarkup(user?.timezone ?? '+3'),
    });
  }

  async changeSetTimezoneHours(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await sendMessage(setTimezoneMessage(), {
      ctx,
      reply_markup: setTimezoneMarkup(dataValue),
    });
  }

  async saveTimezone(ctx: Context) {
    const { ctxUser, dataValue } = getCtxData(ctx);

    const user = await this.userRepository.findByTgId(ctxUser.id);

    if (user) {
      user.timezone = dataValue;
      await user.save();
    }

    try {
      await ctx.answerCbQuery(`✅ Часовой пояс обновлен`, { show_alert: true });
    } catch (e) {}

    await this.profileService.changeToProfile(ctx);
  }
}
