import { Column, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';
import { User } from 'src/users/models/user.model';

export type MailingTemplateType = 'admins' | 'global';

export interface MailingTemplateCreationArgs {
  id: string;
  messageId: string;
  userId?: string;
  type?: MailingTemplateType;
  status?: 'CREATING' | 'CREATED';
  title?: string;
  text?: string;
  animationFileId?: string;
  audioFileId?: string;
  documentFileId?: string;
  videoFileId?: string;
  photoFileId?: string;
  voiceFileId?: string;
  stickerFileId?: string;
}

@Table({ tableName: 'MailingTemplates' })
export class MailingTemplate extends AbstractModel<
  MailingTemplate,
  MailingTemplateCreationArgs
> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING,
  })
  userId: string;

  @Column({
    type: DataType.STRING,
  })
  type: MailingTemplateType;

  @Column({
    type: DataType.STRING,
    defaultValue: 'CREATING',
  })
  status: 'CREATING' | 'CREATED';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  messageId: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  usingCount: number;

  @Column({
    type: DataType.STRING,
  })
  title: string;

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
}
