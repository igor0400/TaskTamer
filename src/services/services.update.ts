import { Action, Command, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ServicesService } from './services.service';
import { GeneralMiddlewares } from '../general/general.middlewares';

@Update()
export class ServicesUpdate {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly middlewares: GeneralMiddlewares,
  ) {}

  @Command('services')
  async servicesCommand(ctx: Context) {
    await this.middlewares.commandMiddleware(ctx, (ctx: Context) =>
      this.servicesService.sendServices(ctx),
    );
  }

  @Action(['services', 'back_to_services'])
  async servicesBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.servicesService.changeToServices(ctx),
    );
  }
}
