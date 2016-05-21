/**
 * delete svg icon
 * @module components/dropIcon
 */

const React = require('react');
const svg = React.createFactory(require('react-native-svg').Svg);
const circle = React.createFactory(require('react-native-svg').Circle);
// const g = React.createFactory(require('react-native-svg').G);
// const path = React.createFactory(require('react-native-svg').Path);

module.exports = React.createClass({
    render: function () {
        const {selected} = this.props;
        return svg(
            {
                width: 32,
                height: 32
            },
            // !selected && g(
            //     {},
            //     path(
            //         {
            //             d: 'M16.5,10 L16.5,22',
            //             stroke: '#4A90E2',
            //             strokeWidth: 1
            //         }
            //     ),
            //     path(
            //         {
            //             d: 'M10,16.5 L22,16.5',
            //             stroke: '#4A90E2',
            //             strokeWidth: 1
            //         }
            //     )
            // ),
            selected && circle(
                {
                    cx: 16,
                    cy: 16,
                    r: 6.5,
                    strokeWidth: 0,
                    fill: '#4A90E2'
                }
            )
        );
    }
});
