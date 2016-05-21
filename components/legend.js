/**
 * temperature legend
 * @module components/legend
 */

const React = require('react');
const view = React.createFactory(require('react-native').View);
const text = React.createFactory(require('./text'));
const connect = require('react-redux').connect;
const temperatureColor = require('../lib/temperature-color');
const formatTemperature = require('../lib/format-temperature');

/**
 * returns temperature domain with pretty numbers
 * @param  {string} temperatureFormat
 * @return {number[]}
 */
function getDomain(temperatureFormat) {
    const domain = temperatureColor.domain().slice(1, -1); //drop first and last
    if (temperatureFormat === 'F') {
        return domain.map(tC => {
            let tF = tC * 1.8 + 32;
            return Math.round(tF / 5) * 5;
        });
    } else {
        return domain;
    }
}

/**
 * @param  {number} t temperature C or F
 * @param  {string} temperatureFormat
 * @return {string} color
 */
function getColor(t, temperatureFormat) {
    if (temperatureFormat === 'F') {
        return temperatureColor((t - 32) / 1.8);
    } else {
        return temperatureColor(t);
    }
}

module.exports = connect(
    function mapStateToProps(state) {
        return {
            temperatureFormat: state.temperatureFormat
        }
    }
)(React.createClass({
    render: function () {
        const {temperatureFormat} = this.props;
        const domain = getDomain(temperatureFormat);
        return view(
            {
                flex: 1,
                height: 28
            },
            view(
                {
                    style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        flexDirection: 'row',
                        height: 28
                    }
                },
                domain.map((t) => {
                    return view(
                        {
                            key: t,
                            style: {
                                flex: 1,
                                height: 28,
                                backgroundColor: getColor(t, temperatureFormat)
                            }
                        }
                    );
                })
            ),
            view(
                {
                    style: {
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        flexDirection: 'row',
                        height: 28
                    }
                },
                domain.map((t) => {
                    return text(
                        {
                            key: t,
                            style: {
                                flex: 1,
                                lineHeight: 28,
                                fontSize: 12,
                                textAlign: 'center'
                            }
                        },
                        formatTemperature(t, 'C') // becouse temp is already converted
                    );
                })
            )
        );
    }
}));
