/**
 * background gradient
 * @module components/background
 */

const React = require('react');
const getDimensions = require('../lib/getDimensions');
const Svg = React.createFactory(require('react-native-svg').Svg);
const Defs = React.createFactory(require('react-native-svg').Defs);
const Stop = React.createFactory(require('react-native-svg').Stop);
const connect = require('react-redux').connect;
const getColorByTemp = require('../lib/temperature-color');
const getDataPoints = require('../lib/getDataPoints');
const {interpolate} = require('d3-interpolate');
const LinearGradient = React.createFactory(
    require('react-native-svg').LinearGradient
);
const Rect = React.createFactory(require('react-native-svg').Rect);

/**
 * @param {ForecastDataBlock[]} hourly
 * @param {number[]} hourRange
 * @param {boolean} useApparentTemperature
 * @returns {string[][]} colors
 */
function getStops(hourly, hourRange, useApparentTemperature) {
    return hourly.map((dataBlock) => {
        const points = getDataPoints(dataBlock);
        if (points) {
            let targetTempAr = points.map(
                p => {
                    return useApparentTemperature ?
                    p.apparentTemperature :
                    p.temperature;
                }
            );
            let maxTemp = Math.max(...targetTempAr.slice(...hourRange));
            let minTemp = Math.min(...targetTempAr.slice(...hourRange));
            return [
                getColorByTemp(maxTemp),
                getColorByTemp(minTemp)
            ]
        } else {
            return [
                'rgb(84, 84, 84)',
                'rgb(84, 84, 84)'
            ];
        }
    });
}

module.exports = connect(
    (state) => {
        return {
            hourRange: state.hourRange,
            hourly: state.hourly,
            useApparentTemperature: state.useApparentTemperature,
            chartType: state.chartType
        }
    }
)(React.createClass({
    getInitialState() {
        const {hourly, hourRange, useApparentTemperature} = this.props;
        return {
            stops: getStops(hourly, hourRange, useApparentTemperature)
        };
    },
    componentWillReceiveProps(props) {
        const {
            hourly,
            hourRange,
            useApparentTemperature
        } = props;
        const interpolator = interpolate(
            this.state,
            {stops: getStops(hourly, hourRange, useApparentTemperature)}
        );
        const start = Date.now();
        const duration = 500;
        this._animation = () => {
            const now = Date.now();
            let t = (now - start) / duration;
            if (t > 1) {
                t = 1;
            }
            this.setState(interpolator(t));
            if (t < 1) {
                requestAnimationFrame(this._animation);
            }
        }
        requestAnimationFrame(this._animation);
    },
    render () {
        const padding = 0;
        let {width, viewHeight} = getDimensions();
        width += 2 * padding;
        const {stops} = this.state;
        const {chartType} = this.props;
        return Svg(
            {
                width,
                height: viewHeight,
                style: {
                    position: 'absolute',
                    left: -padding
                }
            },
            Defs(null,
                LinearGradient(
                    {
                        id: 'grad1',
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: viewHeight
                    },
                    Stop({
                        offset: String(0),
                        stopColor: stops[0][0],
                        stopOpacity: 1
                    }),
                    Stop({
                        offset: String(
                            chartType === 'curve' ? 1 : .5
                        ),
                        stopColor: stops[0][1],
                        stopOpacity: 1
                    })
                ),
                LinearGradient(
                    {
                        id: 'grad2',
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: viewHeight
                    },
                    Stop({
                        offset: String(0),
                        stopColor: stops[1][0],
                        stopOpacity: 1
                    }),
                    Stop({
                        offset: String(
                            chartType === 'curve' ? 1 : .5
                        ),
                        stopColor: stops[1][1],
                        stopOpacity: 1
                    })
                )
            ),
            Rect({x: 0, y: 0, width: width / 2, height: viewHeight, fill: 'url(#grad1)'}),
            Rect({x: width/2, y: 0, width: width / 2, height: viewHeight, fill: 'url(#grad2)'})
        );
    }
}));
