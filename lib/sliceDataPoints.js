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
 * @return {Object[]}
 */
module.exports = function (hourly, date, timezone) {
    const points = getDataPoints(hourly);
    if (!points) {
        return [];
    }
    let startTS = moment.tz(date, timezone).startOf('day').unix();
    let endTS = startTS + 24 * 3600;
    return points.filter(function ({time}) {
        return time >= startTS && time < endTS;
    });
}
