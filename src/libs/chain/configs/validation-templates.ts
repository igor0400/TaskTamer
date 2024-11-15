export const validationTemplates = {
  isNum: (text: string) => ({
    stipulation: !+text,
    text: `🚫 <b>Введите число.</b>`,
  }),
  maxLen: (text: string, value: number) => ({
    stipulation: text.length > value,
    text: `🚫 <b>Максимальная длина <code>${value}</code> символов.</b>`,
  }),
  minCount: (text: string, value: number) => ({
    stipulation: +text < value,
    text: `🚫 <b>Число должно быть не меньше <code>${value}</code>.</b>`,
  }),
  maxCount: (text: string, value: number) => ({
    stipulation: +text > value,
    text: `🚫 <b>Число должно быть не больше <code>${value}</code>.</b>`,
  }),
  uprepetBotToken: (text: string, value: any, isTeamCrearted: boolean) => ({
    stipulation: isTeamCrearted,
    text: `🚫 <b>Бот с таким токеном уже существует.</b>`,
  }),
};
