/**
 * svg group with rain/snow drops
 * @module precip
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const connect = require('react-redux').connect;
const sliceDataPoints = require('../lib/sliceDataPoints');
const g = React.createFactory(require('react-native-svg').G);
const svgText = React.createFactory(require('react-native-svg').Text);
const circle = React.createFactory(require('react-native-svg').Circle);
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
            .range([4, width / 2 - 4]);
        const fontWeight = scaleQuantize().domain([2.5, 7.6]).range(['200', '400', '600']);
        const radius = scaleQuantize().domain([2.5, 7.6]).range([1.5, 2, 2.5]);
        const level = scaleQuantize().domain([0, 1]).range([1, 2, 3]);
        return g(
            {},
            precips.map(precip => {
                let x = xScale(precip.key);
                let y0 = 6;
                let symbols = [];
                const step = 7;
                if (precip.intensity) {
                    for (
                        let i = 0;
                        i < level(precip.probability);
                        i++
                    ) {
                        let y = y0 + i * step;
                        if (precip.rain) {
                            symbols.push(circle({
                                key: precip.key + i,
                                r: radius(precip.intensity),
                                cx: x,
                                cy: y,
                                fill: 'white'
                            }));
                        } else if (precip.snow) {
                            symbols.push(svgText(
                                {
                                    key: precip.key + i,
                                    x: x,
                                    y: y - 7.75,//adjust to center
                                    fontSize: 18,
                                    fontWeight: fontWeight(precip.intensity),
                                    fill: 'white',
                                    textAnchor: 'middle'
                                },
                                '*'
                            ));
                        }
                    }
                }
                return symbols;
            })
        );
    }
}));
