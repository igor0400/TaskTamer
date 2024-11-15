import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions } from 'sequelize';
import {
  CalendarBusyDay,
  CalendarBusyDayCreationArgs,
} from '../models/busy-day.model';

@Injectable()
export class BusyDaysRepository extends AbstractRepository<
  CalendarBusyDay,
  CalendarBusyDayCreationArgs
> {
  protected readonly logger = new Logger(CalendarBusyDay.name);

  constructor(
    @InjectModel(CalendarBusyDay)
    private busyDayModel: typeof CalendarBusyDay,
  ) {
    super(busyDayModel);
  }

  async findByUserTgId(
    tgId: string | number,
    options?: Omit<FindOptions<CalendarBusyDay>, 'where'>,
  ) {
    const document = await this.busyDayModel.findOne({
      where: {
        userTelegramId: tgId,
      },
      ...options,
    });

    return document as CalendarBusyDay;
  }
}
