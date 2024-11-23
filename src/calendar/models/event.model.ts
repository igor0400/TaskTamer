import { Column, Table, DataType, HasMany } from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';
import { CalendarEventMember } from './event-member.model';

export interface CalendarEventCreationArgs {
  creatorId: string;
  title?: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: string;
  chatId?: string;
  chatTitle?: string;
}

@Table({ tableName: 'CalendarEvents' })
export class CalendarEvent extends AbstractModel<
  CalendarEvent,
  CalendarEventCreationArgs
> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  creatorId: string;

  @Column({
    type: DataType.STRING,
  })
  title?: string;

  @Column({
    type: DataType.STRING,
  })
  description?: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  startTime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  endTime: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.STRING,
  })
  chatId?: string;

  @Column({
    type: DataType.STRING,
  })
  chatTitle?: string;

  @HasMany(() => CalendarEventMember)
  members: CalendarEventMember[];
}
