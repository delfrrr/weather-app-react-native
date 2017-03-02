/**
 * @module lib/sliceDataPoints
 */

'use strict';

const getDataPoints = require('../lib/getDataPoints');
const moment = require('moment');

/**
 * slice data for current date
 * @param  {ForecastDataBlock} hourly
 * @param  {Date} date
 * @param  {String} timezone
 * @param  {Object} [current] current data point; when provided will be injected
 * @return {Object[]}
 */
module.exports = function (hourly, date, timezone, current) {
    const points = getDataPoints(hourly);
    if (!points) {
        return [];
    }
    let startTS = moment.tz(date, timezone).startOf('day').unix();
    let endTS = startTS + 24 * 3600;
    let filteredPoints = points.filter(function ({time}) {
        return time >= startTS && time < endTS;
    });
    if (current) {
        let currentTime = Math.floor(Date.now() / 1000);
        filteredPoints.forEach((dp, key) => {
            let prev = filteredPoints[key - 1];
            if (
                prev &&
                prev.time <= currentTime &&
                dp.time > currentTime
            ) {
                filteredPoints[key - 1] = Object.assign(
                    {},
                    current,
                    {current: true}
                )
            }
        })
    }
    return filteredPoints;
}
