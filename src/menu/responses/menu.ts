export const menuMessage = () => `<b>Главное меню</b>

⚙️ <b>EntServices</b> — ваш идеальный помощник! Здесь вы найдете все необходимые сервисы, которые значительно упростят работу и сильно повысят вашу эффективность.`;

export const menuMarkup = {
  inline_keyboard: [
    [
      { text: 'ℹ️ Информация', callback_data: 'info' },
      { text: '👤 Профиль', callback_data: 'profile' },
    ],
    [{ text: '🗓 Календарь', callback_data: 'calendar_service' }],
  ],
};

// переделать оформление, главное меню, текст календаря, инфо
