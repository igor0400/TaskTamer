import { Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { GeneralMiddlewares } from '../general/general.middlewares';
import { StartService } from './start.service';

@Update()
export class StartUpdate {
  constructor(
    private readonly middlewares: GeneralMiddlewares,
    private readonly startService: StartService,
  ) {}

  @Start()
  async startCommand(@Ctx() ctx: Context) {
    await this.middlewares.commandMiddleware(ctx, (ctx: Context) =>
      this.startService.sendStart(ctx),
    );
  }
}
