import { textMonths } from 'src/calendar/configs';
import { CalendarEvent } from 'src/calendar/models/event.model';
import { backBarInlineBtns, getDayDate } from 'src/general';
import { getEventTexts } from '../assets';
import { getNowDateWithTZ } from 'src/libs/common';

export const eventMessage = (event: CalendarEvent) => {
  const { title, textDate, textStart, textEnd, textMembers } =
    getEventTexts(event);

  return `<b>Событие — ${title}</b>

<b>Дата начала:</b> <code>${textDate}</code>
<b>Время начала:</b> <code>${textStart}</code>
<b>Время окончания:</b> <code>${textEnd}</code>

<b>Участники события</b>: ${textMembers}`;
};

export const eventMarkup = ({
  event,
  type = 'owner',
  userId,
  timezone,
  inviterId,
}: {
  event: CalendarEvent;
  type: 'owner' | 'inviter';
  userId: string;
  timezone: string;
  inviterId?: string;
}) => {
  const startDate = new Date(event?.startTime);
  const textDate = `${startDate.getUTCDate()} ${
    textMonths[startDate.getUTCMonth()]
  }`;
  const deleteBtn =
    type === 'owner'
      ? [
          {
            text: '🗑 Удалить событие',
            callback_data: `${event.id}::delete_calendar_event_confirm`,
          },
        ]
      : [
          {
            text: '🏃 Покинуть событие',
            callback_data: `${event.id}::leave_calendar_event_confirm`,
          },
        ];

  const backDateBtnData = inviterId
    ? `${getDayDate(startDate)}_${inviterId}::back_to_share_calendar_date`
    : `${getDayDate(startDate)}::back_to_calendar_date`;

  const notification =
    getNowDateWithTZ({
      timezone,
      incHours: 1,
    }) <
    getNowDateWithTZ({
      timezone,
      initDate: event.startTime,
    })
      ? [
          [
            {
              text: '🔔 Напоминание',
              callback_data: `${event.id}::notifi_to_calendar_event`,
            },
          ],
        ]
      : [];

  return {
    inline_keyboard: [
      [
        {
          text: '🔗 Пригласить',
          url: `${encodeURI(
            `https://t.me/share/url?url=${process.env.BOT_LINK}?start=cal-e-j-${event.id}-${userId}&text=Приглашение присоединиться к событию ${textDate}`,
          )}`,
        },
      ],
      ...notification,
      deleteBtn,
      ...backBarInlineBtns(backDateBtnData),
    ],
  };
};
