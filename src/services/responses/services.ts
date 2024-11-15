import { backInlineBtn } from '../../general';

export const servicesMessage = () => `<b>Сервисы</b>

🗂️ Чтобы начать пользоваться нашими сервисами, просто выберите интересующий вас раздел ориентируясь по кнопкам ниже.`;

export const servicesMarkup = {
  inline_keyboard: [
    [{ text: '🗓 Календарь', callback_data: 'calendar_service' }],
    [{ text: '🏗 Конструктор', callback_data: 'constructor_service' }],
    backInlineBtn,
  ],
};
