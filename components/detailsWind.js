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
const svg = React.createFactory(require('react-native-svg').Svg);
const {scaleLinear, scaleThreshold} = require('d3-scale');
const d3Path = require('d3-path').path;

/**
 * @param  {Object} props
 * @return {Object} state
 */
function getSateFromProps(props) {
    let {
        dataPoints
    } = props;
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
        const y0 = dWheight / 2;
        const l = 15;
        const bofort = scaleLinear()
            .domain([0, .3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8])
            .range([0,  1,  2,   3,   4,   5, 6,    7, 8, 9])
        const xScale = scaleLinear()
            .domain([0, 23])
            .range([l / 1.5, width - l / 1.5]);
        const strokeWidthScale = scaleThreshold()
            .domain([  3, 4, 5, 6, 7, 8])
            .range([ 0, 0, .5, 2, 2,  3, 4, 4]);
        return svg(
            {
                width,
                height: dWheight
            },
            points.map(({hour, speed}) => {
                let x = xScale(hour);
                let key = hour;
                let b = bofort(speed);
                let strokeWidth = strokeWidthScale(b);
                // console.log(
                //     '3.1:', strokeWidthScale(3.1),
                //     '4.1:', strokeWidthScale(4.1),
                //     '5.1:', strokeWidthScale(5.1),
                //     '7.9:', strokeWidthScale(7.9),
                //     '8.1:', strokeWidthScale(8.1)
                // );
                let curve = d3Path();
                curve.moveTo(x, y0 - l / 2);
                curve.lineTo(x + l / 2, y0);
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
