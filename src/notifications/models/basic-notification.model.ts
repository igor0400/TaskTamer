import { Column, Table, DataType } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';

export interface BasicNotificationCreationArgs {
  userTelegramId: string;
  title: string;
  text: string;
  markup?: string;
}

@Table({ tableName: 'BasicNotifications' })
export class BasicNotification extends AbstractModel<
  BasicNotification,
  BasicNotificationCreationArgs
> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userTelegramId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  text: string;

  @Column({
    type: DataType.STRING,
  })
  markup?: string;
}
