/**
 * menu icon
 * @module menu icon
 */

'use strict';

let React = require('react');
let svg = React.createFactory(require('react-native-svg').Svg);
let path = React.createFactory(require('react-native-svg').Path);
let g = React.createFactory(require('react-native-svg').G);

module.exports = React.createClass({
    render() {
        let y = 1;
        let d = 4;
        return svg(
            {
                width: 22,
                height: 22
            },
            g(
                {
                    stroke: 'white',
                    strokeWidth: 1
                },
                path({
                    y: (y+=d),
                    d: 'M0,0 L22,0'
                }),
                path({
                    y: (y+=d),
                    d: 'M0,0 L22,0'
                }),
                path({
                    y: (y+=d),
                    d: 'M0,0 L22,0'
                }),
                path({
                    y: (y+=d),
                    d: 'M0,0 L22,0'
                })
            )
        );
    }
});
