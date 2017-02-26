/**
 * @module components/hourScale
 */

'use strict';

const React = require('react');
const view = React.createFactory(require('react-native').View);
const text = React.createFactory(require('./text'));

module.exports = React.createClass({
    render() {
        const {hours} = this.props;
        return view(
            {
                style: {
                    position: 'absolute',
                    bottom: 5,
                    left: 0,
                    right: 0,
                    height: 15,
                    flexDirection: 'row'
                }
            },
            hours.map((h, key) => {
                let sufix = '';
                if (key === 0 || key === hours.length - 1 ) {
                    sufix = 'h';
                }
                return text(
                    {
                        key,
                        style: {
                            flex: 1,
                            textAlign: 'center',
                            height: 15,
                            lineHeight: 15,
                            fontSize: 10
                        }
                    },
                    h + sufix
                );
            })
        )
    }
});
