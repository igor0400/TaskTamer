import { MenuService } from 'src/menu/menu.service';
import { Context } from 'telegraf';
import { Action, Update } from 'nestjs-telegraf';
import { GeneralPresets } from './general.presets';
import { GeneralMiddlewares } from './general.middlewares';
import { getCtxData } from 'src/libs/common';

@Update()
export class GeneralButtons {
  constructor(
    private readonly menuService: MenuService,
    private readonly generalPresets: GeneralPresets,
    private readonly middlewares: GeneralMiddlewares,
  ) {}

  @Action('back')
  async backBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.menuService.changeToMenu(ctx),
    );
  }

  @Action('send_back')
  async sendBackBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.menuService.sendMenu(ctx),
    );
  }

  @Action('close_message')
  async closeMessageBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, async (ctx: Context) => {
      await ctx.deleteMessage();
    });
  }

  @Action('latter')
  async latterBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, async (ctx: Context) => {
      await this.generalPresets.sendTempMessage({
        ctx,
        text: '⏳ <b>Скоро...</b>',
        time: 2000,
      });
    });
  }

  @Action('check_news_follow')
  async checkNewsFollowBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, async (ctx: Context) => {
      const { message } = getCtxData(ctx);

      const isBanner = Boolean(message?.caption);

      const isFollowNews = await this.middlewares.chackIsFollowNews(ctx);

      if (isFollowNews) {
        if (isBanner) {
          await this.menuService.changeToMenu(ctx);
        } else {
          try {
            await ctx.deleteMessage();
          } catch (e) {}

          await this.menuService.sendMenu(ctx);
        }
      } else {
        try {
          await ctx.answerCbQuery(`🚫 Вы не подписаны`, { show_alert: true });
        } catch (e) {}
      }
    });
  }
}
