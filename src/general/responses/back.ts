export const backInlineBtn = [{ text: '🏠 В меню', callback_data: 'back' }];

export const backMarkup = {
  inline_keyboard: [backInlineBtn],
};
export const cancelBackInlineBtn = [
  { text: '❌ Отменить', callback_data: 'back' },
];

export const cancelBackMarkup = {
  inline_keyboard: [cancelBackInlineBtn],
};

export const sendBackInlineBtn = [
  { text: '🏠 В меню', callback_data: 'send_back' },
];

export const sendBackMarkup = {
  inline_keyboard: [sendBackInlineBtn],
};

export const localBackInlineBtn = (callback_data: string) => [
  { text: '⏪ Назад', callback_data },
];

export const cancelInlineBtn = (callback_data: string) => [
  { text: '❌ Отменить', callback_data },
];

export const backBarInlineBtns = (callback_data: string) => [
  [...localBackInlineBtn(callback_data), ...backInlineBtn],
];

export const backBarMarkup = (callback_data: string) => ({
  inline_keyboard: backBarInlineBtns(callback_data),
});
