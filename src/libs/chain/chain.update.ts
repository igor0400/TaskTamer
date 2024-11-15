import { Action, Ctx, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { ChainService } from './chain.service';

@Update()
export class ChainUpdate {
  constructor(
    private readonly middlewares: GeneralMiddlewares,
    private readonly chainService: ChainService,
  ) {}

  @Action('cancel_chain')
  async cancelChainBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.chainService.cancelChain(ctx),
    );
  }

  @Action(/.*::skip_chain_field/)
  async skipChainFieldBtn(@Ctx() ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.chainService.skipChainField(ctx),
    );
  }
}
