export const WeekdayFullnames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const WeekdayShortnames = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
] as const;

/**
 *
 * @param day day of week, 0 = Sunday and 6 = Saturday
 * @param type whether to return shortnames, fullnames, or number representations
 * @returns List of the proceeding days of the week
 */
export function pastWeekdays(
  day: number,
  type: 'shortname' | 'fullname' | 'number' = 'shortname',
) {
  let allWeekdays: readonly string[] | number[];

  switch (type) {
    case 'fullname':
      allWeekdays = WeekdayFullnames;
      break;
    case 'shortname':
      allWeekdays = WeekdayShortnames;
      break;
    case 'number':
      allWeekdays = [...Array(7).keys()];
      break;
  }

  const weekdays = [];

  for (let i = 1; i <= 7; i++) {
    const index = (day - i + 7) % 7;
    weekdays.unshift(allWeekdays[index]);
  }

  return weekdays;
}

export const AllMonthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 *
 * @param month Ordinal month of year
 * @returns List of short names of the proceeding 7 months
 */
export function pastMonths(month: number) {
  const monthNames = [];

  for (let i = 1; i <= 7; i++) {
    const index = (month - i + 12) % 12;
    monthNames.unshift(AllMonthNames[index]);
  }

  return monthNames.slice(-7);
}
