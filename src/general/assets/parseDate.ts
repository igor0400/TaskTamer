export const parseDate = (date: string | number | Date) => {
  const expires = new Date(date);

  return `${getZero(expires.getUTCDate())}.${getZero(
    expires.getUTCMonth() + 1,
  )}.${getZero(expires.getUTCFullYear())} ${getZero(
    expires.getUTCHours(),
  )}:${getZero(expires.getUTCMinutes())}`;
};

function getZero(val: string | number) {
  const num = +val;

  if (num < 10) {
    return `0${num}`;
  }

  return num;
}
