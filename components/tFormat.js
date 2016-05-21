/**
 * swithcher for Celsius / Farenheit
 * @module components/tFormat
 */

const React = require('react');
const text = React.createFactory(require('./text'));
const connect = require('react-redux').connect;
const legend = React.createFactory(require('./legend'));
const touchableOpacity = React.createFactory(
    require('react-native').TouchableOpacity
);
const store = require('../reducers/main');

const textStyle = {
    padding: 2,
    fontSize: 18,
    lineHeight: 28,
    color: '#999999',
    fontWeight: '400'
};

const highlightStyle = {
    color: 'white'
};

module.exports = connect(
    function mapStateToProps(state) {
        return {
            temperatureFormat: state.temperatureFormat
        }
    }
)(React.createClass({
    render: function () {
        const {temperatureFormat} = this.props;
        return touchableOpacity(
            {
                style: {
                    flexDirection: 'row',
                    paddingLeft: 10,
                    paddingRight: 10
                },
                onPress: () => store.toggleTemperatureFormat()
            },
            legend(),
            text(
                {
                    style: [
                        textStyle, (temperatureFormat === 'C') && highlightStyle
                    ]
                },
                '°C'
            ),
            text(
                {
                    style: {
                        fontSize: 24,
                        lineHeight: 28,
                        fontWeight: '100',
                        color: '#999999'
                    }
                },
                '/'
            ),
            text(
                {
                    style: [
                        textStyle, (temperatureFormat === 'F') && highlightStyle
                    ]
                },
                '°F'
            )
        );
    }
}));
