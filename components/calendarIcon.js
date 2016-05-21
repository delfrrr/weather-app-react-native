/**
 * svg icon
 * @module components/calendar-icon
 */

let React = require('react');
let Svg = React.createFactory(require('react-native-svg').Svg);
let Path = React.createFactory(require('react-native-svg').Path);
let G = React.createFactory(require('react-native-svg').G);

module.exports = React.createClass({
    render: function () {
        return Svg(
            {
                width: 30,
                height: 26
            },
            G(
                {
                    fill: "none",
                    stroke: "#FFFFFF"
                },
                Path({
                    x: 1,
                    d: 'M0,6.69262695 L2.44366686e-17,4.00862948 C1.09406692e-17,2.89929405 0.900139441,2 2.00849661,2 L3.80810547,2 L24.0008384,2 C25.1049449,2 26,2.88967395 26,3.991155 L26,22.008845 C26,23.1085295 25.1050211,24 24.0029953,24 L1.99700466,24 C0.89408944,24 0,23.0999192 0,21.9993093 L0,6.69262695 Z'
                }),
                Path({
                    x: 9,
                    d: 'M1.5,4 L1.5,0'
                }),
                Path({
                    x: 16,
                    d: 'M1.5,4 L1.5,0'
                })
            )
        );
    }
});
