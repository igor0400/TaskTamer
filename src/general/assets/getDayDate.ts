import { getZero } from 'src/libs/common';

export const getDayDate = (date?: string | Date) => {
  const newDate = date ? new Date(date) : new Date();

  return `${getZero(newDate.getUTCDate())}.${getZero(
    newDate.getUTCMonth() + 1,
  )}.${newDate.getUTCFullYear()}`;
};
