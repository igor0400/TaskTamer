export const numUid = (len = 20) => {
  let id = '';

  for (let i = 0; i < len; i++) {
    id += getRangomNum();
  }

  return id;
};

function getRangomNum() {
  return Math.floor(Math.random() * 10 + 0);
}
