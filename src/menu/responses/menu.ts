export const menuMessage = () =>
  `<b>Добро пожаловать в TaTa</b> — сервис для <u>планирования</u> личных, или совместных задач. Для начала работы переходите в раздел «<u>Календарь</u>» по кнопке ниже.`;

export const menuMarkup = {
  inline_keyboard: [
    [
      { text: 'ℹ️ Информация', callback_data: 'info' },
      { text: '👤 Профиль', callback_data: 'profile' },
    ],
    [{ text: '📝 Заметки', callback_data: 'notes_service' }],
    [{ text: '🗓 Календарь', callback_data: 'calendar_service' }],
  ],
};
