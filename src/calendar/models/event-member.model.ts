import {
  Column,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { AbstractModel } from 'src/libs/common';
import { CalendarEvent } from './event.model';
import { User } from 'src/users/models/user.model';

export interface CalendarEventMemberCreationArgs {
  calendarEventId: string;
  userId: string;
  userTelegramId: string;
}

@Table({ tableName: 'CalendarEventsMembers' })
export class CalendarEventMember extends AbstractModel<
  CalendarEventMember,
  CalendarEventMemberCreationArgs
> {
  @ForeignKey(() => CalendarEvent)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  calendarEventId: string;

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

  @BelongsTo(() => CalendarEvent)
  event: CalendarEvent;

  @BelongsTo(() => User)
  user: User;
}
