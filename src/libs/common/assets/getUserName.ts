import { User } from 'src/users/models/user.model';

export const getUserName = (user: User | any = {}) => {
  const userLink = user.userName ? `https://t.me/${user.userName}` : false;

  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();

  const linkName = name !== '' ? name : user.telegramId;

  const codeName =
    name !== '' ? `<code>${name}</code>` : `<code>${user.telegramId}</code>`;

  const userName = userLink
    ? `<a href="${userLink}">${linkName}</a>`
    : codeName;

  return userName;
};
