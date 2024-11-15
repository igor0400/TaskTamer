import { Injectable } from '@nestjs/common';
import { getCtxData, sendTempMessage } from 'src/libs/common';
import { Context, Telegraf } from 'telegraf';
import { UsersService } from 'src/users/users.service';
import { ListenersService } from 'src/listeners/listeners.service';
import { ChainService } from 'src/libs/chain/chain.service';
import { sendMessage } from './assets';
import { UserRepository } from 'src/users/repositories/user.repository';
import { InjectBot } from 'nestjs-telegraf';
import {
  banMarkup,
  banMessage,
  followNewsMarkup,
  followNewsMessage,
} from './responses';
import { BanUserRepository } from 'src/bans/repositories/ban-user.repository';

@Injectable()
export class GeneralMiddlewares {
  constructor(
    private readonly usersService: UsersService,
    private readonly listenersService: ListenersService,
    private readonly chainService: ChainService,
    private readonly banUserRepository: BanUserRepository,
    private readonly userRepository: UserRepository,
    @InjectBot() private readonly bot: Telegraf<Context>,
  ) {}

  async btnMiddleware(ctx: Context, func: Function) {
    const { ctxUser, dataValue } = getCtxData(ctx);
    const userTgId = ctxUser.id;

    if (!dataValue?.includes('unclearchain')) {
      await this.chainService.clearUserChains(userTgId);
    }

    await this.allWrappers(ctx, func, 'edit');
  }

  async commandMiddleware(ctx: Context | any, func: Function) {
    const { ctxUser, message } = getCtxData(ctx);

    if (message?.chat?.type !== 'private') {
      return await sendTempMessage({
        bot: this.bot,
        ctx,
        time: 5000,
        text: '🚫 <b>Эта команда работает только в личных сообщениях с ботом.</b>',
        isDeleteInitMess: true,
      });
    }

    const userTgId = ctxUser.id;
    await this.chainService.clearUserChains(userTgId);

    await this.allWrappers(ctx, func, 'send');
  }

  async сhatCommandMiddleware(ctx: Context | any, func: Function) {
    const { message } = getCtxData(ctx);

    if (message?.chat?.type === 'private') {
      return await this.commandMiddleware(ctx, func);
    }

    await this.usersService.updateUserNamesByCtx(ctx);
    await this.isBannedWrapper(ctx, func, 'send');
  }

  async listenerMiddleware(ctx: Context | any, func: Function) {
    await this.isBannedWrapper(ctx, func, 'send');
  }

  private async allWrappers(
    ctx: Context | any,
    func: Function,
    type: 'send' | 'edit',
  ) {
    const { ctxUser } = getCtxData(ctx);

    await this.usersService.updateUserNamesByCtx(ctx);
    await this.listenersService.clearUserListeners(ctxUser.id);

    await this.isBannedWrapper(ctx, func, type);
  }

  private async isBannedWrapper(
    ctx: Context | any,
    func: Function,
    type: 'send' | 'edit',
  ) {
    const { message, data } = getCtxData(ctx);
    const user = await this.usersService.findOrCreateUserByCtx(ctx);

    const isBanner = Boolean(message?.caption);

    if (message?.chat?.type === 'private' && data !== 'check_news_follow') {
      const isFollowNews = await this.chackIsFollowNews(ctx);

      if (!isFollowNews) {
        return await sendMessage(followNewsMessage(), {
          ctx,
          isBanner: false,
          type: 'send',
          reply_markup: followNewsMarkup(),
        });
      }
    }

    const banUser = await this.banUserRepository.findOne({
      where: { userId: user.id },
    });

    if (banUser) {
      // const admin = await this.userRepository.findByPk(banUser?.adminId);

      // return await sendMessage(banMessage(banUser.reason), {
      //   ctx,
      //   type,
      //   reply_markup: banMarkup(admin?.telegramId),
      //   isBanner,
      // });

      return await sendMessage(banMessage(banUser.reason), {
        ctx,
        type,
        reply_markup: banMarkup,
        isBanner,
      });
    }

    try {
      await func(ctx);
    } catch (e) {
      console.error('ERROR: ', e);
    }
  }

  async chackIsFollowNews(ctx: Context | any) {
    try {
      const { ctxUser } = getCtxData(ctx);

      const isFollow = await this.bot.telegram.getChatMember(
        process.env.NEWS_CHANNEL_ID,
        ctxUser?.id,
      );

      return ['member', 'administrator', 'creator'].includes(isFollow?.status);
    } catch (e) {
      console.error('Error check follow:', e);

      return true;
    }
  }
}
