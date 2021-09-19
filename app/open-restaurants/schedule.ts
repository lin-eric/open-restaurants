import fs, { PathOrFileDescriptor } from 'fs';
import { convert12HourTimeToSeconds } from '../utils/time';

import {
  DAY_MAP,
  DAY_IN_SECONDS,
  MINUTE_IN_SECONDS,
  WEEK_IN_SECONDS,
} from '../constants/datetime';

/**
 * Format for a single interval for a restaurant, where start and end is
 * time in seconds
 */
export type Interval = {
  start: number;
  end: number;
};

/**
 * Formatted interval list format to be consumed
 */
type IntervalList = {
  name: string;
  intervals: Interval[];
}[];

/**
 * Raw JSON format for a single restaurant entry
 */
type RestaurantScheduleEntry = {
  name: string;
  opening_hours: string;
};

/**
 * Raw JSON format for the restaurant data
 */
type RestaurantScheduleData = {
  restaurants: RestaurantScheduleEntry[];
};

/**
 * This class takes the name of a JSON file containing restaurants and their
 * opening times, parses it, and normalises the times into start and end
 * intervals in seconds.
 *
 * All times are assumed to be in the same timezone. The JSON data is also
 * assumed to be in a consistent and valid format.
 */
export class Schedule {
  /**
   * Holds the normalised schedule for each restaurant
   *
   * @type {IntervalList}
   */
  protected intervalList: IntervalList;

  /**
   * Constructor - This sets up the data json data required for processing
   * restaurant opening times, followed by converting those times into
   * start and end seconds in a week.
   *
   * @param jsonFileName
   */
  public constructor(jsonFileName: PathOrFileDescriptor) {
    this.intervalList = this.getFormattedSchedule(
      JSON.parse(fs.readFileSync(jsonFileName).toString()),
    );
  }

  /**
   * Getter for this interval list
   *
   * @returns {IntervalList}
   */
  public getIntervalList() {
    return this.intervalList;
  }

  /**
   * Sets up the schedule for all restaurants with the raw time data normalised
   * to time in seconds.
   *
   * @param {RestaurantScheduleData} rawData - Raw JSON data loaded in
   * @return {IntervalList} - List of intervals for all restaurants
   */
  protected getFormattedSchedule(
    rawData: RestaurantScheduleData,
  ): IntervalList {
    return rawData.restaurants.map((item) => {
      const { name, opening_hours } = item;
      const intervals = this.getNormalisedIntervals(opening_hours);

      return {
        name,
        intervals,
      };
    });
  }

  /**
   * This method converts the opening hours string from the raw JSON data into
   * a list of intervals with each start and end time in seconds.
   *
   * @param rawOpeningHours - Opening hours string in the raw JSON input
   * @return {Array<Interval>} - Array of intervals converted from the string
   */
  protected getNormalisedIntervals(rawOpeningHours: string): Interval[] {
    const rawIntervals = rawOpeningHours.split('; ');

    const intervals = [];
    rawIntervals.forEach((item) => {
      // This regex matches days in three letter short form.
      const daysRegEx = /(mon|tue|wed|thu|fri|sat|sun)/g;
      const days = item.toLowerCase().match(daysRegEx);

      // This regex matches times in the format: 'hh:ss aaa', 'h:ss aaa' and
      // 'h aaa'
      const timeRegEx = /\b((1[0-2]|0?[1-9])(?::[0-5][0-9])? ([ap][m]))/g;
      const times = item.match(timeRegEx);

      const timeInSeconds = times.map((time) => {
        return convert12HourTimeToSeconds(time);
      });
      const startTime = timeInSeconds[0];
      const endTime = timeInSeconds[1];

      const startDay = days[0];
      const endDay = days[1] ?? days[0];

      // Get the 0-based index of the start and end day so we know which
      // additional intervals to generate between them.
      const startDayIndex = DAY_MAP[startDay];
      const endDayIndex = DAY_MAP[endDay];

      this.createIntervals(
        startDayIndex,
        endDayIndex,
        startTime,
        endTime,
      ).forEach((interval) => {
        intervals.push(interval);
      });
    });

    return intervals;
  }

  /**
   * Gets the intervals between two 0-indexed days in a week and generates
   * intervals between them (inclusive) based on the input start and end time in
   * seconds.
   *
   * @param {number} startDay - Index for start interval day in the week (0 - 6)
   * @param {number} endDay - Index for end interval day in the week (0 - 6)
   * @param {number} startTime - Start time in seconds
   * @param {number} endTime - End time in seconds
   *
   * @returns {Array<Interval>}
   */
  protected createIntervals(
    startDay: number,
    endDay: number,
    startTime: number,
    endTime: number,
  ): Interval[] {
    const intervals = [];
    // Generate intervals for days between start and end day inclusive
    for (let i = startDay; i <= endDay; i++) {
      const dayOffset = i * DAY_IN_SECONDS;

      const startInterval = startTime + dayOffset;
      let endInterval = endTime + dayOffset;

      if (endInterval - MINUTE_IN_SECONDS < startInterval) {
        // If end time is before start time, this means that this interval
        // flows over past this day over to the next.
        endInterval += DAY_IN_SECONDS;
      }

      // If there is an overlap between Sunday and Monday, we need to detach
      // the overlap period to be a part of the Monday range instead.
      if (endInterval > WEEK_IN_SECONDS) {
        // Monday interval
        intervals.push({
          start: 0,
          end: endInterval - WEEK_IN_SECONDS,
        });

        // Set the end Interval time for Sunday to 11:59:59 pm
        endInterval = WEEK_IN_SECONDS - 1;
      }

      intervals.push({
        start: startInterval,
        end: endInterval,
      });
    }

    return intervals;
  }
}
