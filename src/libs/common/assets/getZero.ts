export const getZero = (num: string | number) => {
  if (String(num).length < 2) {
    return `0${num}`;
  } else {
    return num;
  }
};
