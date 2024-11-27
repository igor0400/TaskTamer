import { forwardRef, Module } from '@nestjs/common';
import { CommandsService } from './commands.service';
import { ListenersModule } from 'src/listeners/listeners.module';
import { ChainModule } from 'src/libs/chain/chain.module';
import { UsersModule } from 'src/users/users.module';
import { CalendarModule } from 'src/calendar/calendar.module';
import { GeneralModule } from 'src/general/general.module';
import { MailingsModule } from 'src/mailings/mailings.module';

@Module({
  imports: [
    forwardRef(() => GeneralModule),
    forwardRef(() => ListenersModule),
    ChainModule,
    UsersModule,
    CalendarModule,
    MailingsModule,
  ],
  providers: [CommandsService],
  exports: [CommandsService],
})
export class CommandsModule {}
