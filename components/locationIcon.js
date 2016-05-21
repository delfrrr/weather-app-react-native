/**
 * location icon
 * @module location icon
 */

'use strict';

let React = require('react');
let svg = React.createFactory(require('react-native-svg').Svg);
let path = React.createFactory(require('react-native-svg').Path);

module.exports = React.createClass({
    render() {
        return svg(
            {
                width: 22,
                height: 22,
                viewBox: '0 0 32 32'
            },
            path({
                fill: 'white',
                d: 'M16.53 8.327c-2.077 0-3.77 1.656-3.77 3.69 0 2.036 1.693 3.692 3.77 3.692 2.08 0 3.77-1.657 3.77-3.692s-1.69-3.69-3.77-3.69zm0 6.328c-1.484 0-2.692-1.183-2.692-2.637s1.208-2.636 2.693-2.636 2.693 1.182 2.693 2.636c0 1.454-1.208 2.637-2.692 2.637z'
            }),
            path({
                fill: 'white',
                d: 'M23.737 4.962C21.787 3.052 19.193 2 16.435 2s-5.35 1.052-7.3 2.962c-3.61 3.533-4.06 10.182-.973 14.21l8.273 11.7 8.26-11.683c3.1-4.046 2.65-10.695-.958-14.228zm.086 13.61L16.435 29.02l-7.4-10.464c-2.798-3.655-2.397-9.66.86-12.85 1.748-1.71 4.07-2.65 6.54-2.65 2.47 0 4.793.94 6.54 2.65 3.258 3.19 3.66 9.195.848 12.867z'
            })
        );
    }
});
