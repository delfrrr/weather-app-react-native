/**
 * next/prev icon
 * @module next
 */

'use strict';

let React = require('react');
let {Dimensions} = require('react-native');
let view = React.createFactory(require('react-native').View);
let text = React.createFactory(require('./text'));
let svg = React.createFactory(require('react-native-svg').Svg);
let path = React.createFactory(require('react-native-svg').Path);
let g = React.createFactory(require('react-native-svg').G);
let {scaleLinear} = require('d3-scale');

const size = 32;

let getOpacity = scaleLinear()
    .domain([0, size, 50, Infinity])
    .range([0, 0.5, 1, 1]);
module.exports = React.createClass({
    render: function () {
        let {width, height} = Dimensions.get('window');
        const {scroll, index} = this.props;
        let scrollAbs = Math.abs(scroll);
        let scale = 1;
        let left = index ? width : -scrollAbs;
        return view(
            {
                style: {
                    position: 'absolute',
                    opacity: getOpacity(scrollAbs),
                    left,
                    top: height * 0.5 - 16,
                    width: scrollAbs,
                    alignItems: 'center'
                }
            },
            view(
                {
                    style: {
                        height: size,
                        width: size,
                        transform: [
                            {
                                'scale': scale
                            }
                        ]
                    }
                },
                text({
                    style: {
                        position: 'absolute',
                        fontSize: 9,
                        width: size,
                        textAlign: 'center',
                        left: index ? -1 : 2,
                        lineHeight: size
                    }
                }, '24h'),
                svg(
                    {
                        width: size,
                        height: size
                    },
                    g(
                        {
                            fill: 'white',
                            strokeWidth: 0
                        },
                        index ?
                        path({d: 'M15 29C7.832 29 2 23.168 2 16S7.832 3 15 3s13 5.832 13 13c0 .41-.332.743-.743.743-.41 0-.744-.332-.744-.743 0-6.35-5.165-11.515-11.514-11.515C8.65 4.485 3.483 9.65 3.483 16c0 6.35 5.165 11.514 11.515 11.514 4.06 0 7.866-2.177 9.93-5.682.208-.354.663-.47 1.016-.262.354.207.47.663.264 1.017C23.882 26.542 19.586 29 15 29z'}) :
                        path({d: 'M17 29c7.168 0 13-5.832 13-13S24.168 3 17 3 4 8.832 4 16c0 .41.332.743.743.743.41 0 .744-.332.744-.743C5.487 9.65 10.652 4.485 17 4.485c6.35 0 11.516 5.166 11.516 11.515 0 6.35-5.165 11.514-11.515 11.514-4.06 0-7.866-2.177-9.93-5.682-.208-.354-.663-.47-1.016-.262-.354.207-.47.663-.264 1.017C8.118 26.542 12.414 29 17 29z'}),
                        index ?
                        path({d: 'M27.31 17c-.127 0-.255-.035-.37-.107l-4.58-2.846c-.348-.216-.464-.688-.258-1.054.205-.365.653-.487 1-.27l3.997 2.483 2.57-3.877c.232-.35.687-.434 1.017-.192.33.243.412.722.182 1.07l-2.96 4.462c-.143.214-.37.33-.6.33z'}) :
                        path({d: 'M4.69 17c.127 0 .255-.035.37-.107l4.58-2.846c.348-.216.464-.688.258-1.054-.205-.365-.653-.487-1-.27L4.9 15.206 2.33 11.33c-.232-.35-.687-.434-1.017-.192-.33.243-.412.722-.182 1.07l2.96 4.462c.143.214.37.33.6.33z'})
                    )
                )
            )
        );
    }
});
