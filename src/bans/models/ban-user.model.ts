import { Column, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';
import { User } from 'src/users/models/user.model';

export interface BanUserCreationArgs {
  userId: string;
  userTelegramId: string;
  reason: string;
}

@Table({ tableName: 'BanUsers' })
export class BanUser extends AbstractModel<BanUser, BanUserCreationArgs> {
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
  userTelegramId: string;

  @Column({
    type: DataType.STRING,
  })
  reason: string;
}
