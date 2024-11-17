import { CalendarEvent } from 'src/calendar/models/event.model';
import { backBarInlineBtns } from '../../../general';
import { textMonths } from '../../configs';
import { getZero } from 'src/libs/common';
import { CalendarBusyDay } from 'src/calendar/models/busy-day.model';

interface CalendarDaysMarkup {
  userId: string;
  date: string;
  events: CalendarEvent[];
  busyDay: CalendarBusyDay | undefined;
}

export const calendarDaysMessage = (date: string) => {
  const splitDate = date.split('.');
  const textDate = `${+splitDate[0]} ${textMonths[+splitDate[1] - 1]}`;

  return `<b>События ${textDate}</b>

Здесь отображается список ваших событий. Нажмите на любое из них для подробной информации.

ℹ️ Вы можете отметить день недоступным для создания новых событий или поделится ссылкой на эту дату.`;
};

export const calendarDaysMarkup = ({
  userId,
  date,
  events,
  busyDay,
}: CalendarDaysMarkup) => {
  const eventsBtns = getEventsBtns(events, date, busyDay);
  const splitDate = date.split('.');
  const textDate = `${splitDate[0]} ${textMonths[+splitDate[1] - 1]}`;

  return {
    inline_keyboard: [
      ...eventsBtns,
      [
        {
          text: '🔗 Поделиться ссылкой',
          url: encodeURI(
            `https://t.me/share/url?url=${
              process.env.BOT_LINK
            }?start=cal-d-${date.replaceAll(
              '.',
              '_',
            )}-${userId}&text=Вот ссылка на мою занятость ${textDate}`,
          ),
        },
      ],
      ...backBarInlineBtns(`${date}::back_to_calendar_month`),
    ],
  };
};

function getEventsBtns(
  events: CalendarEvent[],
  date: string,
  busyDay: CalendarBusyDay,
) {
  const eventsBtns = [];

  if (busyDay && events.length === 0) {
    return [
      [{ text: '❌ День недоступен', callback_data: 'busy_calendar_day' }],
      [
        {
          text: '✅ Отметить доступным',
          callback_data: `${date}::set_unbusy_calendar_day`,
        },
      ],
    ];
  }

  if (events.length === 0) {
    eventsBtns.push([
      { text: 'Список пуст', callback_data: 'empty_calendar_day_events' },
    ]);
  } else {
    for (let event of events) {
      const eventFrom = new Date(event.startTime);
      const eventTill = new Date(event.endTime);
      const eventFromTime = `${getZero(eventFrom.getUTCHours())}:${getZero(
        eventFrom.getUTCMinutes(),
      )}`;
      const eventTillTime = `${getZero(eventTill.getUTCHours())}:${getZero(
        eventTill.getUTCMinutes(),
      )}`;

      eventsBtns.push([
        {
          text: `${eventFromTime} - ${eventTillTime}${
            event.title ? ` | ${event.title}` : ''
          }`,
          callback_data: `${event.id}::calendar_event`,
        },
      ]);
    }
  }

  if (busyDay?.type === 'manually') {
    eventsBtns.push(
      ...[
        [{ text: '❌ День недоступен', callback_data: 'busy_calendar_day' }],
        [
          {
            text: '✅ Отметить доступным',
            callback_data: `${date}::set_unbusy_calendar_day`,
          },
        ],
      ],
    );
  }

  if (!busyDay) {
    eventsBtns.push(
      ...[
        [
          {
            text: '❌ Отметить недоступным',
            callback_data: `${date}::sey_busy_calendar_day`,
          },
        ],
        [
          {
            text: '📝 Создать событие',
            callback_data: `${date}::create_personal_calendar_event`,
          },
        ],
      ],
    );
  }

  return eventsBtns;
}
