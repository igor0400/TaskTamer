import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  BasicNotification,
  BasicNotificationCreationArgs,
} from '../models/basic-notification.model';

@Injectable()
export class BasicNotificationRepository extends AbstractRepository<
  BasicNotification,
  BasicNotificationCreationArgs
> {
  protected readonly logger = new Logger(BasicNotification.name);

  constructor(
    @InjectModel(BasicNotification)
    private basicNotificationModel: typeof BasicNotification,
  ) {
    super(basicNotificationModel);
  }
}
