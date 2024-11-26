import { textMonths } from 'src/calendar/configs';
import { CalendarEventMember } from 'src/calendar/models/event-member.model';
import { getNowDateWithTZ, getUserName } from 'src/libs/common';

export const getEventTexts = (
  event: {
    title?: string;
    startTime: Date;
    endTime: Date;
    members?: CalendarEventMember[];
  },
  timezone: string,
) => {
  const startDate = getNowDateWithTZ({
    timezone,
    initDate: event.startTime,
  });
  const endDate = getNowDateWithTZ({
    timezone,
    initDate: event.endTime,
  });

  const dateYear =
    startDate.getUTCFullYear() === new Date().getUTCFullYear()
      ? ''
      : ` ${startDate.getUTCFullYear()}`;

  const textDate = `${startDate.getUTCDate()} ${
    textMonths[startDate.getUTCMonth()]
  }${dateYear}`;
  const textStart = startDate?.toISOString()?.split('T')[1]?.slice(0, 5);
  const textEnd = endDate?.toISOString()?.split('T')[1]?.slice(0, 5);

  const members = [];

  if (event?.members) {
    for (let { user } of event?.members) {
      members.push(getUserName(user));
    }
  }

  return {
    title: event.title,
    textDate,
    textStart,
    textEnd,
    textMembers: members.join(', '),
  };
};
