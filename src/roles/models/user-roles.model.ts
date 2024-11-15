import { Column, DataType, ForeignKey, Table } from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { AbstractModel } from 'src/libs/common';
import { RoleTypes } from '../types';

export interface UserRolesCreationArgs {
  userId: string;
  roleName: RoleTypes;
}

@Table({ tableName: 'UserRoles', timestamps: false })
export class UserRoles extends AbstractModel<UserRoles, UserRolesCreationArgs> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  roleName: RoleTypes;
}
