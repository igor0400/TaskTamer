import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  MailingQueueItem,
  MailingQueueItemCreationArgs,
} from '../models/mailing-queue-item.model';

@Injectable()
export class MailingQueueItemRepository extends AbstractRepository<
  MailingQueueItem,
  MailingQueueItemCreationArgs
> {
  protected readonly logger = new Logger(MailingQueueItem.name);

  constructor(
    @InjectModel(MailingQueueItem)
    private mailingQueueItemModel: typeof MailingQueueItem,
  ) {
    super(mailingQueueItemModel);
  }
}
