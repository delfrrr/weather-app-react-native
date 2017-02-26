/**
 * temperature bar
 * @module t-bar
 */

'use strict';

const React = require('react');
const View = React.createFactory(require('react-native').View);
const {LayoutAnimation} = require('react-native');
// const TouchableWithoutFeedback = React.createFactory(require('react-native').TouchableWithoutFeedback);
const text = React.createFactory(require('./text'));
const rain = React.createFactory(require('./rain'));
const wind = React.createFactory(require('./wind'));
const snow = React.createFactory(require('./snow'));
const connect = require('react-redux').connect;
const getDataPoints = require('../lib/getDataPoints');
const store = require('../reducers/main');
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

function getBarIndex(startHour) {
    return startHour / (24 / 4);
}

const bottomPadding = 0.2;

/**
 * @param  {Object} props
 * @return {Object} state
 */
function getSateFromProps(props) {
    const {
        index,
        minTemperture,
        maxTemperture,
        timezones,
        useApparentTemperature
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
    let targetTemperature;
    if (useApparentTemperature) {
        targetTemperature = dataPoints[3].apparentTemperature
    } else {
        //round to make same temp look same
        targetTemperature = Math.round(dataPoints[3].temperature)
    }
    //one we will show
    let temperature = Math.round(dataPoints[3].temperature);

    //calculate flex value
    let barHeight = (targetTemperature - minTemperture) /
        (maxTemperture - minTemperture) * (1 - bottomPadding);

    barHeight += bottomPadding;
    if (barHeight > 1) {
        barHeight = 1;
    }
    return {
        barHeight,
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
            useApparentTemperature: state.useApparentTemperature,
            citySelect: state.citySelect,
            details: state.details
        };
    },
    () => {
        return {
            onPress: function () {
                let barIndex = getBarIndex(this.props.startHour);
                store.toggleBar(barIndex);
            }
        }
    }
)(React.createClass({
    getInitialState () {
        return Object.assign({
            barHeight: 0
        }, getSateFromProps(this.props));
    },
    componentWillUpdate: function () {
        const {details, citySelect} = this.props;
        if ((details === null) && !citySelect) {
            //do not animate when is not visible
            LayoutAnimation.configureNext(
                LayoutAnimation.create(400, 'linear', 'opacity')
            );
        }
    },
    componentWillReceiveProps: function (props) {
        this.setState(getSateFromProps(props));
    },
    render: function () {
        const {
            temperatureFormat, selectedBars, startHour, width
        } = this.props;
        const {temperature, barHeight, dataPoints} = this.state;
        if (!barHeight) {
            return null;
        }
        const barIndex  = getBarIndex(startHour);
        const selected = selectedBars[barIndex];
        const temperatureStr = formatTemperature(
            temperature, temperatureFormat
        );
        return View(
            {
                style: {
                    width
                }
            },
            View(
                {
                    style: {
                        flex: 1 - barHeight,
                        alignItems: 'flex-end'
                    }
                },
                dataPoints ? View(
                    {
                        style: {
                            position: 'absolute',
                            bottom: 18,
                            left: 0,
                            right: 0,
                            height: 100,
                            justifyContent: 'flex-end'
                        }
                    },
                    wind({dataPoints}),
                    snow({dataPoints}),
                    rain({dataPoints})
                ) : null
            ),
            View(
                    {
                        style: {
                            flex: barHeight,
                            backgroundColor: `rgba(255, 255, 255, ${
                                selected ? 0.4 : 0.3
                            })`
                        }
                    },
                    View(
                        {
                            style: {
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: -18,
                                height: 18
                            }
                        },
                        text(
                            {
                                style: {
                                    textAlign: 'center',
                                    height: 18
                                }
                            },
                            temperatureStr
                        )
                    )
                )
        );
    }
}));
