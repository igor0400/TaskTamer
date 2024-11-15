import { backBarInlineBtns } from 'src/general';

export const writeShareTitleMessage = () => `<b>Создание события</b>

📝 Напишите название события:`;

export const writeShareTitleMarkup = (dataValue: string) => {
  return {
    inline_keyboard: backBarInlineBtns(`${dataValue}::back_to_sh_c_e_e_t`),
  };
};
