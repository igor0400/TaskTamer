import { Column, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';
import { User } from 'src/users/models/user.model';
import { Mailing } from './mailing.model';

export interface MailingQueueItemCreationArgs {
  id: string;
  userId: string;
  mailingId: string;
  serialNum?: number;
}

@Table({ tableName: 'MailingQueueItems' })
export class MailingQueueItem extends AbstractModel<
  MailingQueueItem,
  MailingQueueItemCreationArgs
> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @ForeignKey(() => Mailing)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mailingId: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  serialNum: number;
}
