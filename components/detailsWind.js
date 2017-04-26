/**
 * svg group with wind by hour
 * @module detailsWind
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const dWheight = 32;
const path = React.createFactory(require('react-native-svg').Path);
const svg = React.createFactory(require('react-native-svg').Svg);
const view = React.createFactory(require('react-native').View);
const text = React.createFactory(require('./text'));
const {scaleLinear, scaleThreshold} = require('d3-scale');
const d3Path = require('d3-path').path;

//scales
const beaufort = require('../lib/beaufort');
const beaufortLabel = scaleThreshold()
    .domain([        2,            3,      4,     5,       6,            7,             8])
    .range(['Calm', 'Light wind', 'Wind', 'Wind', 'Wind', 'Strong wind', 'Strong wind', 'Storm']);
const y0 = dWheight / 2;
const l = 15;
const xScale = scaleLinear()
    .domain([0, 23])
    .range([l / 1.5, width - l / 1.5]);
const strokeWidthScale = scaleThreshold()
    .domain([    2,  3,  4,   5,  6,   7, 8])
    .range([ 0, .5,  1,  1.5, 2,  2.5, 3, 4]);

const labelWidth = 130;

/**
 * @param  {Object[]} points
 * @return {Object}
 */
function getExtremPoint(points) {
    const slicePadding = Math.floor(xScale.invert(labelWidth / 2));
    const slicedPoints = points.slice(
        slicePadding,
        points.length - 1 - slicePadding
    );
    let extremPoint = slicedPoints[0];
    for (let i = 1; i < slicedPoints.length; i++) {
        if (extremPoint.windSpeed < slicedPoints[i].windSpeed) {
            extremPoint = slicedPoints[i];
        }
    }
    return extremPoint;
}

/**
 * @param  {Object} props
 * @return {Object} state
 */
function getSateFromProps(props) {
    let {
        dataPoints
    } = props;
    if (dataPoints.length === 24) {
        let points = dataPoints.map((dp, hour) => {
            let b = beaufort(dp.windSpeed);
            let strokeWidth = strokeWidthScale(b);
            return {
                hour,
                windSpeed: dp.windSpeed,
                b,
                strokeWidth
            }
        });
        return {
            extremPoint: getExtremPoint(points),
            points
        };
    }
    return {
        points: null
    };
}

/**
 * @param  {number} speed      m/s
 * @param  {string} unitSystem us or metric
 * @return {string}
 */
function formatWindSpeed(speed, unitSystem) {
    switch (unitSystem) {
        case 'us':
            return Math.round(speed * 3.6 / 1.60934) + '\u202Fmph'
        default:
            return Math.round(speed) + '\u202Fm/s'
    }
}

module.exports = React.createClass({
    getInitialState: function () {
        return Object.assign(
            {points: null},
            getSateFromProps(this.props)
        );
    },
    componentWillReceiveProps: function (props) {
        this.setState(getSateFromProps(props));
    },
    render: function () {
        const {points, extremPoint} = this.state;
        const {unitSystem} = this.props;
        if (!points) {
            return null;
        }
        return view(
            {},
            extremPoint.strokeWidth > 0 ? view(
                {},
                text(
                    {
                        style: {
                            position: 'relative',
                            left: xScale(extremPoint.hour) - labelWidth / 2,
                            width: labelWidth,
                            fontSize: 12,
                            textAlign: 'center'
                        }
                    },
                    `${
                        beaufortLabel(extremPoint.b)
                    } ${
                        formatWindSpeed(extremPoint.windSpeed, unitSystem)
                        // Math.round(extremPoint.windSpeed)
                    }`
                )
            ) : null,
            svg(
                {
                    key: 'detailsPrecip',
                    width,
                    height: dWheight
                },
                points.map(({hour, strokeWidth}) => {
                    let x = xScale(hour);
                    let key = hour;
                    let curve = d3Path();
                    curve.moveTo(x, y0 - l / 2);
                    curve.lineTo(x + l / 2, y0);
                    curve.lineTo(x, y0 + l / 2);
                    let d = curve.toString();
                    return path({
                        key,
                        stroke: 'white',
                        strokeWidth,
                        fill: 'transparent',
                        d
                    });
                })
            )
        );
    }
});
