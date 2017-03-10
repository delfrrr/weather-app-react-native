/**
 * svg group with wind by hour
 * @module detailsCloudCoverage
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const height = 50;
const svg = React.createFactory(require('react-native-svg').Svg);
const Defs = React.createFactory(require('react-native-svg').Defs);
const Stop = React.createFactory(require('react-native-svg').Stop);
const LinearGradient = React.createFactory(
    require('react-native-svg').LinearGradient
);
const {scaleLinear} = require('d3-scale');
const {area, curveMonotoneX} = require('d3-shape');
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
                cloudCover: Math.round((cloudCover || 0) * 4) / 4,
                hour
            }
        });
        return {points};
    }
    return {};
}

const xScale = scaleLinear()
    .domain([0, 23])
    .range([0, width]);

const yScale = scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

const areaFn = area()
    .y0(p => yScale(p.cloudCover))
    .y1(height)
    .x((p) => xScale(p.hour))
    .curve(curveMonotoneX);

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
        const d = areaFn(points);
        return svg(
            {
                width,
                height
            },
            Defs(null,
                LinearGradient(
                    {
                        id: 'grad',
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: height
                    },
                    Stop({
                        offset: String(0),
                        stopColor: 'rgba(255, 255, 255)',
                        stopOpacity: .1
                    }),
                    Stop({
                        offset: String(1),
                        stopColor: 'rgba(255, 255, 255)',
                        stopOpacity: 0
                    })
                )
            ),
            path({
                d,
                strokeWidth: 0,
                fill: 'url(#grad)'
            })
        );
    }
});
