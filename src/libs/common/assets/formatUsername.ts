export const formatUsername = (userName: string) => {
  if (!userName) return;

  return userName
    ?.replaceAll('@', '')
    ?.replaceAll('https://t.me/', '')
    ?.replaceAll(/[^a-zA-Z0-9_]/g, '');
};
