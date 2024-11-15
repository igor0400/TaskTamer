import { Column, Table, DataType } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';

export interface CalendarBusyDayCreationArgs {
  userId: string;
  userTelegramId: string;
  date: number;
  month: number;
  year: number;
  type: string;
}

@Table({ tableName: 'CalendarBusyDays' })
export class CalendarBusyDay extends AbstractModel<
  CalendarBusyDay,
  CalendarBusyDayCreationArgs
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
  userTelegramId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  date: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  month: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  year: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;
}
