export const menuMessage = () => `<b>Главное меню</b>

Для начала работы перейдите в раздел «Календарь»`;

export const menuMarkup = {
  inline_keyboard: [
    [
      { text: 'ℹ️ Информация', callback_data: 'info' },
      { text: '👤 Профиль', callback_data: 'profile' },
    ],
    [{ text: '🗓 Календарь', callback_data: 'calendar_service' }],
  ],
};
