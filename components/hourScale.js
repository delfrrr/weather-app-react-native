/**
 * @module components/hourScale
 */

'use strict';

const React = require('react');
const view = React.createFactory(require('react-native').View);
const text = React.createFactory(require('./text'));
const connect = require('react-redux').connect;
module.exports = connect((state) => {
    const {is12h} = state;
    return {
        is12h
    };
})(React.createClass({
    render() {
        const {hours, is12h} = this.props;
        if (is12h === null) {
            return null;
        }
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
                let prefix = String(h);
                if (is12h) {
                    if (h <= 12) {
                        sufix = 'am';
                    } else {
                        sufix = 'pm';
                    }
                    prefix = String(h % 12);
                } else {
                    if (
                        key === 0 ||
                        key === hours.length - 1
                    ) {
                        sufix = 'h';
                    }
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
                    prefix + sufix
                );
            })
        )
    }
}));
