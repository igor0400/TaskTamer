import { backBarInlineBtns } from 'src/general';

export const eventNotificationPageMessage = ({ event, notifi }) =>
  `<b>Напоминание о событии — ${event?.title}</b>

Вам придёт сообщение с напоминанием, <u>за timeOfNotifi ${notifi.extraData}</u>`;

export const eventNotificationPageMarkup = (eventId: string) => ({
  inline_keyboard: [
    [
      {
        text: 'Изменить время',
        callback_data: `${eventId}::start_change_notifi_event_time`,
      },
    ],
    [
      {
        text: 'Убрать напоминание',
        callback_data: `${eventId}::delete_notifi_event_time`,
      },
    ],
    ...backBarInlineBtns(`${eventId}::back_to_calendar_event`),
  ],
});

// сделать форматирование времени и цикл с напоминанием
// исправить все ебань с TZ
