/**
 * temperature curve
 * @module next
 */

'use strict';

const React = require('react');
const {Dimensions} = require('react-native');
const view = React.createFactory(require('react-native').View);
const connect = require('react-redux').connect;
// const text = React.createFactory(require('./text'));
const svg = React.createFactory(require('react-native-svg').Svg);
const getDataPoints = require('../lib/getDataPoints');
const moment = require('moment');
const {line, curveMonotoneX, area} = require('d3-shape');
let path = React.createFactory(require('react-native-svg').Path);
let g = React.createFactory(require('react-native-svg').G);
let linearGradient = React.createFactory(
    require('react-native-svg').LinearGradient
);
let defs = React.createFactory(
    require('react-native-svg').Defs
);
let stop = React.createFactory(
    require('react-native-svg').Stop
);
let circle = React.createFactory(require('react-native-svg').Circle);
let {scaleLinear} = require('d3-scale');

/**
 * slice data for current date
 * @param  {ForecastDataBlock} hourly
 * @param  {Date} date
 * @param  {String} timezone
 * @return {Object[]}
 */
function sliceDataPoints(hourly, date, timezone) {
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

/**
 * marks outliers
 * @param  {{temperature: Number, key: Number}} temperaturePointAr
 * @return {{temperature: Number, key: Number, outlier: Boolean}} temperaturePointAr
 */
/*function markOutliars(temperaturePointAr) {
    let tAr = temperaturePointAr.map(p => p.temperature);
    let range = Math.max(...tAr) - Math.min(...tAr);
    let closestNeigbours = tAr.map((t, k) => {
        let prev = tAr[k - 1];
        let next = tAr[k + 1];
        if (typeof prev !== 'number') {
            prev = next;
        } else if (typeof next !== 'number') {
            next = prev;
        }
        return {
            minDt: Math.min(
                Math.abs(t - prev),
                Math.abs(t - next)
            ) / range,
            extrem: (t > prev && t > next) || (t < prev && t < next)
        };
    });
    temperaturePointAr.forEach((tp, k) => {
        let {minDt, extrem} = closestNeigbours[k];
        if (
            minDt > 0.3 &&
            extrem &&
            k > 0 &&
            k < temperaturePointAr.length - 1
        ) {
            tp.outlier = true;
        }
    });
    return temperaturePointAr;
}*/

/**
 * @param  {Object} props
 * @return {Object} state
 */
function getSateFromProps(props) {
    let {
        index,
        minTemperture,
        maxTemperture,
        timezones,
        useApparentTemperature,
        hourly,
        dates
    } = props;
    const dataPoints = sliceDataPoints(
        hourly[index],
        dates[index],
        timezones[index]
    );
    if (dataPoints.length === 24) {
        let temperaturePointAr = dataPoints.map((dp, key) => {
            return {
                temperature: useApparentTemperature ?
                    dp.apparentTemperature :
                    dp.temperature,
                key
            }
        });
        if (minTemperture > 100) {
            minTemperture = -273;
        }
        if (maxTemperture < -273) {
            maxTemperture = 100;
        }
        return {
            minTemperture,
            maxTemperture,
            temperaturePointAr
        };
    } else {
        return {
            temperaturePointAr: null,
            minTemperture: null,
            maxTemperture: null
        };
    }
}

module.exports = connect(
    state => {
        return {
            hourly: state.hourly,
            timezones: state.timezones,
            dates: state.dates,
            minTemperture: state.minTemperture,
            maxTemperture: state.maxTemperture,
            temperatureFormat: state.temperatureFormat,
            useApparentTemperature: state.useApparentTemperature
        }
    }
)(React.createClass({
    getInitialState: function () {
        return getSateFromProps(this.props);
    },
    componentWillReceiveProps: function (props) {
        this.setState(getSateFromProps(props));
    },
    render: function () {
        const {minTemperture, maxTemperture, temperaturePointAr} = this.state;
        if (!temperaturePointAr) {
            return null;
        }
        const {width, height} = Dimensions.get('window');
        const svgSize = {
            width: width / 2,
            height: height * 0.4
        };
        let xScale = scaleLinear()
            .domain([0, temperaturePointAr.length - 1])
            .range([0, svgSize.width]);
        let yScale = scaleLinear()
            .domain([minTemperture, maxTemperture])
            .range([svgSize.height - 20, 5]);
        let curve = line()
            .y(p => yScale(p.temperature))
            .x(p => xScale(p.key))
            .curve(curveMonotoneX);
        let areaCurve = area()
            .y(p => yScale(p.temperature))
            .x(p => xScale(p.key))
            .y1(svgSize.height)
            .curve(curveMonotoneX);
            // .x0(xScale(0))
            // .y0(yScale(minTemperture))
            // .x1(xScale(temperaturePointAr.length - 1))
            // .y1(yScale(maxTemperture))
        let dArea = areaCurve(temperaturePointAr.filter(tp => !tp.outlier));
        let dCurve = curve(temperaturePointAr.filter(tp => !tp.outlier));
        // let d = curve(temperaturePointAr);
        return view(
            {
                style: {
                    flex: 2,
                    justifyContent: 'flex-end'
                    // backgroundColor: 'gold'
                }
            },
            svg(
                {
                    width: svgSize.width,
                    height: svgSize.height,
                    style: {
                        // backgroundColor: 'blue'
                    }
                },
                defs(null,
                    linearGradient(
                        {
                            id: 'grad',
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: svgSize.height
                        },
                        stop({
                            offset: String(0),
                            stopColor: 'white',
                            stopOpacity: .1
                        }),
                        stop({
                            offset: String(.7),
                            stopColor: 'white',
                            stopOpacity: 0
                        })
                    )
                ),
                path({
                    d: dArea,
                    strokeWidth: 0,
                    fill: 'url(#grad)'
                }),
                path({
                    d: dCurve,
                    stroke: 'rgba(255, 255, 255, 1)',
                    strokeWidth: 1,
                    fill: 'transparent'
                }),
                g(
                    {},
                    temperaturePointAr.map((p, key) => {
                        if (!p.outlier) {
                            return null;
                        }
                        return circle({
                            key,
                            r: 3,
                            cx: xScale(key),
                            cy: yScale(p.temperature),
                            fill: p.outlier ? 'red' : 'transparent',
                            strokeWidth: .5,
                            stroke: 'white'
                        })
                    })
                )
            )
        );
    }
}));
