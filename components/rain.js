/**
 * rain icon
 * @module rain
 */

'use strict';

let React = require('react');
let View = React.createFactory(require('react-native').View);
let Svg = React.createFactory(require('react-native-svg').Svg);
let Line = React.createFactory(require('react-native-svg').Line);
let scale = require('d3-scale').scaleQuantize();
let getLines = scale.domain([0, 1]).range([2, 3, 4, 5, 6]);

module.exports = React.createClass({
    getInitialState: function () {
        return {
            lines: 0
        }
    },
    componentWillMount: function () {
        const {dataPoints} = this.props;
        let rainPoints = dataPoints.filter((p) => {
            return (
                p.icon.match('rain') ||
                p.icon.match('sleet')
            ) && p.precipIntensity;
        });
        if (rainPoints.length === 0) {
            return;
        }
        let maxIntencity = Math.max(...rainPoints.map(p => p.precipIntensity));
        let lines = getLines(maxIntencity);
        this.setState({lines});
    },
    render: function () {
        let {lines} = this.state;
        if (lines < 2) {
            return null;
        }
        const step = 4;
        let linesAr = [];
        for (let i = 0; i < lines; i++) {
            linesAr.push(Line({
                key: i,
                x1: (i + 1) * step + 1,
                y1: 0,
                x2: i * step + 1,
                y2: 16,
                stroke: 'white',
                strokeWidth: 1
            }));
        }
        return View(
            {
                style: {
                    height: 20,
                    alignItems: 'center'
                }
            },
            Svg(
                {
                    width: lines * step + 2,
                    height: 16
                },
                linesAr
            )
        );
    }
});
