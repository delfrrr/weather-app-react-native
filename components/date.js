/**
 * @module components/date
 */

let React = require('react');
const {AppState} = require('react-native');
let View = React.createFactory(require('react-native').View);
let TouchableOpacity = React.createFactory(require('react-native').TouchableOpacity);
let text = React.createFactory(require('./text'));
let calendarIcon = React.createFactory(require('./calendarIcon'));
let connect = require('react-redux').connect;
let store = require('../reducers/main');
let moment = require('moment-timezone');
// let {scaleLinear} = require('d3-scale');

// let opacityScale = scaleLinear()
//     .domain([-Infinity, 0, 230])
//     .range([1, 1, 0])

/**
 * @param {Date} date
 * @param {string} timezone
 * @returns {String}
 */
function formatDate (date, timezone) {
    const dateMoment = moment(date).tz(timezone);
    const currentMoment = moment();
    if (dateMoment.year() === currentMoment.year()) {
        return dateMoment.calendar(null, {
            lastDay: '[Yesterday]',
            sameDay: '[Today]',
            nextDay: '[Tomorrow]',
            nextWeek: 'dddd',
            lastWeek: 'dddd',
            sameElse: 'MMMM'
        });
    } else {
        return dateMoment.calendar(null, {
            lastDay: '[Yesterday]',
            sameDay: '[Today]',
            nextDay: '[Tomorrow]',
            nextWeek: 'MMMM YYYY',
            lastWeek: 'MMMM YYYY',
            sameElse: 'MMMM YYYY'
        });
    }
}

module.exports = connect(
    (state) => {
        return {
            dates: state.dates,
            timezones: state.timezones
        }
    },
    () => {
        return {
            onPress: function () {
                store.requestDateInput(this.props.index)
            }
        }
    }
)(React.createClass({
    componentWillMount: function () {
        AppState.addEventListener('change', e => {
            if (e === 'active') {
                this.forceUpdate();
            }
        });
    },
    render: function () {
        const {timezones, index, dates, opacity} = this.props;
        const date = dates[index];
        return TouchableOpacity(
            {
                onPress: this.props.onPress.bind(this),
                style: {opacity}
            },
            View(
                {
                    style: {
                        alignItems: 'center',
                        opacity
                    }
                },
                calendarIcon(),
                View(
                    {
                        left: -2,
                        top: 5,
                        right: 0,
                        position: 'absolute',
                        justifyContent: 'center',
                        alignItems: 'center'
                    },
                    text(
                        null,
                        moment.tz(date, timezones[index]).date()
                    )
                ),
                text(null, formatDate(date, timezones[index]))
            )
        );
    }
}));
