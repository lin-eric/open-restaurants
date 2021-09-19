import { PathOrFileDescriptor } from 'fs';
import { DateTime } from 'luxon';
import {
  DAY_IN_SECONDS,
  HOUR_IN_SECONDS,
  MINUTE_IN_SECONDS,
} from '../constants/datetime';
import { Schedule } from './schedule';

/**
 * This class takes the name of a JSON file containing details on opening hours
 * for a number of restaurants, which passes this to an instance of Schedule
 * to create a list of restaurants with normalised start and end times (in
 * seconds) for each day of the week
 *
 * All dates and times can be assumed to be in the same time zone.
 */
export class Restaurants {
  /**
   * Schedules for this set of restaurants
   *
   * @type {Schedule}
   */
  schedule: Schedule;

  /**
   * Constructor - This sets up the data json data required for processing
   * restaurant opening times.
   *
   * @param {string} jsonFilename
   */
  public constructor(jsonFilename: PathOrFileDescriptor) {
    this.schedule = new Schedule(jsonFilename);
  }

  /**
   * Finds the restaurants open at the specified time.
   *
   * @param {DateTime} time - DateTime input
   * @returns {Array<string>} The names of the restaurants open at the specified
   * time. The order of the elements in this array is alphabetical.
   */
  public getRestaurantsOpenAt(input: DateTime) {
    const seconds = this.getInputAsSeconds(input);

    return this.getIntersections(seconds);
  }

  /**
   * Get the input in seconds. Please note that this application is 0-based
   * for the weekdays (Monday = 0, Sunday = 6), whereas Luxon's DateTime is
   * 1-based
   *
   * @param {DateTime} input - DateTime to convert
   * @returns {number} - Input as seconds
   */
  protected getInputAsSeconds(input: DateTime) {
    const { weekday, hour, minute } = input;

    return (
      (weekday - 1) * DAY_IN_SECONDS +
      hour * HOUR_IN_SECONDS +
      minute * MINUTE_IN_SECONDS
    );
  }

  /**
   * Gets the name of restaurants that have an opening interval that has a range
   * that overlaps the input time.
   *
   * @param {number} input - time in seconds
   * @returns {Array<string>} - list of restaurants that overlap the input time
   */
  protected getIntersections(input: number) {
    const restaurants = [];
    this.schedule.getIntervalList().forEach((item) => {
      const isOpen =
        item.intervals.filter((interval) => {
          return input >= interval.start && input < interval.end;
        }).length > 0;

      if (isOpen) {
        restaurants.push(item.name);
      }
    });

    return restaurants;
  }
}
