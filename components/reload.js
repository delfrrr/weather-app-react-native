/**
 * refresh control
 * @module next
 */

'use strict';

let React = require('react');
const getDimensions = require('../lib/getDimensions');
let view = React.createFactory(require('react-native').View);
let text = React.createFactory(require('./text'));
let {scaleLinear} = require('d3-scale');
let getOpacity = scaleLinear()
    .domain([0, 20, 50, Infinity])
    .range([0, 0.5, 1, 1]);
module.exports = React.createClass({
    render: function () {
        const {viewHeight, statusBarHeight} = getDimensions();
        const {scroll} = this.props;
        const scrollAbs = Math.max(Math.abs(scroll) - statusBarHeight, 0);
        return view(
            {
                style: {
                    position: 'absolute',
                    opacity: getOpacity(scrollAbs),
                    bottom: viewHeight,
                    left: 0,
                    right: 0,
                    height: scrollAbs,
                    justifyContent: 'center',
                    alignItems: 'center'
                }
            },
            text(
                {
                    style: {
                    }
                },
                'RELOAD'
            )
        );
    }
});
