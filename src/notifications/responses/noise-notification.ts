import { backInlineBtn } from 'src/general';

export const noiseNotificationMessage = ({ event, addHours }) =>
  `Напоминаем о событии ${event?.title}, через ${addHours} часа(ов)`;

export const noiseNotificationMarkup = (eventId: string) => ({
  inline_keyboard: [
    [{ text: 'К событию', callback_data: `${eventId}::calendar_event` }],
    backInlineBtn,
  ],
});
