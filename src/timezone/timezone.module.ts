import { forwardRef, Module } from '@nestjs/common';
import { TimezoneUpdate } from './timezone.update';
import { TimezoneService } from './timezone.service';
import { GeneralModule } from 'src/general/general.module';
import { UsersModule } from 'src/users/users.module';
import { ProfileModule } from 'src/profile/profile.module';

@Module({
  imports: [forwardRef(() => GeneralModule), UsersModule, ProfileModule],
  providers: [TimezoneUpdate, TimezoneService],
})
export class TimezoneModule {}
