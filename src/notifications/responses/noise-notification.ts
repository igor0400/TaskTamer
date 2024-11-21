import { backInlineBtn } from 'src/general';

export const noiseNotificationMessage = ({ event, addHours }) =>
  `🔔 Событие <b>"<u>${event?.title}</u>"</b> ${getEventTime(
    addHours,
  )}, не пропустите!`;

export const noiseNotificationMarkup = (eventId: string) => ({
  inline_keyboard: [
    [{ text: 'К событию', callback_data: `${eventId}::calendar_event` }],
    backInlineBtn,
  ],
});

function getEventTime(addHours: string | number) {
  const hours = Number(addHours);

  if (hours === 0) {
    return 'уже началось';
  }

  if (hours === 1) {
    return 'начнётся уже через час';
  }

  if (hours < 5) {
    return `начнётся уже через ${hours} часа`;
  }

  if (hours < 21) {
    return `начнётся уже через ${hours} часов`;
  }

  if (hours === 21) {
    return `начнётся уже через ${hours} час`;
  }

  if (hours < 48) {
    return 'начнётся через 1 день';
  }

  const daysCount = Math.floor(hours / 24);

  if (daysCount < 5) {
    return `начнётся через ${daysCount} дня`;
  }

  return `начнётся через ${daysCount} дней`;
}
