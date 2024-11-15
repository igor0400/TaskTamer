import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserCreationArgs } from '../models/user.model';
import { FindOptions } from 'sequelize';

@Injectable()
export class UserRepository extends AbstractRepository<User, UserCreationArgs> {
  protected readonly logger = new Logger(User.name);

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {
    super(userModel);
  }

  async findByTgId(
    tgId: string | number,
    options?: Omit<FindOptions<User>, 'where'>,
  ) {
    const document = await this.userModel.findOne({
      where: {
        telegramId: tgId,
      },
      ...options,
    });

    return document as User;
  }
}
