/**
 * date selector
 * @module components/dateSelect
 */

const React = require('react');
const View = React.createFactory(require('react-native').View);
const text = React.createFactory(require('./text'));
const moment = require('moment-timezone');
const TouchableOpacity = React.createFactory(require('react-native').TouchableOpacity);
const picker = React.createFactory(require('react-native').Picker);
const pickerItem = React.createFactory(require('react-native').Picker.Item);
const segmentedControlIOS = React.createFactory(
    require('react-native').SegmentedControlIOS
);

//@see https://github.com/facebook/react-native/issues/4547
const DatePickerIOS = require('react-native').DatePickerIOS;
DatePickerIOS.propTypes.date = React.PropTypes.any.isRequired;
DatePickerIOS.propTypes.minimumDate = React.PropTypes.any.isRequired;
DatePickerIOS.propTypes.maximumDate = React.PropTypes.any.isRequired;
DatePickerIOS.propTypes.timeZoneOffsetInHours = React.PropTypes.any;
DatePickerIOS.propTypes.onDateChange = React.PropTypes.func;

const datePicker = React.createFactory(DatePickerIOS);
const connect = require('react-redux').connect;
const store = require('../reducers/main');

const HEIGHT = 256;
const RANGE = [-30, 7];

/**
 * @param {Date} date
 * @param {string} timezone
 * @returns {String}
 */
function formatDate(date, timezone) {
    return moment(date).tz(timezone).calendar(null, {
        lastDay: '[Yesterday], D MMM',
        sameDay: '[Today], D MMM',
        nextDay: '[Tomorrow], D MMM',
        nextWeek: 'ddd, D MMM',
        lastWeek: 'ddd, D MMM',
        sameElse: 'ddd, D MMM'
    });
}

module.exports = connect(
    function mapStateToProps(state) {
        return {
            show: state.dateSelect,
            dates: state.dates,
            timezones: state.timezones
        };
    },
    function mapDispatchToProps() {
        //TODO: does not make sence to keep it here
        //if I dont use dipspatch
        return {
            onDateChange: function (date) {
                let normDate = date;
                if (typeof(normDate) === 'number') {
                    normDate = this.moment().add(date, 'days').toDate();
                }
                store.setDate(this.props.show.index, normDate);
            },
            onDone: function () {
                store.closeDateInput();
            },
            setToday: function () {
                store.setDate(
                    this.props.show.index,
                    this.moment().startOf('day').toDate()
                );
            },
            triggerCalendar: function () {
                this.setState({
                    datePicker: !this.state.datePicker
                })
            }
        }
    }
)(React.createClass({
    getInitialState: function () {
        return {
            bottom: -HEIGHT,
            datePicker: false
        }
    },
    componentWillReceiveProps: function (props) {
        let {show} = props;
        this.setState({bottom: show ? 0 : -HEIGHT});
    },
    moment: function (date) {
        date = date || new Date();
        const {timezones, show} = this.props;
        const timezone = show ? timezones[show.index] : timezones[0];
        return moment.tz(date, timezone);
    },
    render: function () {
        const {show, timezones} = this.props;
        let items = [];
        let selectedValue = 0;
        let timezone = timezones[0];
        if (show) {
            timezone = timezones[show.index];
            let selectedMoment = this.moment(
                this.props.dates[this.props.show.index]
            ).startOf('day');
            let currentMoment = this.moment().startOf('day');
            selectedValue = Math.round(
                (selectedMoment - currentMoment) / 1000 / 3600/ 24
            );
            if (
                selectedValue < RANGE[0] ||
                selectedValue > RANGE[1]
            ) {
                selectedValue = 0;
            }
            for (let i = RANGE[0]; i <= RANGE[1]; i++) {
                items.push(pickerItem({
                    key: i,
                    value: i,
                    label: formatDate(
                        currentMoment.clone().add(i, 'days'),
                        timezone
                    )
                }));
            }
        }
        const tz = moment.tz.zone(timezone).offset(Date.now()) / 60;
        return View(
            {
                style: {
                    position: 'absolute',
                    bottom: this.state.bottom,
                    left: 0,
                    right: 0,
                    backgroundColor: 'white'
                }
            },
            View(
                {
                    style: {
                        height: 40,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }
                },
                TouchableOpacity(
                    {onPress: this.props.setToday.bind(this)},
                    text(
                        {
                            style: {
                                lineHeight: 40,
                                fontSize: 18,
                                paddingLeft: 10,
                                paddingRight: 10
                            },
                            class: 'link'
                        },
                        'Today'
                    )
                ),
                segmentedControlIOS({
                    style: {width: 150},
                    tintColor: 'rgb(17, 107, 255)',
                    onChange: () => this.props.triggerCalendar.call(this),
                    selectedIndex: this.state.datePicker ? 1 : 0,
                    values: ['Recent', 'Calendar']
                }),
                TouchableOpacity(
                    {onPress: this.props.onDone.bind(this)},
                    text(
                        {
                            style: {
                                lineHeight: 40,
                                fontSize: 18,
                                paddingLeft: 10,
                                paddingRight: 10
                            },
                            class: 'link'
                        },
                        'Done'
                    )
                )
            ),
            this.props.show &&
            !this.state.datePicker &&
            picker(
                {
                    style: {
                        backgroundColor: 'rgb(243, 243, 243)'
                    },
                    onValueChange: this.props.onDateChange.bind(this),
                    selectedValue
                },
                items
            ),
            this.props.show &&
            this.state.datePicker &&
            datePicker({
                style: {
                    backgroundColor: 'rgb(243, 243, 243)'
                },
                date: this.props.dates[this.props.show.index],
                mode: 'date',
                onDateChange: this.props.onDateChange.bind(this),
                minimumDate: this.moment().add(-5, 'years').toDate(),
                maximumDate: this.moment().add(7, 'days').toDate(),
                timeZoneOffsetInHours: -tz
            })
        );
    }
}));
