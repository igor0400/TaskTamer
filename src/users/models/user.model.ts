import { Column, Table, DataType, HasMany } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';
import { UserRoles } from 'src/roles/models/user-roles.model';

export interface UserCreationArgs {
  telegramId: string;
  firstName: string;
  lastName: string;
  userName: string;
  timezone?: string;
}

@Table({ tableName: 'Users' })
export class User extends AbstractModel<User, UserCreationArgs> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  telegramId: string;

  @Column({
    type: DataType.STRING,
  })
  firstName: string;

  @Column({
    type: DataType.STRING,
  })
  lastName: string;

  @Column({
    type: DataType.STRING,
  })
  userName: string;

  @Column({
    type: DataType.STRING,
    defaultValue: '+3',
  })
  timezone: string;

  @HasMany(() => UserRoles)
  roles: UserRoles[];
}
