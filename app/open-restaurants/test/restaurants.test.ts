import { DateTime } from 'luxon';

import { Restaurants } from '../restaurants';

const restaurantDataFile = './restaurant_data.json';

describe('Restaurants class', function () {
  let restaurants: Restaurants;

  beforeEach(() => {
    restaurants = new Restaurants(restaurantDataFile);
  });

  // Helper function that returns the restaurants open on a specific weekday
  // at a given time. Monday is weekday === 0, and Sunday is weekday === 6.
  const getRestaurantsOpenAt = ({ weekday, hour, minute = 0 }) => {
    return restaurants.getRestaurantsOpenAt(
      DateTime.local(2021, 5, 10 + weekday, hour, minute),
    );
  };

  it('reports no open restaurants at 5am on Sundays', () => {
    expect(getRestaurantsOpenAt({ weekday: 6, hour: 5 })).toEqual([]);
  });

  it('reports only the Kayasa Restaurant open on Monday at 8:30 am', () => {
    expect(getRestaurantsOpenAt({ weekday: 0, hour: 8, minute: 30 })).toEqual([
      'Kayasa Restaurant',
    ]);
  });

  it('reports that Kayasa Restaurant is not open just beefore 8:30 am', () => {
    expect(getRestaurantsOpenAt({ weekday: 0, hour: 7, minute: 29 })).toEqual(
      [],
    );
  });

  it('reports that Kayasa Restaurant and WBS closes on Sunday 9pm', () => {
    expect(
      getRestaurantsOpenAt({ weekday: 6, hour: 20, minute: 59 }).filter(
        (item) => item === "World's Best Steakhouse",
      ),
    ).toEqual(["World's Best Steakhouse"]);

    expect(
      getRestaurantsOpenAt({ weekday: 6, hour: 21, minute: 0 }).filter(
        (item) => item === "World's Best Steakhouse",
      ),
    ).toEqual([]);
  });

  // Heavy checking of World's Best Steakhouse due to times after 12am resulting
  // in funky behaviour where the overlap causes end time to be before start
  // time
  it('reports that WBS is open just before closing time 1am', () => {
    expect(getRestaurantsOpenAt({ weekday: 6, hour: 0, minute: 59 })).toEqual([
      "World's Best Steakhouse",
    ]);
  });

  it('reports that WBS is not open at or after Sunday 1am', () => {
    expect(getRestaurantsOpenAt({ weekday: 6, hour: 1 })).toEqual([]);
    expect(getRestaurantsOpenAt({ weekday: 6, hour: 1, minute: 1 })).toEqual(
      [],
    );
  });

  it('reports that WBS is open on Sunday 12am, +/- 1 minute', () => {
    expect(getRestaurantsOpenAt({ weekday: 6, hour: 0 })).toEqual([
      "World's Best Steakhouse",
    ]);
    expect(getRestaurantsOpenAt({ weekday: 5, hour: 23, minute: 59 })).toEqual([
      "World's Best Steakhouse",
    ]);
    expect(getRestaurantsOpenAt({ weekday: 6, hour: 0, minute: 1 })).toEqual([
      "World's Best Steakhouse",
    ]);
  });
});
