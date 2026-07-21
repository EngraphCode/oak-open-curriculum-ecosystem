const ISO_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,3})?(Z|[+-](\d{2}):(\d{2}))$/u;

/**
 * Require a complete, calendar-valid ISO date-time string — `Date.parse`
 * alone is permissive (non-ISO forms, normalised invalid dates) and would
 * let a mistyped timestamp read as a different valid instant. Shared by the
 * commit queue and `pr-throughput` (`consolidate-at-second-consumer`).
 */
export function requireIsoDateTime(value: string, fieldName: string): string {
  if (!hasValidIsoDateTimeShape(value) || !Number.isFinite(Date.parse(value))) {
    throw new Error(`invalid ISO date-time for ${fieldName}: ${value}`);
  }

  return value;
}

function hasValidIsoDateTimeShape(value: string): boolean {
  const match = ISO_DATE_TIME_PATTERN.exec(value);
  if (match === null) {
    return false;
  }

  const year = numberCapture(match, 1);
  const month = numberCapture(match, 2);
  const day = numberCapture(match, 3);
  const hour = numberCapture(match, 4);
  const minute = numberCapture(match, 5);
  const second = numberCapture(match, 6);
  const offsetHour = match[8] === undefined ? 0 : numberCapture(match, 8);
  const offsetMinute = match[9] === undefined ? 0 : numberCapture(match, 9);

  return (
    isValidCalendarDate({ year, month, day }) &&
    isValidClockTime({ hour, minute, second }) &&
    isValidOffset({ offsetHour, offsetMinute })
  );
}

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

function isValidCalendarDate(input: {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}): boolean {
  if (input.month < 1 || input.month > 12 || input.day < 1) {
    return false;
  }

  // Pure arithmetic, never Date.UTC: that constructor remaps years 0-99 to
  // 1900-1999, which would reject valid proleptic-Gregorian dates such as
  // the leap date 0000-02-29.
  const monthLength =
    input.month === 2 && isLeapYear(input.year) ? 29 : (MONTH_LENGTHS[input.month - 1] ?? 0);

  return input.day <= monthLength;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function isValidClockTime(input: {
  readonly hour: number;
  readonly minute: number;
  readonly second: number;
}): boolean {
  return input.hour <= 23 && input.minute <= 59 && input.second <= 59;
}

function isValidOffset(input: {
  readonly offsetHour: number;
  readonly offsetMinute: number;
}): boolean {
  return input.offsetHour <= 23 && input.offsetMinute <= 59;
}

function numberCapture(match: RegExpExecArray, index: number): number {
  return Number(match[index] ?? Number.NaN);
}
