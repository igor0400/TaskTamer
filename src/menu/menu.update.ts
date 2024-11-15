import { Command, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { MenuService } from './menu.service';
import { GeneralMiddlewares } from 'src/general/general.middlewares';

@Update()
export class MenuUpdate {
  constructor(
    private readonly menuService: MenuService,
    private readonly middlewares: GeneralMiddlewares,
  ) {}

  @Command('menu')
  async menuCommand(ctx: Context) {
    await this.middlewares.commandMiddleware(ctx, (ctx: Context) =>
      this.menuService.sendMenu(ctx),
    );
  }
}
