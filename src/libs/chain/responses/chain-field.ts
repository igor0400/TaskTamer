export const chainRieldMarkup = (
  isCancel: boolean,
  field: { isSkip?: boolean; cancelBtnCallbackData?: string },
) => ({
  inline_keyboard: [
    field?.isSkip
      ? [
          {
            text: '↪️ Пропустить',
            callback_data: 'unclearchain::skip_chain_field',
          },
        ]
      : [],
    isCancel
      ? [
          {
            text: '❌ Отменить',
            callback_data: field?.cancelBtnCallbackData ?? 'cancel_chain',
          },
        ]
      : [],
  ],
});
