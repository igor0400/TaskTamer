import { Module, forwardRef } from '@nestjs/common';
import { MailingsUpdate } from './mailings.update';
import { MailingsService } from './mailings.service';
import { GeneralModule } from 'src/general/general.module';
import { MailingRepository } from './repositories/mailing.repository';
import { DatabaseModule } from 'src/libs/common';
import { Mailing } from './models/mailing.model';
import { MailingTemplateRepository } from './repositories/mailing-template.repository';
import { MailingTemplate } from './models/mailing-template.model';
import { UsersModule } from 'src/users/users.module';
import { MenuModule } from 'src/menu/menu.module';
import { PaginationModule } from 'src/libs/pagination/pagination.module';
import { MailingQueueItem } from './models/mailing-queue-item.model';
import { MailingQueueItemRepository } from './repositories/mailing-queue-item.repository';

@Module({
  imports: [
    DatabaseModule.forFeature([Mailing, MailingTemplate, MailingQueueItem]),
    forwardRef(() => GeneralModule),
    UsersModule,
    forwardRef(() => MenuModule),
    PaginationModule,
  ],
  providers: [
    MailingsUpdate,
    MailingsService,
    MailingRepository,
    MailingTemplateRepository,
    MailingQueueItemRepository,
  ],
  exports: [
    MailingsService,
    MailingRepository,
    MailingTemplateRepository,
    MailingQueueItemRepository,
  ],
})
export class MailingsModule {}
