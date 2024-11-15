export const requestMessages = {
  isEmail: 'Некорректный email',
  isPhone: 'Некорректный номер телефона',
  isString: (title: string) => `Поле ${title} должно быть строкой`,
  isNumber: (title: string) => `Поле ${title} олжно быть числом`,
  isBoolean: (title: string) => `Поле ${title} болжно быть boolean`,
  isNotEmpty: (title: string) => `Поле ${title} обязательно`,
  maxLength: (title: string, len: number) =>
    `Максимальная длинна поля ${title} ${len} символ(ов, a)`,
  isEnum: (title: string, values: string[]) =>
    `Поле ${title} может иметь значения ${values.join(', ')}`,
  isArray: (title: string) => `Поле ${title} должно быть массивом`,
};
