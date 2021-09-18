import { readFileSync } from "fs";
import luxon from "luxon";
import { Schedule } from "./schedule";

/**
 * This class takes the name of a JSON file containing details on opening hours
 * for a number of restaurants. It parses the contents of this file and then
 * provides a method for querying which restaurants are open at a specified date
 * and time. The input JSON file can be assumed to contain correctly formatted
 * data.
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
  constructor(jsonFilename) {
    const jsonData = JSON.parse(readFileSync(jsonFilename).toString());

    // TODO
  }

  /**
   * Finds the restaurants open at the specified time.
   *
   * @param {luxon.DateTime} time
   * @returns {Array<string>} The names of the restaurants open at the specified
   * time. The order of the elements in this array is alphabetical.
   */
  getRestaurantsOpenAt(time) {
    // TODO

    return [];
  }
}
