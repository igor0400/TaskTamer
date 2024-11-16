import { backInlineBtn } from '../../general';

export const infoMessage = () => `<b>Информация</b>

🗓 <b>TaTa</b> — это удобный менеджер задач и совместных встреч.

🌐 Мы прислушиваемся ко всем нашим пользователям и максимально быстро и регулярно обновляем бота в лучшую сторону. 

💡 Если у Вас возникли какие-либо вопросы или предложения – можете связаться с нами ориентируясь по кнопкам ниже.`;

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
