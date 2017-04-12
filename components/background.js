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
 * @param {number|null} index when need to show only one column
 * @returns {string[][]} colors
 */
function getStops(hourly, hourRange, index) {
    let dataBlocks = hourly;
    if (typeof index === 'number') {
        dataBlocks = [hourly[index]];
    }
    let stops = dataBlocks.map((dataBlock) => {
        const points = getDataPoints(dataBlock);
        if (points) {
            let targetTempAr = points.map(
                p => p.apparentTemperature
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
    if (stops.length < 2) {
        stops[1] = stops[0];
    }
    return stops;
}

module.exports = connect(
    (state) => {
        return {
            hourRange: state.hourRange,
            hourly: state.hourly
        }
    }
)(React.createClass({
    getInitialState() {
        const {hourly, hourRange, index} = this.props;
        return {
            stops: getStops(hourly, hourRange, index)
        };
    },
    componentWillReceiveProps(props) {
        const {
            hourly,
            hourRange
        } = props;
        const index = this.props.index;
        let stops = getStops(hourly, hourRange, index);
        const interpolator = interpolate(
            this.state,
            {stops}
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
                        offset: String(.5),
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
                        offset: String(.5),
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
