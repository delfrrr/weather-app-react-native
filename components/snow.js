/**
 * snow icon
 * @module snow
 */

'use strict';

let React = require('react');
let View = React.createFactory(require('react-native').View);
let Svg = React.createFactory(require('react-native-svg').Svg);
let Path = React.createFactory(require('react-native-svg').Path);
let G = React.createFactory(require('react-native-svg').G);

module.exports = React.createClass({
    getInitialState: function () {
        return {
            snow: false
        }
    },
    componentWillMount: function () {
        const {dataPoints} = this.props;
        let snowPoints = dataPoints.filter((p) => {
            return p.icon.match('snow');
        });
        if (snowPoints.length) {
            this.setState({snow: true});
        }
    },
    render: function () {
        let {snow} = this.state;
        if (!snow) {
            return null;
        }
        return View(
            {
                style: {
                    // backgroundColor: 'gold',
                    height: 32,
                    alignItems: 'center'
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
                    Path({d: 'M16,4 L16,13'}),
                    Path({d: 'M16,27 L16,18'}),
                    G(
                        {
                            rotate: 240,
                            originX: 16,
                            originY: 16
                        },
                        Path({d: 'M16,4 L16,13'}),
                        Path({d: 'M16,27 L16,18'})
                    ),
                    G(
                        {
                            rotate: 120,
                            originX: 16,
                            originY: 16
                        },
                        Path({d: 'M16,4 L16,13'}),
                        Path({d: 'M16,27 L16,18'})
                    )
                )

            )
        );
    }
});
