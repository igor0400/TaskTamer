import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  MailingTemplate,
  MailingTemplateCreationArgs,
} from '../models/mailing-template.model';

@Injectable()
export class MailingTemplateRepository extends AbstractRepository<
  MailingTemplate,
  MailingTemplateCreationArgs
> {
  protected readonly logger = new Logger(MailingTemplate.name);

  constructor(
    @InjectModel(MailingTemplate)
    private mailingTemplateModel: typeof MailingTemplate,
  ) {
    super(mailingTemplateModel);
  }
}
