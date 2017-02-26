/**
 * close icon
 * @module closeIcon
 */

'use strict';

let React = require('react');
let svg = React.createFactory(require('react-native-svg').Svg);
let path = React.createFactory(require('react-native-svg').Path);
let g = React.createFactory(require('react-native-svg').G);

module.exports = React.createClass({
    render() {
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
                    d: 'M2,2 L20,20'
                }),
                path({
                    d: 'M20,2 L2,20'
                })
            )
        );
    }
});
