import { backInlineBtn } from 'src/general';
import { getUserName } from 'src/libs/common';
import { User } from 'src/users/models/user.model';

export const eventRejectedMessage = (user: User) => `<b>Уведомление</b>

❌ ${getUserName(user)} отклонил ваше приглашение!`;

export const eventRejectedMarkup = (eventId: string) => ({
  inline_keyboard: [
    [{ text: '🗒 К событию', callback_data: `${eventId}::calendar_event` }],
    backInlineBtn,
  ],
});
