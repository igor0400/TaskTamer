import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BanUser, BanUserCreationArgs } from '../models/ban-user.model';

@Injectable()
export class BanUserRepository extends AbstractRepository<
  BanUser,
  BanUserCreationArgs
> {
  protected readonly logger = new Logger(BanUser.name);

  constructor(
    @InjectModel(BanUser)
    private banUserModel: typeof BanUser,
  ) {
    super(banUserModel);
  }
}
