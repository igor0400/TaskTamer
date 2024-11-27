import { CalendarEvent } from 'src/calendar/models/event.model';
import { backInlineBtn } from 'src/general';
import { getUserName } from 'src/libs/common';
import { User } from 'src/users/models/user.model';
import { getEventTexts } from '../assets';

export const deletedEventMessage = (user: User, event: CalendarEvent) => {
  const { title, textDate, textStart, textEnd } = getEventTexts(
    event,
    user?.timezone,
  );

  const strTitle = title ? ` <b>"${title}"</b>` : '';

  return `<b>Уведомление</b>

🗑 ${getUserName(user)} удалил событие${strTitle} 

<b>Дата начала:</b> <code>${textDate}</code>
<b>Время начала:</b> <code>${textStart}</code>
<b>Время окончания:</b> <code>${textEnd}</code>`;
};

export const deletedEventMarkup = () => ({
  inline_keyboard: [backInlineBtn],
});
