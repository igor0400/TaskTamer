import { CalendarEvent } from 'src/calendar/models/event.model';
import { backBarInlineBtns, backInlineBtn } from 'src/general';
import { getUserName } from 'src/libs/common';
import { User } from 'src/users/models/user.model';
import { getEventTexts } from '../assets';

export const eventInviteMessage = (event: CalendarEvent, owner: User) => {
  const { title, textDate, textStart, textEnd, textMembers } =
    getEventTexts(event);

  return `<b>Приглашение</b>

🗒 ${getUserName(owner)} приглашает вас присоединиться к событию ${
    title === 'Событие' ? '' : `<b>"${title}"</b>`
  }

🗓 <b>Дата:</b> <code>${textDate}</code>
🕗 <b>Начало:</b> <code>${textStart}</code>
🕔 <b>Конец:</b> <code>${textEnd}</code>

👥 <b>Участники:</b> ${textMembers}`;
};

export const eventInviteMarkup = (eventId: string, userId?: string) => {
  const backBtns = userId
    ? backBarInlineBtns('back_to_user_notifications')
    : [backInlineBtn];

  return {
    inline_keyboard: [
      [
        {
          text: '✅ Принять',
          callback_data: `${eventId}::accept_event_invite`,
        },
        {
          text: '❌ Отклонить',
          callback_data: `${eventId}::reject_event_invite`,
        },
      ],
      ...backBtns,
    ],
  };
};
