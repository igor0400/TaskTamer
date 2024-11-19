import { localBackInlineBtn } from 'src/general';
import { getUserName } from 'src/libs/common';
import { User } from 'src/users/models/user.model';

export const profileMessage = (user: User) => `<b>Ваш личный кабинет</b>
— Здесь вы можете просмотреть необходимую информацию:

<b>Вы:</b> ${getUserName(user)}
<b>Ваш ID:</b> <code>${user.telegramId}</code>
<b>Часовой пояс:</b> <code>UTC(${user.timezone})</code>

<i>Для изменения часового пояса, управления подписками и уведомлениями можете ориентироваться по соответствующим кнопкам ниже</i>`;

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
