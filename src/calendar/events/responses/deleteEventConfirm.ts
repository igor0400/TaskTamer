import { backBarInlineBtns } from 'src/general';

export const deleteEventConfirmMessage = () => `<b>Подтверждение</b>

🗑 Вы хотите удалить событие?`;

export const deleteEventConfirmMarkup = (eventId: string) => ({
  inline_keyboard: [
    [
      {
        text: 'Да, удалить',
        callback_data: `${eventId}::delete_calendar_event`,
      },
    ],
    ...backBarInlineBtns(`${eventId}::back_to_calendar_event`),
  ],
});
