export const getSendTimeText = (hours: string | number) => {
  const sendHours = Number(hours);

  if (sendHours === 0) {
    return 'к началу события';
  }

  if (sendHours === 1) {
    return 'за час до начала события';
  }

  if (sendHours < 5) {
    return `за ${sendHours} часа до начала события`;
  }

  if (sendHours < 21) {
    return `за ${sendHours} часов до начала события`;
  }

  if (sendHours === 21) {
    return `за ${sendHours} час до начала события`;
  }

  if (sendHours < 48) {
    return 'за день до начала события';
  }

  const daysCount = Math.floor(sendHours / 24);

  if (daysCount === 1) {
    return 'за день до начала события';
  }

  if (daysCount < 5) {
    return `за ${sendHours} дня до начала события`;
  }

  return `за ${sendHours} дней до начала события`;
};
