import * as chrono from 'chrono-node';

export const parseEventDataFromRequest = (
  reqMess: string,
  timezone: string,
) => {
  let textWithoutCommand = reqMess;

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

  function extractDateWithoutYear(text, setDate) {
    const dateRegex = /(\d{1,2})[.\/](\d{1,2})(?=\s|$)/;
    const match = dateRegex.exec(text);
    if (match) {
      const [fullMatch, day, month] = match;
      text = text.replace(fullMatch, '').trim();

      const dayNum = parseInt(day, 10);
      const monthNum = parseInt(month, 10) - 1; // Месяцы в JavaScript от 0 до 11

      const now = new Date();
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
      /(?:с\s*)?(\d{1,2})(?::(\d{2}))?(?:\s*(?:до|-|—)\s*(\d{1,2})(?::(\d{2}))?)/i;
    const match = text.match(timeRangeRegex);
    if (match) {
      // Удаляем найденный текст из сообщения
      text = text.replace(match[0], '').trim();

      let [fullMatch, startHour, startMinute, endHour, endMinute] = match;
      startMinute = startMinute || '00';
      endMinute = endMinute || '00';

      const baseDate = eventDate || getCurrentUTCDate();

      // Parse hours and minutes as numbers
      const startHourNum = parseInt(startHour, 10);
      const startMinuteNum = parseInt(startMinute, 10);
      const endHourNum = parseInt(endHour, 10);
      const endMinuteNum = parseInt(endMinute, 10);

      // Adjust hours for user timezone
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
    // Регулярное выражение для поиска времени без обязательного "в"
    const atTimeRegex = /(?:^|\s)(?:в\s*)?(\d{1,2})(?::(\d{2}))?(?=\s|$)/i;
    const match = atTimeRegex.exec(text);
    if (match) {
      // Удаляем найденный текст из сообщения
      text = text.replace(match[0], '').trim();

      let [fullMatch, hour, minute] = match;
      minute = minute || '00';

      const baseDate = eventDate || getCurrentUTCDate();

      // Преобразуем часы и минуты в числа
      const hourNum = parseInt(hour, 10);
      const minuteNum = parseInt(minute, 10);

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

  function createDateInUTCFromUserTime(
    baseDate,
    hours,
    minutes,
    userTimezoneOffset,
  ) {
    // Корректируем часы, вычитая смещение часового пояса пользователя
    const utcHours = hours - userTimezoneOffset;

    // Создаем новую дату в UTC
    const dateTime = new Date(
      Date.UTC(
        baseDate.getUTCFullYear(),
        baseDate.getUTCMonth(),
        baseDate.getUTCDate(),
        utcHours,
        minutes,
        0,
        0,
      ),
    );

    return dateTime;
  }

  function getCurrentUTCDate() {
    const now = new Date();
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
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

  function adjustEventTimes(event) {
    const { eventDate, startTime, endTime } = event;

    if (!eventDate || !startTime) return {};

    // Создаем новый startTime с датой из eventDate и временем из startTime
    const adjustedStartTime = new Date(
      Date.UTC(
        eventDate.getUTCFullYear(),
        eventDate.getUTCMonth(),
        eventDate.getUTCDate(),
        startTime.getUTCHours(),
        startTime.getUTCMinutes(),
        startTime.getUTCSeconds(),
        startTime.getUTCMilliseconds(),
      ),
    );

    let adjustedEndTime: Date;

    if (endTime) {
      // Создаем новый endTime с датой из eventDate и временем из endTime
      adjustedEndTime = new Date(
        Date.UTC(
          eventDate.getUTCFullYear(),
          eventDate.getUTCMonth(),
          eventDate.getUTCDate(),
          endTime.getUTCHours(),
          endTime.getUTCMinutes(),
          endTime.getUTCSeconds(),
          endTime.getUTCMilliseconds(),
        ),
      );
    } else {
      // Если endTime не задан, устанавливаем его на час позже adjustedStartTime
      adjustedEndTime = new Date(
        adjustedStartTime.getTime() + 1 * 60 * 60 * 1000,
      );
    }

    return {
      startTime: adjustedStartTime,
      endTime: adjustedEndTime,
    };
  }

  return {
    eventTitle,
    ...adjustEventTimes({ eventDate, startTime, endTime }),
  };
};
