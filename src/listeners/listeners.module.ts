import { Module, forwardRef } from '@nestjs/common';
import { ListenersService } from './listeners.service';
import { WaitersRepository } from './repositories/waiter.repository';
import { Waiter } from './models/waiter.model';
import { DatabaseModule } from 'src/libs/common';
import { UsersModule } from 'src/users/users.module';
import { GeneralModule } from 'src/general/general.module';
import { ProfileModule } from 'src/profile/profile.module';
import { MailingsModule } from 'src/mailings/mailings.module';
import { ChainModule } from 'src/libs/chain/chain.module';
import { CalendarModule } from 'src/calendar/calendar.module';

@Module({
  imports: [
    DatabaseModule.forFeature([Waiter]),
    UsersModule,
    forwardRef(() => ProfileModule),
    forwardRef(() => GeneralModule),
    MailingsModule,
    ChainModule,
    CalendarModule,
  ],
  providers: [ListenersService, WaitersRepository],
  exports: [WaitersRepository, ListenersService],
})
export class ListenersModule {}
