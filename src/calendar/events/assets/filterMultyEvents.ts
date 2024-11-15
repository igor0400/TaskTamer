import { CalendarEvent } from 'src/calendar/models/event.model';

export const filterMultyEvents = (events: CalendarEvent[]) => {
  let resultEvents: CalendarEvent[] = [];

  if (!events.length) return [];

  for (let event of events) {
    if (!event?.dataValues) continue;

    const evStart = new Date(event.startTime);
    const evEnd = new Date(event.endTime);

    const pushEvent = JSON.parse(JSON.stringify(event));

    for (let resultEvent of resultEvents) {
      const resStart = new Date(resultEvent.startTime);
      const resEnd = new Date(resultEvent.endTime);
      const evStartEqual = resStart <= evStart && evStart <= resEnd;
      const evEndEqual = resStart <= evEnd && evEnd <= resEnd;

      if (evStartEqual || evEndEqual) {
        deleteResultItem(resultEvent.id);
        deleteResultItem(event.id);

        if (resStart < evStart) {
          pushEvent.startTime = resultEvent.startTime;
        }
        if (resEnd > evEnd) {
          pushEvent.endTime = resultEvent.endTime;
        }
      }
    }

    resultEvents.push(pushEvent);
  }

  function deleteResultItem(id: string) {
    resultEvents = resultEvents.filter((i) => i.id !== id);
  }

  return resultEvents;
};
