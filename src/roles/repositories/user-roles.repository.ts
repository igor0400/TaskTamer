import { AbstractRepository } from 'src/libs/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserRoles, UserRolesCreationArgs } from '../models/user-roles.model';

@Injectable()
export class UserRolesRepository extends AbstractRepository<
  UserRoles,
  UserRolesCreationArgs
> {
  protected readonly logger = new Logger(UserRoles.name);

  constructor(
    @InjectModel(UserRoles)
    private userRolesModel: typeof UserRoles,
  ) {
    super(userRolesModel);
  }
}
