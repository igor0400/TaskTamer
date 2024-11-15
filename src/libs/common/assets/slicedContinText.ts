export const slicedContinText = (text: string = '', len: number = 10) => {
  if (text.length > len) {
    return `${text.slice(0, len - 3)}...`;
  } else {
    return text;
  }
};
