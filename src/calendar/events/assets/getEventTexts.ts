import { textMonths } from 'src/calendar/configs';
import { CalendarEvent } from 'src/calendar/models/event.model';
import { getUserName } from 'src/libs/common';

export const getEventTexts = (event: CalendarEvent) => {
  const startDate = new Date(event.startTime);

  const title = event.title ? event.title : 'Событие';

  const textDate = `${startDate.getUTCDate()} ${
    textMonths[startDate.getUTCMonth()]
  } ${startDate.getUTCFullYear()}`;
  const textStart = event.startTime?.split('T')[1]?.slice(0, 5);
  const textEnd = event.endTime?.split('T')[1]?.slice(0, 5);

  const members = [];

  for (let { user } of event?.members) {
    members.push(getUserName(user));
  }

  return {
    title,
    textDate,
    textStart,
    textEnd,
    textMembers: members.join(', '),
  };
};
