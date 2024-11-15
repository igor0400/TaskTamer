import { CalendarEvent } from 'src/calendar/models/event.model';
import { backInlineBtn } from 'src/general';
import { getUserName } from 'src/libs/common';
import { User } from 'src/users/models/user.model';
import { getEventTexts } from '../assets';

export const deletedEventMessage = (user: User, event: CalendarEvent) => {
  const { title, textDate, textStart, textEnd } = getEventTexts(event);

  return `<b>Уведомление</b>

🗑 ${getUserName(user)} удалил событие <b>"${title}"</b>

🗓 <b>Дата:</b> <code>${textDate}</code>
🕗 <b>Начало:</b> <code>${textStart}</code>
🕔 <b>Конец:</b> <code>${textEnd}</code>`;
};

export const deletedEventMarkup = () => ({
  inline_keyboard: [backInlineBtn],
});
