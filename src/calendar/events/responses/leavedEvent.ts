import { backInlineBtn } from 'src/general';
import { getUserName } from 'src/libs/common';
import { User } from 'src/users/models/user.model';

export const leavedEventMessage = (user: User) => `<b>Уведомление</b>

🏃 ${getUserName(user)} покинул ваше событие`;

export const leavedEventMarkup = (eventId: string) => ({
  inline_keyboard: [
    [{ text: '🗒 К событию', callback_data: `${eventId}::calendar_event` }],
    backInlineBtn,
  ],
});
