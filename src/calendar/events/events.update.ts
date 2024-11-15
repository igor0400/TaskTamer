import { Action, Update } from 'nestjs-telegraf';
import { EventsService } from './events.service';
import { Context } from 'telegraf';
import { GeneralMiddlewares } from 'src/general/general.middlewares';
import { EventsAdditionalService } from './events-additional.service';
import { getCtxData } from 'src/libs/common';
import { CalendarDaysService } from '../days/days.service';
import { getDayDate } from 'src/general';

@Update()
export class EventsUpdate {
  constructor(
    private readonly middlewares: GeneralMiddlewares,
    private readonly eventsService: EventsService,
    private readonly eventsAdditionalService: EventsAdditionalService,
    private readonly daysService: CalendarDaysService,
  ) {}

  @Action([/.*::create_personal_calendar_event/, /.*::back_to_pers_c_e_s_t/])
  async createPersonalEventBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.eventsAdditionalService.changeToSelectHours(ctx, {
        callbackDataTitle: 'pers_c_e_s_t',
        type: 'start',
      }),
    );
  }

  @Action([/.*::pers_c_e_s_t.*/, /.*::back_to_pers_c_e_e_t/])
  async personalEventStartTimeBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.eventsAdditionalService.changeToSelectHours(ctx, {
        callbackDataTitle: 'pers_c_e_e_t',
        type: 'end',
        startTime: dataValue.split('-')[1],
      }),
    );
  }

  @Action(/.*::pers_c_e_e_t.*/)
  async personalEventEndTimeBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.eventsAdditionalService.changeToWriteTitle(ctx),
    );
  }

  @Action(/.*::skip_pers_cal_event_title/)
  async skipEventTitleBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.eventsAdditionalService.skipWriteTitle(ctx),
    );
  }

  @Action([/.*::calendar_event/, /.*::back_to_calendar_event/])
  async calendarEventBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.eventsService.changeToEvent(ctx, dataValue),
    );
  }

  @Action(/.*::delete_calendar_event_confirm/)
  async deleteCalendarEventConfirmBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.eventsAdditionalService.deleteEventConfirm(ctx),
    );
  }

  @Action(/.*::delete_calendar_event/)
  async deleteCalendarEventBtn(ctx: Context) {
    const { dataValue } = getCtxData(ctx);

    await this.middlewares.btnMiddleware(ctx, async (ctx: Context) => {
      const event = await this.eventsService.deleteEvent({
        eventId: dataValue,
      });
      await this.daysService.changeToCalendarDay(
        ctx,
        getDayDate(event.startTime),
      );
    });
  }

  @Action(/.*::leave_calendar_event_confirm/)
  async leaveCalendarEventConfirmBtn(ctx: Context) {
    await this.middlewares.btnMiddleware(ctx, (ctx: Context) =>
      this.eventsAdditionalService.leaveEventConfirm(ctx),
    );
  }

  @Action(/.*::leave_calendar_event/)
  async leaveCalendarEventBtn(ctx: Context) {
    const { dataValue, ctxUser } = getCtxData(ctx);
    const userTgId = ctxUser.id;

    await this.middlewares.btnMiddleware(ctx, async (ctx: Context) => {
      const event = await this.eventsService.leaveEvent({
        eventId: dataValue,
        userTgId,
      });
      await this.daysService.changeToCalendarDay(
        ctx,
        getDayDate(event.startTime),
      );
    });
  }
}
