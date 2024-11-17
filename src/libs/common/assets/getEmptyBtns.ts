export const getEmptyBtns = (count: number) => {
  const days = [];

  for (let i = 0; i < count; i++) {
    days.push({ text: ' ', callback_data: `empty_button` });
  }

  return days;
};
