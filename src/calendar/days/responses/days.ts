import { CalendarEvent } from 'src/calendar/models/event.model';
import { backBarInlineBtns, InlineBtnType } from '../../../general';
import { textMonths } from '../../configs';
import { getZero } from 'src/libs/common';
import { CalendarBusyDay } from 'src/calendar/models/busy-day.model';
import { CreatePaginationProps } from 'src/libs/pagination/types';

interface CalendarDaysMarkup {
  userId: string;
  date: string;
  events: CalendarEvent[];
  busyDay: CalendarBusyDay | undefined;
  createPagination: (
    conf: Omit<CreatePaginationProps, 'userId'>,
  ) => Promise<InlineBtnType[][]>;
}

export const calendarDaysMessage = (date: string) => {
  const splitDate = date.split('.');
  const textDate = `${+splitDate[0]} ${textMonths[+splitDate[1] - 1]}`;

  return `<b>События — ${textDate}</b>

Здесь отображается список ваших событий, <u>нажмите</u> на любое из них для более подробной информации.

С помощью кнопок ниже вы можете:
— <u>отметить</u> день недоступным для создания новых событий
— <u>поделится</u> ссылкой на эту дату`;
};

export const calendarDaysMarkup = async ({
  userId,
  date,
  events,
  busyDay,
  createPagination,
}: CalendarDaysMarkup) => {
  const eventsBtns = await getEventsBtns(
    events,
    date,
    busyDay,
    createPagination,
  );
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

async function getEventsBtns(
  events: CalendarEvent[],
  date: string,
  busyDay: CalendarBusyDay,
  createPagination: Function,
) {
  const eventsBtns = [];
  const extraBtns = [];

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
    eventsBtns.push({
      text: 'Список пуст',
      callback_data: 'empty_calendar_day_events',
    });
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

      eventsBtns.push({
        text: `${eventFromTime} - ${eventTillTime}${
          event.title ? ` | ${event.title}` : ''
        }`,
        callback_data: `${event.id}::calendar_event`,
      });
    }
  }

  if (busyDay?.type === 'manually') {
    extraBtns.push(
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
    extraBtns.push(
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

  const pagination = await createPagination({
    items: eventsBtns,
    pageItemsCount: 10,
    rowLen: 1,
    isShowCount: true,
  });

  return [...pagination, ...extraBtns];
}
