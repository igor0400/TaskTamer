export const banMessage = (reason: string) => {
  return `<b>Вы заблокированы</b>

⛔ <b>Вас заблокировала администрация.</b>
${reason ? `🗣 <b>Причина:</b> <code>${reason}</code>` : ''}
`;
};

export const banMarkup = {
  inline_keyboard: [[{ text: '💻 Администратор', url: `https://t.me/ul1dev` }]],
};
