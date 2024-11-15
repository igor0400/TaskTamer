export const getNowDate = (incHours = 0) => {
   const nowDate = new Date();
   const totalHours = new Date().getUTCHours() + 3 + incHours;
   nowDate.setUTCHours(totalHours);

   return nowDate;
};
