/**
 * temperature bar
 * @module t-bar
 */

'use strict';

const React = require('react');
const View = React.createFactory(require('react-native').View);
const text = React.createFactory(require('./text'));
const rain = React.createFactory(require('./rain'));
const wind = React.createFactory(require('./wind'));
const snow = React.createFactory(require('./snow'));
const connect = require('react-redux').connect;
const getDataPoints = require('../lib/getDataPoints');
const moment = require('moment');
const formatTemperature = require('../lib/format-temperature');

/**
 * takes correspomding data points from data block
 * @param {ForecastDataBlock} hourly
 * @param {number} startHour
 * @param {Date} date
 * @param {string} timezone
 * @returns {ForecastDataPoints}
 */
function sliceDataPoints(hourly, startHour, date, timezone) {
    const points = getDataPoints(hourly);
    if (!points) {
        return null;
    }
    let startTS = moment.tz(date, timezone).startOf('day').add(startHour, 'hour').unix();
    let endTS = startTS + 24 / 4 * 3600;
    return hourly.data.filter(function (conditions) {
        let time = conditions.time;
        return time >= startTS && time < endTS;
    });
}

const bottomPadding = 0.2;

/**
 * @param  {number} temperature
 * @param  {number} minTemperture
 * @param  {number} maxTemperture
 * @return {number} flex value
 */
function getBarHeight(
    temperature,
    minTemperture,
    maxTemperture
) {
    let barHeight = (temperature - minTemperture) /
        (maxTemperture - minTemperture) * (1 - bottomPadding);

    barHeight += bottomPadding;
    if (barHeight > 1) {
        barHeight = 1;
    }
    return barHeight;
}

/**
 * @param  {number} temperatureC
 * @param  {string} temperatureFormat C or F
 * @return {number} temp in C rounded to C or to F
 */
function roundTemperature(temperatureC, temperatureFormat) {
    if (temperatureFormat === 'F') {
        return Math.round(temperatureC * 1.8) / 1.8;
    } else {
        return Math.round(temperatureC);
    }
}

/**
 * @param  {Object} props
 * @return {Object} state
 */
function getSateFromProps(props) {
    const {
        index,
        minTemperture,
        maxTemperture,
        temperatureFormat,
        timezones
    } = props;
    const hourly = props.hourly[index];
    const dataPoints = sliceDataPoints(
        hourly,
        props.startHour,
        props.dates[index],
        timezones[index]
    );
    if (!dataPoints || dataPoints.length !== 6) {
        return {
            temperature: NaN,
            dataPoints: null
        };
    }
    let {temperature, apparentTemperature} = dataPoints[3];

    return {
        tBarHeight: getBarHeight(
            roundTemperature(temperature, temperatureFormat),
            minTemperture,
            maxTemperture
        ),
        atBarHeight: getBarHeight(
            roundTemperature(apparentTemperature, temperatureFormat),
            minTemperture,
            maxTemperture
        ),
        temperature,
        dataPoints
    };
}

module.exports = connect(
    (state) => {
        return {
            hourly: state.hourly,
            timezones: state.timezones,
            dates: state.dates,
            minTemperture: state.minTemperture,
            maxTemperture: state.maxTemperture,
            selectedBars: state.selectedBars,
            temperatureFormat: state.temperatureFormat,
            citySelect: state.citySelect,
            details: state.details
        };
    }
)(React.createClass({
    getInitialState () {
        return Object.assign({
            barHeight: 0
        }, getSateFromProps(this.props));
    },
    componentWillReceiveProps: function (props) {
        this.setState(getSateFromProps(props));
    },
    render: function () {
        const {
            temperatureFormat, width
        } = this.props;
        const {temperature, tBarHeight, dataPoints, atBarHeight} = this.state;
        if (!tBarHeight) {
            return null;
        }
        const temperatureStr = formatTemperature(
            temperature, temperatureFormat
        );
        let atBarFlex = Math.min(atBarHeight / tBarHeight, 1);
        return View(
            {
                style: {
                    width
                }
            },
            View(
                {
                    style: {
                        flex: 1 - tBarHeight,
                        justifyContent: 'flex-end'
                    }
                },
                dataPoints ? View(
                    {
                        style: {
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            justifyContent: 'flex-end'
                        }
                    },
                    wind({dataPoints}),
                    snow({dataPoints}),
                    rain({dataPoints}),
                    text(
                        {
                            style: {
                                textAlign: 'center',
                                height: 18
                            }
                        },
                        temperatureStr
                    )
                ) : null
            ),
            View(
                {
                    style: {
                        flex: tBarHeight,
                        justifyContent: 'flex-end'
                    }
                },
                View(
                    {
                        style: {
                            flex: 1 - atBarFlex,
                            backgroundColor: `rgba(255, 255, 255, 0.3)`
                        }
                    }
                ),
                View(
                    {
                        style: {
                            flex: atBarFlex,
                            backgroundColor: `rgba(255, 255, 255, 0.4)`
                        }
                    }
                )
            )
        );
    }
}));
