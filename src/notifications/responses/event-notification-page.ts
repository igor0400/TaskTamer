import { backBarInlineBtns } from 'src/general';

export const setEventNotificationMessage = () =>
  `<b>Выберите когда вам напомнить о событии:</b>

<i>Вам придёт сообщение с напоминанием, рекомендуем не отключать уведомления от бота</i>`;

export const setEventNotificationMarkup = (eventId: string) => ({
  inline_keyboard: [
    [{ text: 'К началу', callback_data: `${eventId}:0::set_event_notifi` }],
    [{ text: 'За час', callback_data: `${eventId}:1::set_event_notifi` }],
    [{ text: 'За 2 часа', callback_data: `${eventId}:2::set_event_notifi` }],
    [{ text: 'За 6 часов', callback_data: `${eventId}:6::set_event_notifi` }],
    [
      {
        text: 'За 12 часов',
        callback_data: `${eventId}:12::set_event_notifi`,
      },
    ],
    [{ text: 'За день', callback_data: `${eventId}:24::set_event_notifi` }],
    [{ text: 'За 2 дня', callback_data: `${eventId}:48::set_event_notifi` }],
    ...backBarInlineBtns(`${eventId}::back_to_calendar_event`),
  ],
});

export const chnageEventTimeNotificationMarkup = (eventId: string) => ({
  inline_keyboard: [
    [
      {
        text: 'К началу',
        callback_data: `${eventId}:0::change_notifi_event_time`,
      },
    ],
    [
      {
        text: 'За час',
        callback_data: `${eventId}:1::change_notifi_event_time`,
      },
    ],
    [
      {
        text: 'За 2 часа',
        callback_data: `${eventId}:2::change_notifi_event_time`,
      },
    ],
    [
      {
        text: 'За 6 часов',
        callback_data: `${eventId}:6::change_notifi_event_time`,
      },
    ],
    [
      {
        text: 'За 12 часов',
        callback_data: `${eventId}:12::change_notifi_event_time`,
      },
    ],
    [
      {
        text: 'За день',
        callback_data: `${eventId}:24::change_notifi_event_time`,
      },
    ],
    [
      {
        text: 'За 2 дня',
        callback_data: `${eventId}:48::change_notifi_event_time`,
      },
    ],
    ...backBarInlineBtns(`${eventId}::back_to_calendar_event`),
  ],
});
