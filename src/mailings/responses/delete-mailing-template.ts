export const deleteMailingTemplateConfirmationMessage = (title: string) =>
  `<b>Удалить шаблон рассылки "${title}"?</b>`;

export const deleteMailingTemplateConfirmationMarkup = (
  mailingTemplateId: string,
) => ({
  inline_keyboard: [
    [
      {
        text: '🗑 Удалить',
        callback_data: `${mailingTemplateId}::delete_mailing_template`,
      },
    ],
    [
      {
        text: '❌ Отменить',
        callback_data: `${mailingTemplateId}::mailing_template_page`,
      },
    ],
  ],
});
