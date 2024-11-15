import { Column, Table, DataType, ForeignKey } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';
import { Chain } from './chain.model';

export interface ChainFieldCreationArgs {
  chainId: string;
  serNum: number;
  title: string;
  text: string;
  isSkip?: boolean;
  cancelBtnCallbackData?: string;
  type?: 'text' | 'image' | 'file';
  validations?: string;
}

@Table({ tableName: 'ChainFields' })
export class ChainField extends AbstractModel<
  ChainField,
  ChainFieldCreationArgs
> {
  @ForeignKey(() => Chain)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  chainId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  serNum: number;

  @Column({
    type: DataType.STRING,
    defaultValue: 'text',
  })
  type: 'text' | 'image' | 'file';

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
  cancelBtnCallbackData: string;

  @Column({
    type: DataType.STRING,
  })
  validations?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isSkip: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isSkipped: boolean;

  @Column({
    type: DataType.BLOB,
  })
  userResponse?: string;
}
