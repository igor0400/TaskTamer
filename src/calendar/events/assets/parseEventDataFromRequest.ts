import * as chrono from 'chrono-node';
import { getNowDateWithTZ } from 'src/libs/common';

export const parseEventDataFromRequest = (
  reqMess: string,
  timezone: string,
) => {
  let textWithoutCommand = reqMess.trim();

  const userTimezone = Number(timezone);

  // Парсинг даты и времени из сообщения
  let eventDate: Date;
  let startTime: Date;
  let endTime: Date;

  // Обработка специальных слов: сегодня, завтра, послезавтра
  textWithoutCommand = removeRelativeDates(textWithoutCommand, (date) => {
    eventDate = date;
  });

  // Обработка дней недели
  textWithoutCommand = removeWeekDays(textWithoutCommand, (date) => {
    eventDate = date;
  });

  // Обработка даты в формате "15.10"
  textWithoutCommand = extractDateWithoutYear(textWithoutCommand, (date) => {
    eventDate = date;
  });

  // Обработка диапазона времени
  textWithoutCommand = extractTimeRange(
    textWithoutCommand,
    (start, end) => {
      startTime = start;
      endTime = end;
    },
    eventDate,
  );

  // Обработка одиночного времени
  textWithoutCommand = extractSingleTime(
    textWithoutCommand,
    (time) => {
      startTime = time;
    },
    eventDate,
  );

  // Парсим дату с помощью chrono и удаляем из текста
  const parsedDate = chrono.ru.parse(textWithoutCommand);
  if (parsedDate && parsedDate.length > 0) {
    for (const result of parsedDate) {
      if (result.start.isCertain('day')) {
        eventDate = toUTCDate(result.start.date());
      }

      // Удаляем найденный текст даты из сообщения
      textWithoutCommand = textWithoutCommand.replace(result.text, '').trim();
    }
  }

  // Название события — оставшийся текст
  const eventTitle = textWithoutCommand.trim();

  // Если дата не установлена, используем текущую дату
  if (!eventDate) {
    eventDate = getCurrentUTCDate();
  }

  // Приводим время начала и окончания к правильной дате
  const adjustedTimes = adjustEventTimes({ eventDate, startTime, endTime });

  return {
    eventTitle,
    ...adjustedTimes,
  };

  // Функции для обработки

  function extractDateWithoutYear(text, setDate) {
    const dateRegex = /(\d{1,2})[.\/](\d{1,2})(?=\s|$)/;
    const match = dateRegex.exec(text);
    if (match) {
      const [fullMatch, day, month] = match;
      text = text.replace(fullMatch, '').trim();

      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10) - 1; // Месяцы в JavaScript от 0 до 11

      const now = getNowDateWithTZ({ timezone });
      let year = now.getFullYear();

      const dateCandidate = new Date(
        Date.UTC(year, monthNum, dayNum, 0, 0, 0, 0),
      );

      // Если дата уже прошла, берем следующий год
      if (dateCandidate < now) {
        year += 1;
        dateCandidate.setUTCFullYear(year);
      }

      setDate(dateCandidate);
    }
    return text;
  }

  function removeRelativeDates(text, setDate) {
    const today = getCurrentUTCDate();
    const regexes = [
      { regex: /\bсегодня\b/gi, date: today },
      { regex: /\bзавтра\b/gi, date: addUTCdays(today, 1) },
      { regex: /\bпослезавтра\b/gi, date: addUTCdays(today, 2) },
    ];

    regexes.forEach(({ regex, date }) => {
      if (regex.test(text)) {
        text = text.replace(regex, '').trim();
        setDate(date);
      }
    });

    return text;
  }

  function removeWeekDays(text, setDate) {
    const daysOfWeek = [
      { names: ['воскресенье', 'воскресенье'], index: 0 },
      { names: ['понедельник', 'понедельник'], index: 1 },
      { names: ['вторник', 'вторник'], index: 2 },
      { names: ['среда', 'среду'], index: 3 },
      { names: ['четверг', 'четверг'], index: 4 },
      { names: ['пятница', 'пятницу'], index: 5 },
      { names: ['суббота', 'субботу'], index: 6 },
    ];

    for (const day of daysOfWeek) {
      const namesPattern = day.names.join('|');
      const regex = new RegExp(
        `(?:^|\\s)(?:в\\s*)?(?:${namesPattern})(?=\\s|$)`,
        'i',
      );
      if (regex.test(text)) {
        text = text.replace(regex, '').trim();
        const today = getCurrentUTCDate();
        const todayDayIndex = today.getUTCDay();
        let daysToAdd = (day.index - todayDayIndex + 7) % 7;
        if (daysToAdd === 0) {
          daysToAdd = 7;
        }
        const eventDate = addUTCdays(today, daysToAdd);
        setDate(eventDate);
        break; // Предполагаем, что пользователь указывает только один день недели
      }
    }
    return text;
  }

  function extractTimeRange(text, setTimeRange, eventDate) {
    const timeRangeRegex =
      /(?:с\s*)?(\d{1,2})(?::(\d{2}))?\s*(?:час[аоыв]*)?\s*(утра|вечера|ночи)?(?:\s*(?:до|-|—)\s*(\d{1,2})(?::(\d{2}))?\s*(?:час[аоыв]*)?\s*(утра|вечера|ночи)?)/i;
    const match = timeRangeRegex.exec(text);
    if (match) {
      text = text.replace(match[0], '').trim();

      let [
        fullMatch,
        startHour,
        startMinute,
        startPeriod,
        endHour,
        endMinute,
        endPeriod,
      ] = match;

      startMinute = startMinute || '00';
      endMinute = endMinute || '00';

      // Преобразуем минуты в числа
      let startMinuteNum = parseInt(startMinute, 10);
      let endMinuteNum = parseInt(endMinute, 10);

      // Округляем минуты до ближайших 5 минут вверх
      startMinuteNum = roundMinutesUpToNearestFive(startMinuteNum);
      endMinuteNum = roundMinutesUpToNearestFive(endMinuteNum);

      // Если минуты >= 60, увеличиваем час на 1 и устанавливаем минуты в 0
      let startHourNum = parseInt(startHour, 10);
      let endHourNum = parseInt(endHour, 10);

      if (startMinuteNum >= 60) {
        startMinuteNum = 0;
        startHourNum += 1;
      }

      if (endMinuteNum >= 60) {
        endMinuteNum = 0;
        endHourNum += 1;
      }

      // Преобразование времени с учётом периодов
      startHourNum = adjustHourByPeriod(startHourNum, startPeriod);
      endHourNum = adjustHourByPeriod(endHourNum, endPeriod);

      const baseDate = eventDate || getCurrentUTCDate();

      const startTime = createDateInUTCFromUserTime(
        baseDate,
        startHourNum,
        startMinuteNum,
        userTimezone,
      );

      const endTime = createDateInUTCFromUserTime(
        baseDate,
        endHourNum,
        endMinuteNum,
        userTimezone,
      );

      setTimeRange(startTime, endTime);
    }
    return text;
  }

  function extractSingleTime(text, setTime, eventDate) {
    const atTimeRegex =
      /(?:^|\s)(?:в\s*)?(\d{1,2})(?::(\d{2}))?\s*(?:час[аоыв]*)?\s*(утра|вечера|ночи)?(?=\s|$)/i;
    const match = atTimeRegex.exec(text);
    if (match) {
      text = text.replace(match[0], '').trim();

      let [fullMatch, hour, minute, period] = match;
      minute = minute || '00';

      // Преобразуем минуты в число и округляем
      let minuteNum = parseInt(minute, 10);
      minuteNum = roundMinutesUpToNearestFive(minuteNum);

      // Если минуты >= 60, увеличиваем час на 1 и устанавливаем минуты в 0
      let hourNum = parseInt(hour, 10);
      if (minuteNum >= 60) {
        minuteNum = 0;
        hourNum += 1;
      }

      // Преобразование времени с учётом периодов
      hourNum = adjustHourByPeriod(hourNum, period);

      const baseDate = eventDate || getCurrentUTCDate();

      const time = createDateInUTCFromUserTime(
        baseDate,
        hourNum,
        minuteNum,
        userTimezone,
      );

      setTime(time);
    }
    return text;
  }

  function roundMinutesUpToNearestFive(minutes) {
    return minutes % 5 === 0 ? minutes : minutes + (5 - (minutes % 5));
  }

  function adjustHourByPeriod(hour, period) {
    if (!period) return hour; // Если период не указан, оставляем как есть
    if (period.toLowerCase().includes('вечера') && hour < 12) {
      return hour + 12; // Преобразуем PM-время
    }
    if (period.toLowerCase().includes('ночи')) {
      return hour < 6 ? hour : hour + 12; // Ночь может быть до 6 утра
    }
    return hour; // Для "утра" ничего не меняем
  }

  function createDateInUTCFromUserTime(
    baseDate,
    hours,
    minutes,
    userTimezoneOffset,
  ) {
    // Корректируем часы, вычитая смещение часового пояса пользователя
    let utcHours = hours - userTimezoneOffset;

    const date = new Date(
      Date.UTC(
        baseDate.getUTCFullYear(),
        baseDate.getUTCMonth(),
        baseDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    if (utcHours < 0) {
      date.setUTCDate(date.getUTCDate() - 1);
      utcHours += 24;
    } else if (utcHours >= 24) {
      date.setUTCDate(date.getUTCDate() + 1);
      utcHours -= 24;
    }

    date.setUTCHours(utcHours, minutes, 0, 0);

    return date;
  }

  function getCurrentUTCDate() {
    const now = new Date();
    // Смещение часового пояса пользователя в миллисекундах
    const userOffsetInMs = userTimezone * 60 * 60 * 1000;
    // Текущее время в часовом поясе пользователя
    const userNow = new Date(now.getTime() + userOffsetInMs);

    // Возвращаем дату в UTC с учетом даты пользователя
    return new Date(
      Date.UTC(
        userNow.getUTCFullYear(),
        userNow.getUTCMonth(),
        userNow.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
  }

  function addUTCdays(date, days) {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  function toUTCDate(date) {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
  }

  function adjustEventTimes({ eventDate, startTime, endTime }) {
    if (!eventDate || !startTime) return {};

    // Приводим startTime к дате события
    const adjustedStartTime = new Date(
      Date.UTC(
        eventDate.getUTCFullYear(),
        eventDate.getUTCMonth(),
        eventDate.getUTCDate(),
        startTime.getUTCHours(),
        startTime.getUTCMinutes(),
        0,
        0,
      ),
    );

    let adjustedEndTime;

    if (endTime) {
      // Приводим endTime к дате события
      adjustedEndTime = new Date(
        Date.UTC(
          eventDate.getUTCFullYear(),
          eventDate.getUTCMonth(),
          eventDate.getUTCDate(),
          endTime.getUTCHours(),
          endTime.getUTCMinutes(),
          0,
          0,
        ),
      );

      // Если время окончания меньше или равно времени начала, или переходит на следующий день
      if (
        adjustedEndTime <= adjustedStartTime ||
        adjustedEndTime.getUTCDate() !== adjustedStartTime.getUTCDate()
      ) {
        adjustedEndTime = getUserTimezoneAdjustedEndOfDay(
          eventDate,
          userTimezone,
        );
      }

      // Если время окончания позже 23:55 в часовом поясе пользователя, устанавливаем его на 23:55 в часовом поясе пользователя
      const endOfDay = getUserTimezoneAdjustedEndOfDay(eventDate, userTimezone);

      if (adjustedEndTime > endOfDay) {
        adjustedEndTime = endOfDay;
      }
    } else {
      // Если время окончания не задано, устанавливаем его на час позже времени начала, но не позже 23:55 в часовом поясе пользователя
      adjustedEndTime = new Date(adjustedStartTime.getTime() + 60 * 60 * 1000);
      const endOfDay = getUserTimezoneAdjustedEndOfDay(eventDate, userTimezone);

      if (adjustedEndTime > endOfDay) {
        adjustedEndTime = endOfDay;
      }
    }

    return { startTime: adjustedStartTime, endTime: adjustedEndTime };
  }

  function getUserTimezoneAdjustedEndOfDay(eventDate, userTimezone) {
    // 23:55 в часовом поясе пользователя
    const userEndHours = 23;
    const userEndMinutes = 55;

    // Конвертируем локальное время пользователя в UTC
    let utcHours = userEndHours - userTimezone;
    let date = new Date(
      Date.UTC(
        eventDate.getUTCFullYear(),
        eventDate.getUTCMonth(),
        eventDate.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );

    // Корректируем дату, если utcHours выходит за пределы 0-23
    if (utcHours < 0) {
      utcHours += 24;
      date.setUTCDate(date.getUTCDate() - 1);
    } else if (utcHours >= 24) {
      utcHours -= 24;
      date.setUTCDate(date.getUTCDate() + 1);
    }

    date.setUTCHours(utcHours, userEndMinutes, 0, 0);

    return date;
  }
};
