import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { StartModule } from './start/start.module';
import { MenuModule } from './menu/menu.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServicesModule } from './services/services.module';
import { GeneralModule } from './general/general.module';
import { InfoModule } from './info/info.module';
import { validationSchema } from './libs/common';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './general/database/database.module';
import { ListenersModule } from './listeners/listeners.module';
import { CalendarModule } from './calendar/calendar.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ListenersLowModule } from './listeners/listeners-low.module';
import { BansModule } from './bans/bans.module';
import { ProfileModule } from './profile/profile.module';
import { ChainModule } from './libs/chain/chain.module';
import { RolesModule } from './roles/roles.module';
import { MailingsModule } from './mailings/mailings.module';
import { PaginationModule } from './libs/pagination/pagination.module';
import { FilesModule } from './files/files.module';
import { TimezoneModule } from './timezone/timezone.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      envFilePath: [`.${process.env.NODE_ENV}.env`, `.env.stage.dev`],
      isGlobal: true,
    }),
    TelegrafModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        token: configService.get('BOT_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CalendarModule,
    StartModule,
    MenuModule,
    ServicesModule,
    GeneralModule,
    InfoModule,
    UsersModule,
    NotificationsModule,
    PaginationModule,
    ListenersModule,
    BansModule,
    ProfileModule,
    ChainModule,
    RolesModule,
    MailingsModule,
    FilesModule,
    TimezoneModule,

    ListenersLowModule,
  ],
})
export class AppModule {}
