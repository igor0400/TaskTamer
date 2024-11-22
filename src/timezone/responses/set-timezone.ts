import { backBarInlineBtns } from 'src/general';
import { getZero } from 'src/libs/common';

export const setTimezoneMessage = () =>
  `🕑 <b>Выберите сколько у вас сейчас времени:</b>

<i>Так мы сможем определить, в каком часовом поясе вы сейчас находитесь</i>`;

export const setTimezoneMarkup = (initTime: string) => {
  const date = new Date();

  let hours = date.getUTCHours();

  let ETval = 0;
  let ETtype: string;

  try {
    if (initTime) {
      ETtype = initTime.slice(0, 1);
      ETval = Number(initTime.slice(1));

      if (ETtype === '+') {
        hours += ETval;
      } else {
        hours -= ETval;
      }
    }
  } catch (e) {
    console.error('Error setTimezoneMarkup:', e);
  }

  if (hours > 23 || hours < 0) {
    hours = (hours + 24) % 24;
  }

  if (ETval < 0) {
    ETval = Math.ceil(ETval);
    ETtype = '-';
  }

  const strHrs = String(getZero(hours));

  const minutes = date.getUTCMinutes();
  const strMins = String(getZero(minutes));

  const decBtnType = ETval === 0 ? '-' : ETtype ? ETtype : '-';
  const decBtnValue = ETtype === '-' ? ETval + 1 : Math.abs(ETval - 1);

  const incBtnType = ETval === 0 ? '+' : ETtype ? ETtype : '+';
  const incBtnValue = ETtype === '+' ? ETval + 1 : Math.abs(ETval - 1);

  return {
    inline_keyboard: [
      [{ text: 'Установить МСК', callback_data: `+3::save_timezone` }],
      [
        { text: strHrs[0], callback_data: 'some' },
        { text: strHrs[1], callback_data: 'some' },
        { text: ':', callback_data: 'some' },
        { text: strMins[0], callback_data: 'some' },
        { text: strMins[1], callback_data: 'some' },
      ],
      [
        {
          text: '🔽',
          callback_data: `${decBtnType}${decBtnValue}::change_set_tz_hours`,
        },
        {
          text: '🔼',
          callback_data: `${incBtnType}${incBtnValue}::change_set_tz_hours`,
        },
      ],
      [{ text: '✅ Сохранить', callback_data: `${initTime}::save_timezone` }],
      ...backBarInlineBtns('back_to_profile'),
    ],
  };
};
