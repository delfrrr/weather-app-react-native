/**
 * svg group with wind by hour
 * @module detailsCloudCoverage
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const height = 40;
const svg = React.createFactory(require('react-native-svg').Svg);
const {scaleLinear} = require('d3-scale');
const {area} = require('d3-shape');
const path = React.createFactory(require('react-native-svg').Path);
const setStateAnimated = require('../lib/setStateAnimated');

/**
 * @param  {Object} props
 * @return {Object} state
 */
function getSateFromProps(props) {
    let {
        dataPoints
    } = props;
    if (dataPoints.length === 24) {
        let points = dataPoints.map(({cloudCover}, hour) => {
            return {
                cloudCover,
                hour
            }
        });
        return {points};
    }
    return {};
}

module.exports = React.createClass({
    getInitialState: function () {
        return Object.assign(
            {points: null},
            getSateFromProps(this.props)
        );
    },
    componentWillMount: function () {
        this.setStateAnimated = setStateAnimated(500);
    },
    componentWillReceiveProps: function (props) {
        this.setStateAnimated(getSateFromProps(props));
    },
    render: function () {
        const {points} = this.state;
        if (!points) {
            return null;
        }
        const pixels = [];
        for (let i = 0; i <= width; i++) {
            pixels.push(i, i + .5);
        }
        const a = 1;
        const b = 4 * Math.PI / width * 24;
        const xScale = scaleLinear()
            .domain([0, 23])
            .range([0, width]);
        const dxScale = scaleLinear()
            .domain([0, 1])
            .range([0, width / 24]);
        let areaFn = area()
            .y0(x => a * Math.sin(x * b) + a)
            .y1(x => a * Math.sin(x * b) - a + height)
            .defined(x => {
                let key = Math.round(xScale.invert(x));
                let x0 = xScale(key);
                let {cloudCover} = points[key];
                let dx = dxScale(cloudCover);
                return Math.abs(x - x0) <= dx;
            })
            .x(x => x);
        return svg(
            {
                width,
                height
            },
            path({
                d: areaFn(pixels),
                strokeWidth: 0,
                fill: 'rgba(255, 255, 255, .1)'
            })
        );
    }
});
