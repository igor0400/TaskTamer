export const sendMailingConfirmationMessage = (
  text: string,
) => `<b>Подтвердите рассылку:</b>

${text ?? ''}`;

export const sendMailingConfirmationMarkup = (mailingId: string) => ({
  inline_keyboard: [
    [
      { text: '❌ Отменить', callback_data: `${mailingId}::cancel_mailing` },
      { text: '✅ Подтвердить', callback_data: `${mailingId}::apply_mailing` },
    ],
  ],
});

export const sendMailingMessage = (
  from: number,
  to: number,
) => `<b>Отправка сообщений</b>

Отправлено: <code>${from}</code> из <code>${to}</code>
<i>Дождитесь окончания рассылки.</i>`;

export const sendedMailingMessage = (
  count: number,
) => `<b>Рассылка завершена</b>

✅ Сообщения успешно разосланы: <code>${count}</code> из <code>${count}</code>`;
