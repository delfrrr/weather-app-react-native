/**
 * svg group with rain/snow drops
 * @module precip
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const connect = require('react-redux').connect;
let path = React.createFactory(require('react-native-svg').Path);
const sliceDataPoints = require('../lib/sliceDataPoints');
const g = React.createFactory(require('react-native-svg').G);
const svgText = React.createFactory(require('react-native-svg').Text);
// const circle = React.createFactory(require('react-native-svg').Circle);
const {scaleLinear, scaleQuantize} = require('d3-scale');

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
        let precips = dataPoints.map((dp, key) => {
            let rain = ((
                dp.icon.match('rain') ||
                dp.icon.match('sleet')
            ) && dp.precipIntensity) ? 1 : 0;
            let snow = dp.icon.match('snow') ? 1 : 0;
            return {
                key,
                rain,
                snow,
                intensity: dp.precipIntensity || 0,
                probability: dp.precipProbability || 0
            }
        });
        return {
            precips
        };
    }
    return {
        precips: null
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
        const {precips} = this.state;
        if (!precips) {
            return null;
        }
        const xScale = scaleLinear()
            .domain([0, 23])
            .range([0, width / 2]);
        const strokeWidth = scaleQuantize().domain([2.5, 7.6]).range([1, 1.5]);
        const fontWeight = scaleQuantize().domain([2.5, 7.6]).range(['200', '400']);
        const probability = scaleQuantize().domain([0, 1]).range([0, 7, 7 * 2, 7 * 3]);
        const snowProbability = scaleQuantize().domain([0, 1]).range([1, 2, 3]);
        return g(
            {},
            precips.map(precip => {
                let x = xScale(precip.key);
                let y = 0;
                let angle = .3;
                if (precip.rain) {
                    let l = probability(precip.probability);
                    return path({
                        key: precip.key,
                        fill: 'transparent',
                        strokeWidth: strokeWidth(precip.intensity),
                        stroke: 'white',
                        opacity: precip.rain,
                        strokeDasharray: [
                            5,
                            2
                        ],
                        d: `M${x},${y} L${
                            x - l * angle
                        },${y + l * Math.pow(1 - angle * angle, .5)}`
                    });
                } else if (precip.snow) {
                    let flakes = [];
                    for (
                        let i = 0;
                        i < snowProbability(precip.probability);
                        i++
                    ) {
                        flakes.push(svgText(
                            {
                                key: precip.key + i,
                                x: x - i * 7 * angle,
                                y: y - 5 + i * 7 * Math.pow(1 - angle * angle, .5),
                                fontSize: 16,
                                fontWeight: fontWeight(precip.intensity),
                                fill: 'white',
                                textAnchor: 'middle',
                                backgroundColor: 'yellow'
                            },
                            '*'
                        ));
                    }
                    return flakes;
                }
                return null;
                // let circles = [];
                // for (var i = 0; i < intensity(precip.intensity); i++) {
                //     circles.push(circle({
                //         key: precip.key + i,
                //         r: 2,
                //         cx: xScale(precip.key),
                //         cy: 3 + i * 8,
                //         fill: 'white',
                //         opacity: precip.rain * precip.probability
                //     }))
                // }
                // return circles;
            })
        );
    }
}));
