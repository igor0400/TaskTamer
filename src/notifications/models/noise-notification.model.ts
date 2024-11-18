import { Column, Table, DataType } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';

export interface NoiseNotificationCreationArgs {
  userId: string;
  title: string;
  text: string;
  sendTime: Date;
  markup?: string;
  type?: string;
  extraData?: string;
}

@Table({ tableName: 'NoiseNotifications' })
export class NoiseNotification extends AbstractModel<
  NoiseNotification,
  NoiseNotificationCreationArgs
> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

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
    type: DataType.DATE,
    allowNull: false,
  })
  sendTime: Date;

  @Column({
    type: DataType.STRING,
  })
  markup?: string;

  @Column({
    type: DataType.STRING,
  })
  type?: string;

  @Column({
    type: DataType.STRING,
  })
  extraData?: string;
}
