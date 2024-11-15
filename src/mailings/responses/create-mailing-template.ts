export const setMailingTemplateTitleMessage = () =>
  `<b>Отправьте название шаблона рассылки:</b>`;

export const setMailingTemplateTitleMarkup = {
  inline_keyboard: [
    [{ text: '❌ Отменить', callback_data: 'mailing_templates' }],
  ],
};

export const createMailingTemplateMessage = () => `<b>Шаблон рассылки</b>

Отправьте сообщение рассылки, это может быть: <b>фото, файл (любой формат), голосовое сообщение, видео, GIF или текст</b>.

<i>Вы можете добавить описание к сообщению, а так же использовать <a href="https://core.telegram.org/api/entities">HTML форматирование</a> текста.</i>`;

export const createMailingTemplateMarkup = {
  inline_keyboard: [
    [{ text: '❌ Отменить', callback_data: 'mailing_templates' }],
  ],
};

export const createGlobalMailingTemplateMessage =
  () => `<b>Выберите тип шаблона:</b>

<i>Этот шаблон будет доступен всем пользователям из выбранной категории.</i>`;

export const createGlobalMailingTemplateMarkup = {
  inline_keyboard: [
    [
      {
        text: 'Для админов',
        callback_data: 'admins::create_typed_mailing_template',
      },
    ],
    [
      {
        text: 'Для вбиверов',
        callback_data: 'vbvers::create_typed_mailing_template',
      },
    ],
    [
      {
        text: 'Для операторов',
        callback_data: 'tech_support::create_typed_mailing_template',
      },
    ],
    [
      {
        text: 'Для наставников',
        callback_data: 'mentors::create_typed_mailing_template',
      },
    ],
    [
      {
        text: 'Для всех',
        callback_data: 'global::create_typed_mailing_template',
      },
    ],
    [{ text: '❌ Отменить', callback_data: 'mailing_templates' }],
  ],
};
