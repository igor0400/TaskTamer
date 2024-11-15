import { Column, Table, DataType } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';

export interface WaiterCreationArgs {
  type: string;
  kind: string;
  userId: string;
  chatId: string;
  messageId: string;
  extraData?: string;
}

@Table({ tableName: 'Waiters' })
export class Waiter extends AbstractModel<Waiter, WaiterCreationArgs> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'text',
  })
  kind: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  chatId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  messageId: string;

  @Column({
    type: DataType.STRING,
  })
  extraData?: string;
}
