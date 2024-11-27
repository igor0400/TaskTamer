const commands = {
  en: {
    create: {
      titles: ['create', 'create event', 'new event'],
    },
    find: {
      titles: ['event', 'find', 'find event'],
    },
  },
  ru: {
    create: {
      titles: [
        'создай',
        'создай событие',
        'новое событие',
        'создай новое событие',
        'сделай',
        'сделай событие',
        'сделай новое событие',
      ],
    },
    find: {
      titles: [
        'событие',
        'поиск',
        'найди',
        'найти',
        'найди событие',
        'покажи',
        'покажи событие',
      ],
    },
  },
};

export const commandsLocale = (lang: string) => commands[lang] ?? commands.ru;
