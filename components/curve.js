/**
 * temperature curve
 * @module next
 */

'use strict';

const React = require('react');
// const {Dimensions} = require('react-native');
const {width, curveHeight} = require('../lib/getDimensions')();
const view = React.createFactory(require('react-native').View);
const connect = require('react-redux').connect;
// const text = React.createFactory(require('./text'));
const svg = React.createFactory(require('react-native-svg').Svg);
const getDataPoints = require('../lib/getDataPoints');
const moment = require('moment');
const {line, curveMonotoneX/*, area*/} = require('d3-shape');
// const temperatureColor = require('../lib/temperature-color');
const formatTemperature = require('../lib/format-temperature');
let path = React.createFactory(require('react-native-svg').Path);
let g = React.createFactory(require('react-native-svg').G);
let svgText = React.createFactory(require('react-native-svg').Text);
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

function getLocalMinMax(tempAr) {
    let localMax = Math.max(...tempAr);
    let localMin = Math.min(...tempAr);
    return {localMax, localMin};
}

function addSpecialPoints(temperaturePointAr) {
    const padding = 15; //px
    const offset = Math.ceil(padding / (width / 2 / 24));
    let {localMin, localMax} = getLocalMinMax(
        temperaturePointAr.map(p => p.t).slice(offset, 23 - offset)
    );
    temperaturePointAr.forEach(p => {
        if (p.t === localMax) {
            p.localMax = true;
            localMax = null;
        }
        if (p.t === localMin) {
            p.localMin = true;
            localMin = null;
        }
    })
    return temperaturePointAr;
}

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
        hourly,
        dates
    } = props;
    const dataPoints = sliceDataPoints(
        hourly[index],
        dates[index],
        timezones[index]
    );
    if (dataPoints.length === 24) {
        let temperaturePointAr = addSpecialPoints(dataPoints.map((dp, key) => {
            return {
                t: dp.temperature,
                at: dp.apparentTemperature,
                key
            }
        }));
        //TODO: not cool
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
        const {temperatureFormat, useApparentTemperature} = this.props;
        if (!temperaturePointAr) {
            return null;
        }
        // const {localMin, localMax} = getLocalMinMax(
        //     temperaturePointAr.map(p => p.t).concat(
        //         temperaturePointAr.map(p => p.at)
        //     )
        // );
        const svgSize = {
            width: width / 2,
            height: curveHeight
        };
        let xScale = scaleLinear()
            .domain([0, temperaturePointAr.length - 1])
            .range([0, svgSize.width]);
        let yScale = scaleLinear()
            .domain([minTemperture, maxTemperture])
            .range([svgSize.height - 20, 50]);
        let tempLine = line()
            .y(p => yScale(p.t))
            .x(p => xScale(p.key))
            .curve(curveMonotoneX);
        let tempLineStr = tempLine(temperaturePointAr);
        let aTempLine;
        let aTempLineStr;
        if (useApparentTemperature) {
            aTempLine = line()
                .y(p => yScale(p.at))
                .x(p => xScale(p.key))
                .curve(curveMonotoneX);
            aTempLineStr = aTempLine(temperaturePointAr);
        }
        // let areaFun = area()
        //     .y(p => yScale(p.at))
        //     .x(p => xScale(p.key))
        //     .y1(svgSize.height)
        //     .curve(curveMonotoneX);
            // .x0(xScale(0))
            // .y0(yScale(minTemperture))
            // .x1(xScale(temperaturePointAr.length - 1))
            // .y1(yScale(maxTemperture))
        // let areaStr = areaFun(temperaturePointAr);
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
                            stopOpacity: .2
                        }),
                        stop({
                            offset: String(.7),
                            stopColor: 'white',
                            stopOpacity: .1
                        })
                    )
                ),
                // path({
                //     d: areaStr,
                //     strokeWidth: 0,
                //     fill: 'url(#grad)'
                // }),
                aTempLineStr && path({
                    d: aTempLineStr,
                    stroke: 'rgba(255, 255, 255, 0.2)',
                    strokeWidth: .5,
                    fill: 'transparent'
                }),
                path({
                    d: tempLineStr,
                    stroke: 'rgba(255, 255, 255, 1)',
                    strokeWidth: 1,
                    fill: 'transparent'
                }),
                g(
                    {},
                    temperaturePointAr.map((p, key) => {
                        if (p.localMin || p.localMax) {
                            return g(
                                {key},
                                circle({
                                    key,
                                    r: 3,
                                    cx: xScale(key),
                                    cy: yScale(p.t),
                                    fill: 'white',
                                    strokeWidth: 6,
                                    stroke: 'rgba(255, 255, 255, .2)'
                                }),
                                svgText(
                                    {
                                        x: xScale(key),
                                        y: yScale(p.t) + (
                                            p.localMin ? 10 : -24
                                        ),
                                        fontSize: 12,
                                        fill: 'white',
                                        textAnchor: 'middle'
                                    },
                                    formatTemperature(
                                        p.t, temperatureFormat, '  '
                                    )
                                )
                            );
                        }
                        return null;
                    })
                )
            )
        );
    }
}));
