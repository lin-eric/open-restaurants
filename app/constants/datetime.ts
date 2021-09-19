/*
 * 0-based index for each short-hand day of the week
 */
export const DAY_MAP = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
};

/**
 * Time conversions into seconds
 */
export const MINUTE_IN_SECONDS = 60;
export const HOUR_IN_SECONDS = MINUTE_IN_SECONDS * 60;
export const DAY_IN_SECONDS = HOUR_IN_SECONDS * 24;
export const WEEK_IN_SECONDS = DAY_IN_SECONDS * 7;
export const PM_OFFSET_SECONDS = HOUR_IN_SECONDS * 12;

/**
 *  Meridiem format used by this application
 */
export const PM = "pm";
export const AM = "am";
