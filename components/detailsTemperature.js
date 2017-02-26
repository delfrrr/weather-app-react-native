/**
 * temperature curve
 * @module detailsTemperature
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const dTHeight = 130;
const connect = require('react-redux').connect;
const svg = React.createFactory(require('react-native-svg').Svg);
const sliceDataPoints = require('../lib/sliceDataPoints');
const {line, curveMonotoneX, curveBasis, area} = require('d3-shape');
const formatTemperature = require('../lib/format-temperature');
let path = React.createFactory(require('react-native-svg').Path);
let g = React.createFactory(require('react-native-svg').G);
let svgText = React.createFactory(require('react-native-svg').Text);
let circle = React.createFactory(require('react-native-svg').Circle);
let {scaleLinear} = require('d3-scale');

/**
 * @param  {number[]} tempAr
 * @return {{localMax: Number, localMin: Number}}
 */
function getLocalMinMax(tempAr) {
    let localMax = Math.max(...tempAr);
    let localMin = Math.min(...tempAr);
    return {localMax, localMin};
}

/**
 * @param {Object[]} temperaturePointAr
 * @returns {Object[]} temperaturePointAr
 */
function addSpecialPoints(temperaturePointAr) {
    let {localMin, localMax} = getLocalMinMax(
        temperaturePointAr.map(p => p.t)
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
 * @param {Object[]} temperaturePointAr
 * @returns {Object[]} temperaturePointAr
 */
function markForecast(temperaturePointAr) {
    let ts = Math.floor(Date.now() / 1000);
    temperaturePointAr.forEach((p, k) => {
        let prev = temperaturePointAr[k - 1];
        if (p.time > ts) {
            if (prev && !prev.forecast) {
                prev.current = true;
            }
            p.forecast = true;
        }
    })
    return temperaturePointAr;
}

/**
 * @param  {object[]} dataPoints
 * @return {object[]} with only needed values
 */
function getPoints(dataPoints) {
    return dataPoints.map((dp, hour) => {
        return {
            t: dp.temperature,
            at: dp.apparentTemperature,
            hour,
            time: dp.time
        }
    })
}

let xScale = scaleLinear()
    .domain([0, 23])
    .range([0, width]);

let topPadding = 50;
let bottomPadding = 22;
let yScale = scaleLinear()
    .range([dTHeight - bottomPadding, topPadding]);

/**
 * @param  {Object} props
 * @return {Object} state
 */
function getSateFromProps(props) {
    let {
        index,
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
        let points = markForecast(
            addSpecialPoints(
                getPoints(dataPoints)
            )
        );
        let tPoints = [].concat(
            points.map((p) => p.t),
            points.map((p) => p.at)
        )
        return {
            minTemperture: Math.min(...tPoints),
            maxTemperture: Math.max(...tPoints),
            points
        };
    } else {
        return {
            points: null,
            minTemperture: null,
            maxTemperture: null
        };
    }
}

/**
 * @param  {object[]} labeledPoints
 * @param  {function} xScaleParam d3-scale
 * @return {number[]} position of labels
 */
function getLabelPoints(labeledPoints, xScaleParam) {
    let xScale = xScaleParam
        .copy()
        .domain([0, labeledPoints.length]);
    return labeledPoints.map((p, key) => {
        return xScale(key + .5);
    })
}

let labelsAnchorLineFn = line()
    .x(p => p[0])
    .y(p => p[1])
    .curve(curveBasis);

/**
 * @param  {object} p
 * @return {string}
 */
function getLabelPrefix(p) {
    if (p.current) {
        return 'Current';
    }
    if (p.localMin) {
        return 'Min';
    }
    if (p.localMax) {
        return 'Max';
    }
}

module.exports = connect(
    state => {
        return {
            hourly: state.hourly,
            timezones: state.timezones,
            dates: state.dates,
            temperatureFormat: state.temperatureFormat//,
            // useApparentTemperature: state.useApparentTemperature
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
        const {minTemperture, maxTemperture, points} = this.state;
        const {temperatureFormat/*, useApparentTemperature*/} = this.props;
        if (!points) {
            return null;
        }
        yScale.domain([minTemperture, maxTemperture]);
        let tArea = area()
            .y0(p => yScale(Math.round(p.t)))
            .y1(() => dTHeight)
            .x(p => xScale(p.hour))
            .curve(curveMonotoneX)(
                points
            );
        let atArea = area()
            .y0(p => yScale(Math.round(p.at)))
            .y1(() => dTHeight)
            .x(p => xScale(p.hour))
            .curve(curveMonotoneX)(
                points
            );
        // let tempLine = line()
        //     .y(p => yScale(Math.round(p.t)))
        //     .x(p => xScale(p.key))
        //     .curve(curveMonotoneX);
        // let tempLineStr = tempLine(temperaturePointAr.filter(p => {
        //     return !p.forecast
        // }));
        // let forecastTempLineStr = tempLine(temperaturePointAr.filter(p => {
        //     return p.forecast;
        // }));
        // let aTempArea;
        // let aTempAreaStr;
        // if (useApparentTemperature) {
        //     aTempArea = area()
        //         .y0(p => yScale(Math.round(p.t)))
        //         .y1(p => yScale(Math.round(p.at)))
        //         .x(p => xScale(p.key))
        //         .curve(curveMonotoneX);
        //     aTempAreaStr = aTempArea(temperaturePointAr);
        // }

        let labeledPoints = points.filter((p) => {
            return p.current || p.localMin || p.localMax;
        });
        let labelPoints = getLabelPoints(labeledPoints, xScale);
        return svg(
            {
                width,
                height: dTHeight,
                style: {
                    // backgroundColor: 'pink'
                }
            },
            path({
                d: tArea,
                strokeWidth: 0,
                fill: 'rgba(255, 255, 255, .3)'
            }),
            path({
                d: atArea,
                strokeWidth: 0,
                fill: 'rgba(255, 255, 255, .1)'
            }),
            labeledPoints.map((p, key) => {
                let elems = []
                let anchorP = [xScale(p.hour), yScale(Math.round(p.t))];
                let labelP = [labelPoints[key], 32];
                let anchorLine = labelsAnchorLineFn(
                        [
                            anchorP,
                            [anchorP[0], anchorP[1] - 10],
                            [labelP[0], labelP[1] + 10],
                            labelP
                        ]
                    );
                elems.push(path({
                    d: anchorLine,
                    stroke: 'white',
                    strokeWidth: 1,
                    fill: 'transparent',
                    opacity: 0.3
                }));
                elems.push(circle({
                    r: 3,
                    cx: anchorP[0],
                    cy: anchorP[1],
                    fill: 'white',
                    strokeWidth: p.current ? 6 : 0,
                    stroke: 'rgba(255, 255, 255, .2)'
                }))
                elems.push(svgText(
                    {
                        x: labelP[0],
                        y: 0,
                        fontSize: 12,
                        fill: 'white',
                        textAnchor: 'middle'
                    },
                    `${getLabelPrefix(p)}\n${formatTemperature(
                        p.t, temperatureFormat, ' '
                    )}`
                ));
                return g({key}, ...elems);
            })
        );
    }
}));
