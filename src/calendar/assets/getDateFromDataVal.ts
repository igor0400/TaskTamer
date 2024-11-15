export const getDateFromDataVal = (dataValue: string) => {
  const date = new Date();
  const [dayVal, monthVal, yearVal] = dataValue.split('.');

  date.setUTCMilliseconds(0);
  date.setUTCSeconds(0);
  date.setUTCMinutes(0);
  date.setUTCHours(0);
  date.setUTCDate(+dayVal);
  date.setUTCMonth(+monthVal - 1);
  date.setUTCFullYear(+yearVal);

  return date;
};
