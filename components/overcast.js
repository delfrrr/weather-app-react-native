/**
 * svg group with wind by hour
 * @module windDetailed
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const connect = require('react-redux').connect;
// let line = React.createFactory(require('react-native-svg').Line);
// let path = React.createFactory(require('react-native-svg').Path);
const rect = React.createFactory(require('react-native-svg').Rect);
const sliceDataPoints = require('../lib/sliceDataPoints');
const g = React.createFactory(require('react-native-svg').G);
const {scaleLinear/*, scaleThreshold*/} = require('d3-scale');
// const d3Path = require('d3-path').path;
const svg = React.createFactory(require('react-native-svg').Svg);
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
        let points = dataPoints.map(({cloudCover}, hour) => {
            return {
                cloudCover,
                hour
            }
        });
        return {points};
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
        const height = 20;
        if (!points) {
            return null;
        }
        const xScale = scaleLinear()
            .domain([0, 23])
            .range([0, width / 2]);
        const dxScale = scaleLinear()
            .domain([0, 1])
            .range([0, width / 2 / 24]);
        return svg(
            {
                width: width/2,
                height,
                style: {
                    position: 'absolute'
                }
            },
            g(
                {
                    opacity: .3
                },
                points.map(({cloudCover, hour}, key) => {
                    let x = Math.floor(xScale(hour));
                    let dx = Math.ceil(dxScale(cloudCover));
                    return rect({
                        key,
                        x,
                        y: 0,
                        width: dx,
                        height,
                        fill: 'white'
                    })
                })
            )
        );
    }
}));
