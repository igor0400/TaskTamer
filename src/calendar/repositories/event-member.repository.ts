import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions } from 'sequelize';
import {
  CalendarEventMember,
  CalendarEventMemberCreationArgs,
} from '../models/event-member.model';

@Injectable()
export class EventsMembersRepository extends AbstractRepository<
  CalendarEventMember,
  CalendarEventMemberCreationArgs
> {
  protected readonly logger = new Logger(CalendarEventMember.name);

  constructor(
    @InjectModel(CalendarEventMember)
    private memberModel: typeof CalendarEventMember,
  ) {
    super(memberModel);
  }

  async findByUserTgId(
    tgId: string | number,
    options?: Omit<FindOptions<CalendarEventMember>, 'where'>,
  ) {
    const document = await this.memberModel.findOne({
      where: {
        userTelegramId: tgId,
      },
      ...options,
    });

    return document as CalendarEventMember;
  }
}
