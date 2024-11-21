export const filterEventsByDate = (events: any[], dateVal: string) => {
  const [date, month, year] = dateVal.split('.');
  const filteredEvents = events.filter((val) =>
    new RegExp(`${year}-${month}-${date}.*`).test(
      new Date(val?.startTime)?.toISOString(),
    ),
  );
  const sortedEvents = filteredEvents.sort((a, b) =>
    new Date(a.startTime) > new Date(b.startTime) ? 1 : -1,
  );

  return sortedEvents;
};
