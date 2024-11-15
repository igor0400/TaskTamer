import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Mailing, MailingCreationArgs } from '../models/mailing.model';

@Injectable()
export class MailingRepository extends AbstractRepository<
  Mailing,
  MailingCreationArgs
> {
  protected readonly logger = new Logger(Mailing.name);

  constructor(
    @InjectModel(Mailing)
    private mailingModel: typeof Mailing,
  ) {
    super(mailingModel);
  }
}
