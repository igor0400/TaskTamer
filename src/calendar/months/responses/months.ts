import { CalendarBusyDay } from 'src/calendar/models/busy-day.model';
import { backInlineBtn } from '../../../general';
import {
  formatKeyboard,
  getEmptyBtns,
  getNowDate,
  getZero,
} from 'src/libs/common';
import { months, weekDays } from '../../configs';

export const calendarMonthsMessage =
  () => `<b>Вы можете поделиться ссылкой на свой календарь</b> и вам не придется обсуждать время встречи, так как человек выберет его сам, основываясь на вашем графике.

При необходимости вы также можете отправить ссылку на <u>конкретную дату</u>, для этого <u>выберите</u> день с помощью кнопок ниже и нажмите <u>поделиться ссылкой</u>.

<i>Дни, помеченные значком «❌» являются недоступными.</i>`;

export const calendarMonthsMarkup = (
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
      )}.${oldestDate.getUTCFullYear()}::calendar_date`,
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
        { text: '◀️', callback_data: `${incMonth}::prev_calendar_month` },
        { text: '▶️', callback_data: `${incMonth}::next_calendar_month` },
      ],
      [
        {
          text: '🔗 Поделиться ссылкой',
          url: encodeURI(
            `https://t.me/share/url?url=${
              process.env.BOT_LINK
            }?start=cal-m-${getZero(
              oldestDate.getUTCMonth() + 1,
            )}_${oldestDate.getUTCFullYear()}-${userId}&text=Вот ссылка на календарь моей занятости`,
          ),
        },
      ],
      backInlineBtn,
    ],
  };
};
