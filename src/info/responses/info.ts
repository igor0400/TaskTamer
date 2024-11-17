import { backInlineBtn } from '../../general';

export const infoMessage =
  () => `<b>TaTa — это удобный менеджер задач и совместных встреч</b>, в котором собраны самые необходимые функции для комфортной работы.

Мы прислушиваемся ко всем нашим пользователям, максимально качественно обновляя сервис в лучшую сторону.

Если у Вас возникли какие-либо <u>вопросы</u> или <u>предложения</u> — можете <u>связаться</u> с нами ориентируясь по кнопкам ниже.`;

export const infoMarkup = {
  inline_keyboard: [
    [
      { text: '💬 Наш чат', url: 'https://t.me/EntServicesChat' },
      { text: '📨 Наш канал', url: 'https://t.me/EntServicesNews' },
    ],
    [{ text: '💻 Администратор', url: `https://t.me/ul1dev` }],
    backInlineBtn,
  ],
};
