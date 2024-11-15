import { getDateFromDataVal } from 'src/calendar/assets';
import { getNowDate } from 'src/libs/common';

export function getMonthDifferenceByDateVal(
  date1: string,
  date2: Date = getNowDate(),
) {
  const valDate = getDateFromDataVal(date1);

  let months = (valDate.getUTCFullYear() - date2.getUTCFullYear()) * 12;
  months -= date2.getUTCMonth();
  months += valDate.getUTCMonth();

  return months;
}
