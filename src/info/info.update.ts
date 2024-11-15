import { Action, Update } from 'nestjs-telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { Context } from 'telegraf';
import { InfoService } from './info.service';

@Update()
export class InfoUpdate {
  constructor(
    private readonly middlewares: GeneralMiddlewares,
    private readonly infoService: InfoService,
  ) {}

  @Action('info')
  async infoBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.infoService.changeToInfo(ctx),
    );
  }
}
