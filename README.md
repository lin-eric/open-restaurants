# open-restaurants

## Description

This exercise is for reading a JSON file that contains data about restaurant opening times, and creating a method for obtaining the list of all restaurants that are open at a certain point in time of the week.

This exercise makes the following assumptions:

- Date and times are in the same time zone
- All of the data in `restaurant_data.json` are valid and correct

## Setup

To start and test this application, simply run the following commands in a terminal:

```
git clone https://github.com/lin-eric/open-restaurants.git
cd open-restaurants/
npm install
npm run test
```

# Details

## Solution

This solution follows the following steps:

### Data Processing

- Read the raw JSON data
- Convert the opening times data into a format that can be easily used to run comparisons on. In this case, I used seconds since the start of Monday, 12:00 am.
- Between each opening day, create an interval between, and including those days.
- Within each interval, narrow that down to the start end and end times.
- Store these intervals against each restaurant.

### Input

- The user specifies an input time
- The time specified is converted into seconds to match the intervals set in the data processing step
- The application goes through each restaurant and each opening time and compares whether or not the specified time is between the start and end time of each interval.

The two parts have been separated into two main classes:

- `Restaurants.ts` - acts as the entry point to the application. This handles the user input to identify the intersections with each interval.
- `Schedule.ts` - handles the processing of the raw JSON data into a consumable format.

### Analysis

This solution was chosen due to the ease of implementation where we simply need to go through each restaurant in the list and identify whether or not each opening time has an intersection with the input time. It also has the added benefit of being easy to consume due to the structure of the data being grouped by intervals for each restaurant so it can be easily re-used for another feature such as finding the opening times for one specific restaurant.
However, this solution scales poorly, as the time it takes to go through the list scales linearly with the number of opening times.

There are a number of changes that could be done to improve the processing time for this application. For the application as it is now, it could be changed to return early as soon as any matching interval is found for the restaurant as we don't need to know which interval it is, only that there is one that exists. The problem with this solution is that it does an inefficient full scan of all intervals for.

### Alternative Solution

One potential approach for larger data sets could be to update the data structure from:

```
{
  name: string;
  intervals: {
    start: number;
    end: number;
  }[]
}[]
```

to

```
{
  name: string;
  start: number,
  end: number
}[]
```
Instead of grouping each interval with each restaurant, the intervals would be flattened to have a long list of all available intervals. This could then be used to create two sorted lists based around the average of all intervals (Here, I am making the assumption that the middle point is 12:00 pm):.
* one set of intervals where the opening times is sorted by start time ascending up until 11:59 am where the rest of the intervals with a start time after 11:59am are removed from the list
* one where the closing times is sorted by end time descending down to 12:00 pm where the rest of the intervals with a closing time before 12:00pm are removed from the list

If the input time decided by the user is between 12am - 11:59am, we use the start time ascending tree, and end time descending otherwise.

To go through the time ascending scenario:
Given a point in time `t`, we can eliminate all intervals that have an end time before `t`. With the remaining set of intervals, we could then sort it by end time descending and eliminate all start times after `t`. What is left over would be all intervals that intersect point `t`.

One downside to this approach is that it is made to be specific to this functionality as the data structure isn't easy to consume due to there being no groupings. Another problem is the double-handling of the sorting which might not be very efficient. Finally, the ideal scenario would be to have separate, exclusive lists to narrow down the initial search numbers further, but instead we have overlap between the two lists for any points that have a start and end that overlap `t` which would be the majority of the intervals.

# Feedback
I would love to be able to get feedback on the Alternative Solution and how it could be improved further, or if there is a better approach that could be used instead!