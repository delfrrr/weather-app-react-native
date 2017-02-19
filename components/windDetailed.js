/**
 * svg group with wind by hour
 * @module windDetailed
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const connect = require('react-redux').connect;
// let line = React.createFactory(require('react-native-svg').Line);
let path = React.createFactory(require('react-native-svg').Path);
const sliceDataPoints = require('../lib/sliceDataPoints');
const g = React.createFactory(require('react-native-svg').G);
// const svgText = React.createFactory(require('react-native-svg').Text);
// const circle = React.createFactory(require('react-native-svg').Circle);
const {scaleLinear, scaleQuantize} = require('d3-scale');
const {arc} = require('d3-shape');

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
        let y0 = 50;
        let l = 15;
        const bofort = scaleLinear()
            .domain([0, .3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8])
            .range([0,  1,  2,   3,   4,   5, 6,    7, 8, 9])
        const xScale = scaleLinear()
            .domain([0, 23])
            .range([0, width / 2 - l / 2]);
        const radius = scaleLinear()
            .domain([0,  4,    5,    6, Infinity])
            .range([ 10, 1.81, 1.13, 1, 1]);
        const size = scaleQuantize()
            .domain([3,   4,  5,   6])
            .range([0,   0.5,  1, 1.5]);
        return g(
            {},
            points.map(({hour, speed}) => {
                let x = xScale(hour);
                let key = hour;
                let b = bofort(speed);
                let r = radius(b);
                let alpha = Math.asin(1/r);
                let dx = (l/2) * Math.pow(r * r - 1, .5);
                let start = Math.PI / 2;
                let strokeSize = size(b);
                let d = arc()({
                    innerRadius: r * (l/2) - strokeSize,
                    outerRadius: r * (l/2) ,
                    startAngle: start - alpha,
                    endAngle: start + alpha
                });
                return path({
                    key,
                    fill: 'white',
                    d,
                    x: x - dx,
                    y: y0
                });
            })
        );
    }
}));
