import fs, { PathOrFileDescriptor } from "fs";
import {
  DAY_MAP,
  DAY_IN_SECONDS,
  WEEK_IN_SECONDS,
  MINUTE_IN_SECONDS,
} from "../constants/datetime";

import { convert12HourTimeToSeconds } from "./utils/time";

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

export class Schedule {
  /**
   * Holds the normalised schedule for each restaurant
   *
   * @type {IntervalList}
   */
  protected intervalList: IntervalList;

  /**
   * Constructor - This sets up the data json data required for processing
   * restaurant opening times, followed by converting the time into
   *
   * @param jsonFileName
   */
  public constructor(jsonFileName: PathOrFileDescriptor) {
    this.intervalList = this.getFormattedSchedule(
      JSON.parse(fs.readFileSync(jsonFileName).toString())
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
   * Sets up the schedule for all restaurants with the raw time data converted
   * to a range of times
   *
   * @param {RestaurantScheduleData} rawData
   * @return {IntervalList}
   */
  protected getFormattedSchedule(rawData: RestaurantScheduleData) {
    return rawData.restaurants.map((item) => {
      const { name, opening_hours } = item;
      const intervals = this.getFormattedIntervals(opening_hours);

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
   * @param rawOpeningHours
   * @return {Array<Interval>}
   */
  protected getFormattedIntervals(rawOpeningHours: string) {
    const rawIntervals = rawOpeningHours.split("; ");

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

      // Generate intervals for days between start and end day inclusive
      for (let i = startDayIndex; i <= endDayIndex; i++) {
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
    });

    return intervals;
  }
}
