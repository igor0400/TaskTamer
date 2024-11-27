export function parseDateOrMonthFromText(text, timezone) {
  const userTimezone = Number(timezone);

  // Корректируем текущую дату по часовому поясу пользователя
  const now = new Date();
  const userOffsetInMs = userTimezone * 60 * 60 * 1000;
  const userNow = new Date(now.getTime() + userOffsetInMs);

  // Переменные для хранения результатов
  let specificDate = null;
  let monthOffset = null;

  // 1. Поиск конкретных дат в формате "5 января", "5 января 2025"
  const specificDateResult = findSpecificDate(text, userNow);
  if (specificDateResult) {
    specificDate = specificDateResult;
    return { date: formatDate(specificDate) };
  }

  // 2. Поиск месяцев с годом или без
  const monthResult = findMonth(text, userNow);
  if (monthResult !== null) {
    monthOffset = monthResult;
    return { monthOffset: monthOffset };
  }

  // 3. Поиск относительных дат (сегодня, завтра и т.д.)
  const dateResult = findRelativeDate(text, userNow);
  if (dateResult) {
    specificDate = dateResult;
    return { date: formatDate(specificDate) };
  }

  // 4. Поиск дней недели
  const weekdayResult = findWeekday(text, userNow);
  if (weekdayResult) {
    specificDate = weekdayResult;
    return { date: formatDate(specificDate) };
  }

  // Если ничего не найдено, возвращаем пустой объект
  return {};
}

// Функция для поиска конкретной даты
function findSpecificDate(text, userNow) {
  // Обработка форматов: "5 января", "5 января 2025"
  const dateRegex =
    /(\d{1,2})\s*(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s*(\d{4}))?/i;
  const match = dateRegex.exec(text);
  if (match) {
    const [fullMatch, day, year] = match;
    const monthNames = [
      'января',
      'февраля',
      'марта',
      'апреля',
      'мая',
      'июня',
      'июля',
      'августа',
      'сентября',
      'октября',
      'ноября',
      'декабря',
    ];
    const monthRegex = new RegExp(monthNames.join('|'), 'i');
    const monthMatch = monthRegex.exec(fullMatch);
    const monthName = monthMatch[0].toLowerCase();
    const monthIndex = monthNames.indexOf(monthName);

    const dayNum = parseInt(day, 10);
    let yearNum = year ? parseInt(year, 10) : userNow.getFullYear();

    const dateCandidate = new Date(yearNum, monthIndex, dayNum);

    // Если год не указан и дата уже прошла, берем следующий год
    if (!year && dateCandidate < userNow) {
      dateCandidate.setFullYear(yearNum + 1);
    }

    return dateCandidate;
  }

  // Обработка форматов: "15.01", "15.01.2025"
  const dateRegexNumeric = /(\d{1,2})[.\-\/](\d{1,2})(?:[.\-\/](\d{4}))?/;
  const numericMatch = dateRegexNumeric.exec(text);
  if (numericMatch) {
    const [fullMatch, day, month, year] = numericMatch;
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10) - 1; // Месяцы в JavaScript от 0 до 11
    let yearNum = year ? parseInt(year, 10) : userNow.getFullYear();

    const dateCandidate = new Date(yearNum, monthNum, dayNum);

    // Если год не указан и дата уже прошла, берем следующий год
    if (!year && dateCandidate < userNow) {
      dateCandidate.setFullYear(yearNum + 1);
    }

    return dateCandidate;
  }

  return null;
}

function findMonth(text, userNow) {
  // Обработка форматов: "январь", "январь 2025"
  const monthRegex =
    /(январ[ья]?|феврал[ья]?|март[а]?|апрел[ья]?|ма[йя]?|июн[ья]?|июл[ья]?|август[а]?|сентябр[ья]?|октябр[ья]?|ноябр[ья]?|декабр[ья]?)(?:\s*(\d{4}))?/i;
  const match = monthRegex.exec(text);
  if (match) {
    const [fullMatch, monthName, year] = match;
    const monthNames = [
      'январь',
      'февраль',
      'март',
      'апрель',
      'май',
      'июнь',
      'июль',
      'август',
      'сентябрь',
      'октябрь',
      'ноябрь',
      'декабрь',
    ];
    const baseMonthName = monthName
      .toLowerCase()
      .replace(/я$/, '')
      .replace(/ь$/, '');

    // Преобразование названия месяца в индекс
    let monthIndex = monthNames.findIndex((m) => m.startsWith(baseMonthName));
    if (monthIndex === -1) return null;

    let targetYear = year ? parseInt(year, 10) : userNow.getUTCFullYear();

    // Вычисляем смещение месяцев с учётом года
    const currentYear = userNow.getUTCFullYear();
    const currentMonth = userNow.getUTCMonth(); // 0-11

    // Если год не указан и месяц уже прошёл, переходим на следующий год
    if (!year && monthIndex < currentMonth) {
      targetYear += 1;
    }

    const totalMonthsCurrent = currentYear * 12 + currentMonth;
    const totalMonthsTarget = targetYear * 12 + monthIndex;

    let monthOffset = totalMonthsTarget - totalMonthsCurrent;

    return monthOffset;
  }
  return null;
}

// Функция для поиска относительных дат
function findRelativeDate(text, userNow) {
  const relativeDates = [
    { regex: /\bсегодня\b/i, offsetDays: 0 },
    { regex: /\bзавтра\b/i, offsetDays: 1 },
    { regex: /\bпослезавтра\b/i, offsetDays: 2 },
    { regex: /\bвчера\b/i, offsetDays: -1 },
    { regex: /\bпозавчера\b/i, offsetDays: -2 },
  ];

  for (const { regex, offsetDays } of relativeDates) {
    if (regex.test(text)) {
      const date = new Date(userNow);
      date.setDate(date.getDate() + offsetDays);
      return date;
    }
  }
  return null;
}

// Функция для поиска дней недели
function findWeekday(text, userNow) {
  const daysOfWeek = [
    { names: ['воскресенье'], index: 0 },
    { names: ['понедельник'], index: 1 },
    { names: ['вторник'], index: 2 },
    { names: ['среда'], index: 3 },
    { names: ['четверг'], index: 4 },
    { names: ['пятница'], index: 5 },
    { names: ['суббота'], index: 6 },
  ];

  for (const day of daysOfWeek) {
    const namesPattern = day.names.join('|');
    const regex = new RegExp(`\\b(?:в\\s*)?(?:${namesPattern})\\b`, 'i');
    if (regex.test(text)) {
      const todayDayIndex = userNow.getDay(); // 0 (воскресенье) до 6 (суббота)
      let daysToAdd = (day.index - todayDayIndex + 7) % 7;
      if (daysToAdd === 0) {
        daysToAdd = 7; // Возвращаем следующий указанный день недели
      }
      const date = new Date(userNow);
      date.setDate(userNow.getDate() + daysToAdd);
      return date;
    }
  }
  return null;
}

// Функция для форматирования даты
function formatDate(date) {
  const day = ('0' + date.getDate()).slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
