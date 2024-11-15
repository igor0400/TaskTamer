import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  CalendarEvent,
  CalendarEventCreationArgs,
} from '../models/event.model';

@Injectable()
export class EventsRepository extends AbstractRepository<
  CalendarEvent,
  CalendarEventCreationArgs
> {
  protected readonly logger = new Logger(CalendarEvent.name);

  constructor(
    @InjectModel(CalendarEvent)
    private eventModel: typeof CalendarEvent,
  ) {
    super(eventModel);
  }
}
