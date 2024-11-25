import { User } from 'src/users/models/user.model';
import { getUserName } from 'src/libs/common';
import { getEventTexts } from '../assets';

export const inlineEventInviteMessage = (title: string, user: User) => {
  return `🗒 <b>${getUserName(
    user,
  )}</b> приглашает вас присоединиться к событию ${
    !title || title === 'Событие' ? '' : `<b>"${title}"</b>`
  }`;
};

export const inlineLoadingEventInviteMarkup = () => ({
  inline_keyboard: [
    [
      {
        text: 'Загрузка...',
        callback_data: 'inline_loading',
      },
    ],
  ],
});

export const inlineReadyEventInviteMarkup = ({ eventId, userId }) => ({
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

Пример: <code>@${process.env.BOT_USERNAME} Совещание в офисе 15:00-18:00 08.02.2025</code>`;

export const createEventDescriptionMessage = (
  eventData: any,
  timezone: string,
) => {
  const { textDate, textStart } = getEventTexts(eventData, timezone);

  return `Бот создаст событие и приглашение на него ${textDate} в ${textStart}`;
};

export const createAlCrEventDescriptionMessage = (
  eventData: any,
  timezone: string,
) => {
  const { textDate, textStart } = getEventTexts(eventData, timezone);

  return `Бот создаст приглашение на ваше событие ${textDate} в ${textStart}`;
};
