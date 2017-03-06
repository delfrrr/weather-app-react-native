/**
 * svg group with wind by hour
 * @module detailsPrecip
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const height = 50;
const svg = React.createFactory(require('react-native-svg').Svg);
const circle = React.createFactory(require('react-native-svg').Circle);
const svgText = React.createFactory(require('react-native-svg').Text);
const {scaleLinear, scaleQuantize} = require('d3-scale');

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
            points
        };
    }
    return {
        points: null
    };
}

const xScale = scaleLinear()
    .domain([0, 23])
    .range([6, width - 6]);
const fontWeightScale = scaleQuantize().domain([2.5, 7.6]).range(['200', '400', '600']);
const radiusScale = scaleQuantize().domain([2.5, 7.6]).range([2, 3, 4]);
const levelScale = scaleQuantize().domain([0, 1]).range([1, 2, 3]);

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
                key: 'detailsPrecip',
                width,
                height
            },
            points.map(p => {
                let x = xScale(p.key);
                let y0 = 6;
                let symbols = [];
                const step = width / 23;
                if (p.intensity) {
                    for (
                        let i = 0;
                        i < levelScale(p.probability);
                        i++
                    ) {
                        let y = y0 + i * step;
                        if (p.rain) {
                            symbols.push(circle({
                                key: p.key + i,
                                r: radiusScale(p.intensity),
                                cx: x,
                                cy: y,
                                fill: 'white'
                            }));
                        } else if (p.snow) {
                            symbols.push(svgText(
                                {
                                    key: p.key + i,
                                    x: x,
                                    y: y - 11.75,//adjust to center
                                    fontSize: 28,
                                    fontWeight: fontWeightScale(p.intensity),
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
});
