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

  if (hours > 23) {
    hours = 0;
    ETval = date.getUTCHours();
    ETtype = '-';
  }

  if (hours < 0) {
    hours = 23;
    ETval = 23 - date.getUTCHours();
    ETtype = '+';
  }

  const strHrs = String(getZero(hours));

  const minutes = date.getUTCMinutes();
  const strMins = String(getZero(minutes));

  return {
    inline_keyboard: [
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
          callback_data: `${ETtype ? ETtype : '-'}${
            ETtype === '-' ? ETval + 1 : ETval - 1
          }::change_set_tz_hours`,
        },
        {
          text: '🔼',
          callback_data: `${ETtype ? ETtype : '+'}${
            ETtype === '+' ? ETval + 1 : ETval - 1
          }::change_set_tz_hours`,
        },
      ],
      [{ text: '✅ Сохранить', callback_data: `${initTime}::save_timezone` }],
      ...backBarInlineBtns('back_to_profile'),
    ],
  };
};
