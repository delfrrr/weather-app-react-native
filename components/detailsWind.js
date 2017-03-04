/**
 * svg group with wind by hour
 * @module detailsWind
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const dWheight = 50;
const path = React.createFactory(require('react-native-svg').Path);
const svg = React.createFactory(require('react-native-svg').Svg);
const {scaleLinear, scaleThreshold} = require('d3-scale');
const d3Path = require('d3-path').path;

//scales
const bofort = scaleLinear()
    .domain([0, .3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8]) // m/s
    .range([0,  1,  2,   3,   4,   5, 6,    7, 8, 9]); //bofort
const y0 = dWheight / 2;
const l = 15;
const xScale = scaleLinear()
    .domain([0, 23])
    .range([l / 1.5, width - l / 1.5]);
const strokeWidthScale = scaleThreshold()
    .domain([  3, 4, 5, 6, 7, 8])
    .range([ 0, 0, .5, 2, 2,  3, 4, 4]);

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
            let b = bofort(dp.windSpeed);
            let strokeWidth = strokeWidthScale(b);
            return {
                hour,
                strokeWidth
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
        const {points} = this.state;
        if (!points) {
            return null;
        }
        return svg(
            {
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
        );
    }
});
