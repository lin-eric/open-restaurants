import fs, { PathOrFileDescriptor } from "fs";

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
    /**
     * TODO:
     * - split opening hours string into sections (split by ;)
     * - further split the section into:
     * 	  - days
     * 		- times
     * - Create a new interval between each start and end day to fill the gaps
     *	between start day and end day
     * - Fill each interval with start and end in seconds
     */
    return [];
  }
}
