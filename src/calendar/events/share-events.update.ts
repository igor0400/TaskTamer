import { Action, Update } from 'nestjs-telegraf';
import { EventsService } from './events.service';
import { Context } from 'telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { EventsAdditionalService } from './events-additional.service';
import { getCtxData } from 'src/libs/common';
import { ShareEventsService } from './share-events.service';
import { ShareEventsAdditionalService } from './share-events-additional.service';

@Update()
export class ShareEventsUpdate {
  constructor(
    private readonly middlewares: GeneralMiddlewares,
    private readonly shareEventsService: ShareEventsService,
    private readonly eventsAdditionalService: EventsAdditionalService,
    private readonly shareEventsAdditionalService: ShareEventsAdditionalService,
  ) {}

  @Action([/.*::create_share_calendar_event/, /.*::back_to_sh_c_e_s_t/])
  async createPersonalEventBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);
    const userId = dataValue.split('_')[1];

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.eventsAdditionalService.changeToSelectHours(ctx, {
        callbackDataTitle: 'sh_c_e_s_t',
        type: 'start',
        calType: 'share',
        userId,
      }),
    );
  }

  @Action([/.*::sh_c_e_s_t.*/, /.*::back_to_sh_c_e_e_t/])
  async shareEventStartTimeBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);
    const userId = dataValue.split('_')[1];

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.eventsAdditionalService.changeToSelectHours(ctx, {
        callbackDataTitle: 'sh_c_e_e_t',
        type: 'end',
        startTime: dataValue?.split('_')[0]?.split('-')[1],
        calType: 'share',
        userId,
      }),
    );
  }

  @Action(/.*::sh_c_e_e_t.*/)
  async shareEventEndTimeBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.shareEventsAdditionalService.changeToWriteTitle(ctx),
    );
  }

  @Action([/.*::share_calendar_event/, /.*::back_to_share_calendar_event/])
  async shareCalendarEventBtn(ctx: Context) {}

  @Action(/.*::accept_event_invite/)
  async acceptEventInviteBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.shareEventsService.acceptEventInvite(ctx),
    );
  }

  @Action(/.*::reject_event_invite/)
  async rejectEventInviteBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.shareEventsService.rejectEventInvite(ctx),
    );
  }
}
