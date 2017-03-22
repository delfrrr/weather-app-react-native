/**
 * weather details for day
 * @module components/details
 */

const React = require('react');
const closeIcon = React.createFactory(require('./closeIcon'));
const date = React.createFactory(require('./date'));
const view = React.createFactory(require('react-native').View);
const {width, height, statusBarHeight} = require('../lib/getDimensions')();
const touchableOpacity = React.createFactory(
    require('react-native').TouchableOpacity
);
const locality = React.createFactory(require('./locality'));
const detailsTemperature = React.createFactory(require('./detailsTemperature'));
const detailsWind = React.createFactory(require('./detailsWind'));
const detailsPrecip = React.createFactory(require('./detailsPrecip'));
const detailsCloudCoverage = React.createFactory(require('./detailsCloudCoverage'));
const hourScale = React.createFactory(require('./hourScale'));
const connect = require('react-redux').connect;
const store = require('../reducers/main');
const background = React.createFactory(require('./background'));
const sliceDataPoints = require('../lib/sliceDataPoints');

module.exports = connect(
    function mapStateToProps(state) {
        let index = state.details;
        let dataPoints = [];
        if (typeof index === 'number') {
            dataPoints = sliceDataPoints(
                state.hourly[index],
                state.dates[index],
                state.timezones[index],
                state.currently[index]
            );
        }
        return {
            index,
            dataPoints
        };
    }
)(React.createClass({
    onClosePress() {
        store.closeDetails();
    },
    render() {
        const {
            index,
            dataPoints
        } = this.props;
        if (index === null) {
            return null;
        }
        return view(
            {
                style: {
                    position: 'absolute',
                    left: 0,
                    width,
                    top: 0,
                    height,
                    zIndex: 100
                }
            },
            background({index}),
            view(
                {
                    // blurType: 'dark',
                    style: {
                        flex: 1
                    }
                },
                touchableOpacity(
                    {
                        style: {
                            position: 'absolute',
                            zIndex: 2,
                            right: -2,
                            top: statusBarHeight,
                            width: 42,
                            height: 42,
                            justifyContent: 'center',
                            alignItems: 'center'
                        },
                        onPress: this.onClosePress
                    },
                    closeIcon()
                ),
                view(
                    {
                        style: {
                            flex: .35
                        }
                    },
                    view(
                        {
                            style: {
                                position: 'absolute',
                                bottom: -20,
                                left: 0,
                                right: 0,
                                zIndex: 2
                            }
                        },
                        date({
                            index,
                            opacity: 1
                        })
                    ),
                    locality({index})
                ),
                view(
                    {
                        style: {
                            flex: .65,
                            transform: [
                                // {scale: 0.9}//,
                                // {translateY: 20},
                                // {translateX: -20}
                            ],
                            justifyContent: 'flex-end'
                        }
                    },
                    view(
                        {
                            style: {height: 50}
                        },
                        detailsCloudCoverage({dataPoints})
                    ),
                    view(
                        {
                            style: {height: 50}
                        },
                        detailsPrecip({dataPoints})
                    ),
                    view(
                        {
                            style: {height: 50}
                        },
                        detailsWind({dataPoints})
                    ),
                    detailsTemperature({dataPoints}),
                    hourScale({hours: [2, 6, 10, 14, 18, 22]})
                )
            )
        );
    }
}));
