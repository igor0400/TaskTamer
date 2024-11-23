import { CalendarEvent } from 'src/calendar/models/event.model';
import { User } from 'src/users/models/user.model';
import { getUserName } from 'src/libs/common';

export const inlineEventInviteMessage = (event: CalendarEvent, user: User) => {
  return `🗒 <b>${getUserName(
    user,
  )}</b> приглашает вас присоединиться к событию ${
    event.title === 'Событие' ? '' : `<b>"${event.title}"</b>`
  }`;
};

export const inlineEventInviteMarkup = ({ eventId, userId }) => ({
  inline_keyboard: [
    [
      {
        text: 'Присоединиться',
        url: `${process.env.BOT_LINK}?start=cal-e-j-${eventId}-${userId}`,
      },
    ],
  ],
});

export const writeInlineRequestTemplate = () =>
  `<b>Для создания события, введите название и время</b>

Пример: <code>Совещание в офисе 15:00-18:00 08.02.2025</code>`;
