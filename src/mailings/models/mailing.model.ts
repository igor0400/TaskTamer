import {
  Column,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';
import { User } from 'src/users/models/user.model';

export interface MailingCreationArgs {
  userId: string;
  chatId: string;
  messageId: string;
  status?: 'CREATING' | 'CONFIRMING' | 'WAIT_SENDING' | 'SENDING';
  text?: string;
  animationFileId?: string;
  audioFileId?: string;
  documentFileId?: string;
  videoFileId?: string;
  photoFileId?: string;
  voiceFileId?: string;
  stickerFileId?: string;
}

@Table({ tableName: 'Mailings' })
export class Mailing extends AbstractModel<Mailing, MailingCreationArgs> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
    defaultValue: 'CREATING',
  })
  status: 'CREATING' | 'CONFIRMING' | 'WAIT_SENDING' | 'SENDING';

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
  text: string;

  @Column({
    type: DataType.STRING,
  })
  animationFileId: string;

  @Column({
    type: DataType.STRING,
  })
  audioFileId: string;

  @Column({
    type: DataType.STRING,
  })
  documentFileId: string;

  @Column({
    type: DataType.STRING,
  })
  videoFileId: string;

  @Column({
    type: DataType.STRING,
  })
  photoFileId: string;

  @Column({
    type: DataType.STRING,
  })
  voiceFileId: string;

  @Column({
    type: DataType.STRING,
  })
  stickerFileId: string;

  @BelongsTo(() => User)
  user: User;
}
