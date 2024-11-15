export const followNewsMessage =
  () => `<b>Для продолжения работы с ботом</b>, Вам необходимо подписаться наш на новостной.

<i>Это обязательно, чтобы быть в курсе всех новостей и нововведений в наших ботах.</i>`;

export const followNewsMarkup = () => ({
  inline_keyboard: [
    [{ text: '📨 Канал', url: 'https://t.me/EntServicesNews' }],
    [{ text: 'Проверить подписку', callback_data: `check_news_follow` }],
  ],
});
