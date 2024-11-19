import { Module, forwardRef } from '@nestjs/common';
import { NotificationsUpdate } from './notifications.update';
import { NotificationsService } from './notifications.service';
import { DatabaseModule } from 'src/libs/common';
import { BasicNotification } from './models/basic-notification.model';
import { BasicNotificationRepository } from './repositories/basic-notification.repository';
import { GeneralModule } from 'src/general/general.module';
import { NoiseNotificationRepository } from './repositories/noise-notification.repository';
import { NoiseNotification } from './models/noise-notification.model';
import { UsersModule } from 'src/users/users.module';
import { CalendarModule } from 'src/calendar/calendar.module';

@Module({
  imports: [
    DatabaseModule.forFeature([BasicNotification, NoiseNotification]),
    forwardRef(() => GeneralModule),
    UsersModule,
    CalendarModule,
  ],
  providers: [
    NotificationsUpdate,
    NotificationsService,
    BasicNotificationRepository,
    NoiseNotificationRepository,
  ],
  exports: [
    NotificationsService,
    BasicNotificationRepository,
    NoiseNotificationRepository,
  ],
})
export class NotificationsModule {}
