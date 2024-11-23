const commands = {
  en: {
    create: {
      titles: ['create', 'create event', 'new event'],
    },
  },
  ru: {
    create: {
      titles: [
        'создай',
        'создай событие',
        'новое событие',
        'событие',
        'создай новое событие',
        'сделай',
        'сделай событие',
        'сделай новое событие',
      ],
    },
  },
};

export const commandsLocale = (lang: string) => commands[lang] ?? commands.ru;
