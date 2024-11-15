import { CalendarEvent } from 'src/calendar/models/event.model';

export const filterEventsByDate = (
  events: CalendarEvent[],
  dateVal: string,
) => {
  const [date, month, year] = dateVal.split('.');
  const filteredEvents = events.filter((val) =>
    new RegExp(`${year}-${month}-${date}.*`).test(val?.startTime),
  );
  const sortedEvents = filteredEvents.sort((a, b) =>
    new Date(a.startTime) > new Date(b.startTime) ? 1 : -1,
  );

  return sortedEvents;
};
