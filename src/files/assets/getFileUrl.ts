export const getFileUrl = (url: string) => {
  if (url[0] === '/') {
    return `${process.env.PUBLIC_BACKEND_URL}${url}`;
  } else {
    return url;
  }
};
