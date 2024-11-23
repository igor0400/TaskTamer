import { textMonths } from 'src/calendar/configs';
import { CalendarEvent } from 'src/calendar/models/event.model';
import { getNowDateWithTZ, getUserName } from 'src/libs/common';

export const getEventTexts = (event: CalendarEvent, timezone: string) => {
  const startDate = getNowDateWithTZ({
    timezone,
    initDate: event.startTime,
  });
  const endDate = getNowDateWithTZ({
    timezone,
    initDate: event.endTime,
  });

  const title = event.title ? event.title : 'Событие';

  const textDate = `${startDate.getUTCDate()} ${
    textMonths[startDate.getUTCMonth()]
  } ${startDate.getUTCFullYear()}`;
  const textStart = startDate?.toISOString()?.split('T')[1]?.slice(0, 5);
  const textEnd = endDate?.toISOString()?.split('T')[1]?.slice(0, 5);

  const members = [];

  if (event?.members) {
    for (let { user } of event?.members) {
      members.push(getUserName(user));
    }
  }

  return {
    title,
    textDate,
    textStart,
    textEnd,
    textMembers: members.join(', '),
  };
};
