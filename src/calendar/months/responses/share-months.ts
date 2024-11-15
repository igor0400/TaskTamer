import { CalendarBusyDay } from 'src/calendar/models/busy-day.model';
import { backInlineBtn } from '../../../general';
import {
  formatKeyboard,
  getNowDate,
  getUserName,
  getZero,
} from 'src/libs/common';
import { getEmptyBtns } from '../../assets';
import { months, weekDays } from '../../configs';
import { User } from 'src/users/models/user.model';

export const shareCalendarMonthsMessage = (
  user: User,
) => `<b>Календарь встреч/событий</b>

🗓 Календарь – это сервис для удобного планирования встреч и событий.

👇 Чтобы назначить встречу с ${getUserName(
  user,
)}, выберите удобную для вас дату.

<i>❌ – день недоступен</i>`;

export const shareCalendarMonthsMarkup = (
  userId: string,
  busyDays: CalendarBusyDay[],
  incMonth = 0,
) => {
  const oldestDate = getNowDate();
  oldestDate.setUTCMonth(oldestDate.getUTCMonth() + 1 + incMonth);
  oldestDate.setUTCDate(0);
  const maxDate = oldestDate.getUTCDate();
  const maxDateDay = oldestDate.getUTCDay();

  const newestDate = getNowDate();
  newestDate.setUTCMonth(newestDate.getUTCMonth() + incMonth);
  newestDate.setUTCDate(1);
  const minDateDay = newestDate.getUTCDay();

  const days = [];

  if (minDateDay !== 1) {
    days.push(...getEmptyBtns(minDateDay === 0 ? 6 : minDateDay - 1));
  }

  for (let i = 1; i < maxDate + 1; i++) {
    const isBusy = busyDays.map((i) => i.date).includes(i);

    let dayText = String(i);

    const today = getNowDate();

    if (isBusy) {
      dayText = '❌';
    }

    if (
      oldestDate.getUTCFullYear() === today.getUTCFullYear() &&
      oldestDate.getUTCMonth() === today.getUTCMonth() &&
      today.getUTCDate() === i
    ) {
      dayText += ' ●';
    }

    days.push({
      text: dayText,
      callback_data: `${getZero(i)}.${getZero(
        oldestDate.getUTCMonth() + 1,
      )}.${oldestDate.getUTCFullYear()}_${userId}::share_calendar_date`,
    });
  }

  const daysDiff = maxDate % 7;
  const isMonthClear = daysDiff === 0 && minDateDay === 1;

  if (!isMonthClear && maxDateDay !== 0) {
    days.push(...getEmptyBtns(7 - maxDateDay));
  }

  const monthBtn = months[oldestDate.getUTCMonth()];

  return {
    inline_keyboard: [
      [
        {
          ...monthBtn,
          text: `${monthBtn.text} ${oldestDate.getUTCFullYear()}`,
        },
      ],
      weekDays,
      ...formatKeyboard(days, 7),
      [
        {
          text: '◀️',
          callback_data: `${incMonth}_${userId}::prev_share_calendar_month`,
        },
        {
          text: '▶️',
          callback_data: `${incMonth}_${userId}::next_share_calendar_month`,
        },
      ],
      backInlineBtn,
    ],
  };
};
