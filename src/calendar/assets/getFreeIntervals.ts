import { getZero } from 'src/libs/common';
import {
  CalendarEvent,
  CalendarEventCreationArgs,
} from '../models/event.model';

export const getFreeIntervals = (
  initDate: string | Date,
  events: CalendarEvent[] | CalendarEventCreationArgs[],
  addMins = 0,
  endDayTime = '23:45',
) => {
  const date = new Date(initDate);
  const startTimeOfDay = new Date(
    `${date.getUTCFullYear()}-${getZero(date.getUTCMonth() + 1)}-${getZero(
      date.getUTCDate(),
    )}T00:00:00.000Z`,
  );
  const endOfDay = new Date(
    `${date.getUTCFullYear()}-${getZero(date.getUTCMonth() + 1)}-${getZero(
      date.getUTCDate(),
    )}T${endDayTime}:00.000Z`,
  );

  if (!events.length) {
    return [
      {
        startTime: startTimeOfDay.toISOString(),
        endTime: endOfDay.toISOString(),
      },
    ];
  }

  const sortedEvents = events.sort((a, b) =>
    new Date(a.startTime) > new Date(b.startTime) ? 1 : -1,
  );

  const freeIntervals = [];

  if (startTimeOfDay < new Date(sortedEvents[0]?.startTime)) {
    freeIntervals.push({
      startTime: startTimeOfDay.toISOString(),
      endTime: incMinutes(sortedEvents[0].startTime, addMins),
    });
  }

  for (let i = 0; i < sortedEvents.length - 1; i++) {
    const currentEvent = new Date(events[i].endTime);
    const nextEvent = new Date(events[i + 1].startTime);

    if (currentEvent < nextEvent) {
      freeIntervals.push({
        startTime: currentEvent.toISOString(),
        endTime: incMinutes(nextEvent, addMins),
      });
    }
  }

  if (endOfDay > new Date(sortedEvents[sortedEvents?.length - 1]?.endTime)) {
    freeIntervals.push({
      startTime: sortedEvents[sortedEvents.length - 1].endTime,
      endTime: endOfDay.toISOString(),
    });
  }

  return freeIntervals;
};

function incMinutes(time: string | Date, count: number = 1) {
  const date = new Date(time);
  date.setUTCMinutes(date.getUTCMinutes() + count);
  return date.toISOString();
}
