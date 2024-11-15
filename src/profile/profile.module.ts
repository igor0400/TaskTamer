import { forwardRef, Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileUpdate } from './profile.update';
import { GeneralModule } from 'src/general/general.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [forwardRef(() => GeneralModule), UsersModule, NotificationsModule],
  providers: [ProfileService, ProfileUpdate],
})
export class ProfileModule {}
