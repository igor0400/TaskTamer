import { localBackInlineBtn } from 'src/general';
import { getUserName } from 'src/libs/common';
import { User } from 'src/users/models/user.model';

export const profileMessage = (user: User) => `<b>Профиль</b>

🎓 Вы: ${getUserName(user)}
🔢 Ваш ID: <code>${user.telegramId}</code>
🕑 Часовой пояс: <code>UTC(${user.timezone})</code>`;

export const profileMarkup = (userId: string, isFull = false) => ({
  inline_keyboard: [
    [{ text: '📨 Подписки', callback_data: 'latter' }], // `${userId}::user_subscriptions`
    [
      {
        text: `${isFull ? '📬' : '📭'} Уведомления`,
        callback_data: 'user_notifications',
      },
    ],
    [
      {
        text: `Изменить часовой пояс`,
        callback_data: 'change_user_timezone',
      },
    ],
    localBackInlineBtn('back'),
  ],
});
