import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  NoiseNotification,
  NoiseNotificationCreationArgs,
} from '../models/noise-notification.model';

@Injectable()
export class NoiseNotificationRepository extends AbstractRepository<
  NoiseNotification,
  NoiseNotificationCreationArgs
> {
  protected readonly logger = new Logger(NoiseNotification.name);

  constructor(
    @InjectModel(NoiseNotification)
    private noiseNotificationModel: typeof NoiseNotification,
  ) {
    super(noiseNotificationModel);
  }
}
