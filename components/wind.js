/**
 * wind icon
 * @module wind
 */

'use strict';

let React = require('react');
let View = React.createFactory(require('react-native').View);
let Animated = require('react-native').Animated;
let AnimatedView = React.createFactory(Animated.View);
let Svg = React.createFactory(require('react-native-svg').Svg);
let Circle = React.createFactory(require('react-native-svg').Circle);
let Path = React.createFactory(require('react-native-svg').Path);
let G = React.createFactory(require('react-native-svg').G);
const beaufort = require('../lib/beaufort');
const {scaleThreshold} = require('d3-scale');
const durationScale = scaleThreshold()
    .domain([      3,    4,    5,    6,   7  ])
    .range([ 6000, 6000, 3000, 1500, 750, 400]);

/**
 * @param  {number} windSpeed m/s
 * @return {number} animation duration ms
 */
function getDuration(windSpeed) {
    const b = beaufort(windSpeed);
    return durationScale(b);
}

module.exports = React.createClass({
    getInitialState: function () {
        return {
            angle: new Animated.Value(0),
            show: false,
            maxWindSpeed: 0
        }
    },
    componentWillMount: function () {
        let {dataPoints} = this.props;
        let windyPoints = dataPoints.filter((p) => {
            return p.icon.match('wind') ||
                beaufort(p.windSpeed) >= 4;
        });
        if (windyPoints.length) {
            let maxWindSpeed = Math.max(
                ...dataPoints.map(p => p.windSpeed)
                .filter(Boolean)
            );
            this.setState({maxWindSpeed, show: true});
        }
    },
    componentDidMount: function () {
        let {angle, maxWindSpeed} = this.state;
        function cycle() {
            angle.setValue(0);
            Animated.timing(
                angle,
                {
                    duration: getDuration(maxWindSpeed),
                    toValue: 360,
                    easing: a => a //do not ease
                }
            ).start(cycle);
        }
        cycle();
    },
    render: function () {
        let {show} = this.state;
        if (!show) {
            return null;
        }
        let rotateValue = this.state.angle.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg']
        });
        return View(
            {
                style: {
                    height: 32,
                    alignItems: 'center'
                }
            },
            AnimatedView(
                {
                    style: {
                        width: 32,
                        height: 32,
                        transform: [{'rotate': rotateValue}]
                    }
                },
                Svg(
                    {
                        width: 32,
                        height: 32
                    },
                    G(
                        {
                            stroke: 'white',
                            strokeWidth: 1
                        },
                        Path({d: 'M5.5,21.5 L13,17'}),
                        Path({d: 'M26.5,21.5 L19,17'}),
                        Path({d: 'M16,4 L16,13'})
                    ),
                    Circle({cx: 16, cy: 16, r: 1, fill: 'white'})
                )
            )
        );
    }
});
