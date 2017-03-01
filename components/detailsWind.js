/**
 * svg group with wind by hour
 * @module detailsWind
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const dWheight = 50;
const connect = require('react-redux').connect;
let path = React.createFactory(require('react-native-svg').Path);
const sliceDataPoints = require('../lib/sliceDataPoints');
const g = React.createFactory(require('react-native-svg').G);
const svg = React.createFactory(require('react-native-svg').Svg);
const {scaleLinear, scaleThreshold} = require('d3-scale');
const d3Path = require('d3-path').path;

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
        let points = dataPoints.map((dp, key) => {
            return {
                hour: key,
                bearing: dp.windBearing || 0,
                speed: dp.windSpeed
            }
        });
        return {
            points
        };
    }
    return {
        points: null
    };
}

module.exports = connect(
    state => {
        return {
            hourly: state.hourly,
            timezones: state.timezones,
            dates: state.dates
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
        const {points} = this.state;
        if (!points) {
            return null;
        }
        const y0 = 50;
        const l = 15;
        const bofort = scaleLinear()
            .domain([0, .3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8])
            .range([0,  1,  2,   3,   4,   5, 6,    7, 8, 9])
        const xScale = scaleLinear()
            .domain([0, 23])
            .range([0, width / 2 - l / 2]);
        const size = scaleThreshold()
            .domain([3, 4,   5,  6,  7, 8])
            .range([ 0, 0, 0.5, 1,  2,  3, 4, 4]);
        return svg(
            {
                width,
                height: dWheight
            }
        );
        return g(
            {},
            points.map(({hour, speed}) => {
                let x = xScale(hour);
                let key = hour;
                let b = bofort(speed);
                let strokeWidth = size(b);
                let curve = d3Path();
                curve.moveTo(x, y0 - l / 2);
                curve.lineTo(x + l / 3, y0);
                curve.lineTo(x, y0 + l / 2);
                let d = curve.toString();
                return path({
                    key,
                    stroke: 'white',
                    strokeWidth: strokeWidth,
                    fill: 'transparent',
                    d
                });
            })
        );
    }
}));
