import { Validations } from 'src/general';

export const createEventTitleValidation = (title: string): Validations => [
  {
    stipulation: title.length > 100,
    text: '🚫 Максимальная длина 100 символов',
  },
];
