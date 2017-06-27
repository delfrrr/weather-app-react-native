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
const {line, curveMonotoneX, curveBasis, area} = require('d3-shape');
const formatTemperature = require('../lib/format-temperature');
const path = React.createFactory(require('react-native-svg').Path);
const g = React.createFactory(require('react-native-svg').G);
const svgText = React.createFactory(require('react-native-svg').Text);
const circle = React.createFactory(require('react-native-svg').Circle);
const {scaleLinear} = require('d3-scale');
const view = React.createFactory(require('react-native').View);
const setStateAnimated = require('../lib/setStateAnimated');
const store = require('../reducers/main');

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
 * @param  {object[]} dataPoints
 * @return {object[]} with only needed values
 */
function getPoints(dataPoints) {
    return dataPoints.map((dp, hour) => {
        return {
            t: dp.temperature,
            at: dp.apparentTemperature,
            hour,
            time: dp.time,
            current: dp.current
        }
    })
}

let xScale = scaleLinear()
    .domain([0, 23])
    .range([0, width]);

let topPadding = 45;
let bottomPadding = 22;
let yScale = scaleLinear()
    .range([dTHeight - bottomPadding, topPadding]);

let tAreaFn = area()
    .y0(p => yScale(p.t))
    .y1(() => dTHeight)
    .x(p => xScale(p.hour))
    .curve(curveMonotoneX);
let atAreaFn = area()
    .y0(p => yScale(p.at))
    .y1(() => dTHeight)
    .x(p => xScale(p.hour))
    .curve(curveMonotoneX);


/**
 * @param  {Object} props
 * @return {Object} state
 */
function getSateFromProps(props) {
    let {
        dataPoints
    } = props;
    if (dataPoints.length === 24) {
        let points = addSpecialPoints(
            getPoints(dataPoints)
        );
        points.forEach((p) => {
            p.at = Math.round(p.at);
            p.r = Math.round(p.t);
        });
        let tPoints = [].concat(
            points.map((p) => p.t),
            points.map((p) => p.at)
        )
        return {
            minTemperture: Math.min(...tPoints),
            maxTemperture: Math.max(...tPoints),
            points,
            valid: true
        };
    } else {
        return {
            valid: false
        };
    }
}

const labelWidth = 40;

/**
 * @param  {object[]} labeledPoints
 * @param  {function} xScale d3-scale
 * @return {number[]} position of labels
 */
function getLabelPoints(labeledPoints, xScale) {
    const labelPositions = [];
    labeledPoints.forEach((p, key) => {
        let min = (key + 1) * labelWidth;
        if (labelPositions.length) {
            min = labelPositions[key - 1] +labelWidth;
        }
        const max = width - (labeledPoints.length - key) * labelWidth;
        labelPositions.push(Math.min(max, Math.max(min, xScale(p.hour))));
    });
    return labelPositions;
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
            temperatureFormat: state.temperatureFormat
            // useApparentTemperature: state.useApparentTemperature
        }
    }
)(React.createClass({
    getInitialState: function () {
        return Object.assign(
            {
                points: null,
                minTemperture: null,
                maxTemperture: null,
                valid: false,
                animationProgress: 1
            },
            getSateFromProps(this.props)
        );
    },
    componentWillMount: function () {
        this.setStateAnimated = setStateAnimated(500, () => {
            store.configureAnimation();
        });
    },
    componentWillReceiveProps: function (props) {
        const newState = getSateFromProps(props);
        if (!newState.valid) {
            this.setState(newState);
            return;
        }
        this.setState({animationProgress: 0});
        setTimeout(() => {
            newState.animationProgress = 1;
            this.setStateAnimated(newState);
        })
    },
    render: function () {
        const {
            minTemperture,
            maxTemperture,
            points,
            animationProgress,
            valid
        } = this.state;
        const {temperatureFormat/*, useApparentTemperature*/} = this.props;
        if (!points) {
            return null;
        }
        yScale.domain([minTemperture, maxTemperture]);
        let tArea = tAreaFn(points);
        let atArea = atAreaFn(points);
        let labeledPoints = points.filter((p) => {
            return p.current || p.localMin || p.localMax;
        });
        let labelPoints = getLabelPoints(labeledPoints, xScale);
        return view(
            {
                style: {
                    width,
                    height: dTHeight
                }
            },
            svg(
                {
                    width,
                    height: dTHeight,
                    style: {position: 'absolute', top: 0}
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
                })
            ),
            (animationProgress === 1 && valid) ? svg(
                {
                    width,
                    height: dTHeight,
                    style: {position: 'absolute', top: 0}
                },
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
                        `${getLabelPrefix(p)}`
                    ));
                    elems.push(svgText(
                        {
                            x: labelP[0] - (p.t ? 5 : 0),
                            y: 14,
                            fontSize: 12,
                            fill: 'white',
                            textAnchor: 'middle'
                        },
                        `${formatTemperature(
                            p.t, temperatureFormat
                        )}`
                    ));
                    return g({key}, ...elems);
                })
            ) : null
        )
    }
}));
