import { backBarInlineBtns } from 'src/general';

export const leaveEventConfirmMessage = () => `<b>Подтверждение</b>

🏃 Вы хотите покинуть событие?`;

export const leaveEventConfirmMarkup = (eventId: string) => ({
  inline_keyboard: [
    [
      {
        text: 'Да, покинуть',
        callback_data: `${eventId}::leave_calendar_event`,
      },
    ],
    ...backBarInlineBtns(`${eventId}::back_to_calendar_event`),
  ],
});
