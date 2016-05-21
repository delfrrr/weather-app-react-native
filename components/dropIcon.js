/**
 * delete svg icon
 * @module components/dropIcon
 */

const React = require('react');
const svg = React.createFactory(require('react-native-svg').Svg);
const path = React.createFactory(require('react-native-svg').Path);
const circle = React.createFactory(require('react-native-svg').Circle);

module.exports = React.createClass({
    render: function () {
        return svg(
            {
                width: 32,
                height: 32
            },
            circle(
                {
                    cx: 16,
                    cy: 16,
                    r: 10.5,
                    fill: 'red'
                }
            ),
            path(
                {
                    d: 'M10,16.5 L21,16.5',
                    stroke: 'white',
                    strokeWidth: 1
                }
            )
        );
    }
});
