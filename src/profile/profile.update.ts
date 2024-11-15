import { Action, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ProfileService } from './profile.service';
import { GeneralMiddlewares } from 'src/general/general.middlewares';

@Update()
export class ProfileUpdate {
  constructor(
    private readonly middlewares: GeneralMiddlewares,
    private readonly profileService: ProfileService,
  ) {}

  @Action(['profile', 'back_to_profile'])
  async profileBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.profileService.changeToProfile(ctx),
    );
  }
}
