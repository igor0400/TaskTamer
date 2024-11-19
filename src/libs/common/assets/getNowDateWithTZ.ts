export const getNowDateWithTZ = ({
  timezone,
  initDate,
  incHours = 0,
}: {
  timezone: string;
  incHours?: number;
  initDate?: number | string | Date;
}) => {
  const nowDate = initDate ? new Date(initDate) : new Date();

  const ETtype = timezone.slice(0, 1);
  const ETval = Number(timezone.slice(1));

  let hours = nowDate.getUTCHours();

  if (ETtype === '+') {
    hours += ETval;
  } else {
    hours -= ETval;
  }

  nowDate.setUTCHours(hours + incHours);

  return nowDate;
};
