import { backInlineBtn } from 'src/general';
import { getUserName } from 'src/libs/common';
import { User } from 'src/users/models/user.model';

export const profileMessage = (user: User) => `<b>Профиль</b>

🎓 Вы: ${getUserName(user)}
🔢 Ваш ID: <code>${user.telegramId}</code>`;

export const profileMarkup = (userId: string, isFull = false) => ({
  inline_keyboard: [
    [{ text: '📨 Подписки', callback_data: 'latter' }], // `${userId}::user_subscriptions`
    [
      {
        text: `${isFull ? '📬' : '📭'} Уведомления`,
        callback_data: 'user_notifications',
      },
    ],
    backInlineBtn,
  ],
});
