import { Module, forwardRef } from '@nestjs/common';
import { NotificationsUpdate } from './notifications.update';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from 'src/libs/common';
import { BasicNotification } from './models/basic-notification.model';
import { BasicNotificationRepository } from './repositories/basic-notification.repository';
import { GeneralModule } from 'src/general/general.module';

@Module({
  imports: [
    DatabaseModule.forFeature([BasicNotification]),
    forwardRef(() => GeneralModule),
  ],
  providers: [
    NotificationsUpdate,
    NotificationsService,
    BasicNotificationRepository,
  ],
  exports: [NotificationsService, BasicNotificationRepository],
})
export class NotificationsModule {}
