/**
 * city selector
 * @module components/options
 */

const React = require('react');
const text = React.createFactory(require('./text'));
const nextIcon = React.createFactory(require('./nextIcon'));
const view = React.createFactory(require('react-native').View);
const switchCtl = React.createFactory(require('react-native').Switch);
const segmentedControlIOS = React.createFactory(
    require('react-native').SegmentedControlIOS
);
const {Linking, AlertIOS, Dimensions} = require('react-native');
const legend = React.createFactory(require('./legend'));
const connect = require('react-redux').connect;
const store = require('../reducers/main');
const touchableOpacity = React.createFactory(
    require('react-native').TouchableOpacity
);
const scrollView = React.createFactory(require('react-native').ScrollView);
const linearGradient = React.createFactory(
    require('react-native-svg').LinearGradient
);
const svg = React.createFactory(
    require('react-native-svg').Svg
);
const defs = React.createFactory(require('react-native-svg').Defs);
const stop = React.createFactory(require('react-native-svg').Stop);
const rect = React.createFactory(require('react-native-svg').Rect);
const {ShareDialog, MessageDialog, AppEventsLogger} = require('react-native-fbsdk');
const linkObj  = {
    contentType: 'link',
    contentUrl: 'http://zowni.com'
};
const reportError = require('../lib/reportError');

module.exports = connect(
    function mapStateToProps(state) {
        return {
            temperatureFormat: state.temperatureFormat,
            useApparentTemperature: state.useApparentTemperature,
            forecastApiRequests: state.forecastApiRequests
        }
    }
)(React.createClass({
    shareInMessanger: function () {
        Promise.all([
            MessageDialog.canShow(linkObj),
            ShareDialog.canShow(linkObj)
        ]).then(
            ([messanger, facebook]) => {
                if (messanger) {
                    return MessageDialog.show(linkObj);
                } else if (facebook) {
                    return ShareDialog.show(linkObj);
                } else {
                    AlertIOS.alert(
                        'Oh..',
                        'Looks like Facebook does not work for you.'
                    );
                }
            }
        ).then(result => {
            if (
                result &&
                !result.isCancelled
            ) {
                AlertIOS.alert('Thank you!');
                AppEventsLogger.logEvent('fbsharesuccessfull');
            } else {
                AlertIOS.alert('Thank you', 'for trying');
                AppEventsLogger.logEvent('fbsharetry');
            }
        }).catch(err => {
            reportError(err);
        });
    },
    render: function () {
        const {
            temperatureFormat,
            useApparentTemperature,
            // onCitySelectPress,
            forecastApiRequests
        } = this.props;
        const {width} = Dimensions.get('window');
        const rowStyle = {
            padding: 10,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 0,
            marginLeft: 20,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
            height: 50
        };
        return view(
            {
                style: {
                    height: 230
                }
            },
            view(
                {
                    style: {
                        flexDirection: 'row',
                        padding: 10,
                        paddingBottom: 0
                    }
                },
                legend()
            ),
            svg(
                {
                    width,
                    height: 20,
                    style: {
                        position: 'absolute',
                        top: 38,
                        left: 0,
                        right: 0,
                        height: 20,
                        zIndex: 2
                    }
                },
                defs(null,
                    linearGradient(
                        {
                            id: 'grad',
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 20
                        },
                        stop({
                            offset: String(1),
                            stopColor: 'black',
                            stopOpacity: 0
                        }),
                        stop({
                            offset: String(0),
                            stopColor: 'black',
                            stopOpacity: 1
                        })
                    )
                ),
                rect(
                    {x: 0, y: 0, width, height: 20, fill: 'url(#grad)'}
                )
            ),
            svg(
                {
                    width,
                    height: 20,
                    style: {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 20,
                        zIndex: 2
                    }
                },
                defs(null,
                    linearGradient(
                        {
                            id: 'grad',
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 20
                        },
                        stop({
                            offset: String(0),
                            stopColor: 'black',
                            stopOpacity: 0
                        }),
                        stop({
                            offset: String(1),
                            stopColor: 'black',
                            stopOpacity: 1
                        })
                    )
                ),
                rect(
                    {x: 0, y: 0, width, height: 20, fill: 'url(#grad)'}
                )
            ),
            scrollView(
                {
                    style: {
                        height: 192
                    },
                    contentContainerStyle: {
                        paddingTop: 10,
                        paddingBottom: 10
                    }
                },
                view(
                    {
                        style: [rowStyle]
                    },
                    view(
                        {style: {flex: 1}},
                        text({}, 'Temperature unit')
                    ),
                    segmentedControlIOS({
                        style: {width: 75},
                        tintColor: '#3599dd',
                        onChange: () => store.toggleTemperatureFormat(),
                        selectedIndex: temperatureFormat === 'C' ? 0 : 1,
                        values: ['C', 'F']
                    })
                ),
                view(
                    {
                        style: [rowStyle]
                    },
                    text({
                        style: {flex: 1}
                    }, 'Feels like'),
                    text(
                        {
                            style: {
                                marginRight: 10,
                                color: 'grey',
                                width: 100
                            }
                        },
                        useApparentTemperature ? 'Recommended' : ''
                    ),
                    switchCtl({
                        tintColor: '#3599dd',
                        onValueChange: (v) => store.setUseApparentTemperature(
                            Boolean(v)
                        ),
                        value: useApparentTemperature,
                        onTintColor: '#3599dd'
                    })
                ),
                view(
                    {
                        style: [rowStyle]
                    },
                    touchableOpacity(
                        {
                            style: {
                                flexDirection: 'row',
                                alignItems: 'center',
                                flex: 1
                            },
                            onPress: this.shareInMessanger
                        },
                        view(
                            {
                                style: {flex: 1}
                            },
                            text(
                                {style: {color: '#3599dd'}},
                                'Invite friends to test Zowni'
                            )
                        ),
                        nextIcon()
                    )
                ),
                view(
                    {
                        style: [rowStyle]
                    },
                    touchableOpacity(
                        {
                            style: {
                                flexDirection: 'row',
                                alignItems: 'center',
                                flex: 1
                            },
                            onPress () {
                                Linking.canOpenURL(
                                    'mailto:bilonenko.v@gmail.com'
                                ).then(supported => {
                                    if (supported) {
                                        Linking.openURL('mailto:bilonenko.v@gmail.com');
                                    } else {
                                        AlertIOS.alert(
                                            'Please, contact me directly to ' +
                                            'bilonenko.v@gmail.com'
                                        );
                                    }
                                })
                            }
                        },
                        view(
                            {
                                style: {flex: 1}
                            },
                            text({}, 'Report problem')
                        ),
                        nextIcon()
                    )
                ),
                view(
                    {
                        style: [rowStyle]
                    },
                    view(
                        {
                            style: {
                                flexDirection: 'row',
                                alignItems: 'center',
                                flex: 1
                            }
                        },
                        view(
                            {
                                style: {flex: 1}
                            },
                            text({}, 'Powered by Dark\u00A0Sky')
                        ),
                        view(
                            {
                                style: {marginRight: 0}
                            },
                            text(
                                {
                                    style: {color: 'grey'}
                                },
                                `${
                                    10000 - forecastApiRequests
                                } requests left`
                            )
                        ),
                        touchableOpacity(
                            {
                                style: {
                                    width: 48,
                                    height: 48,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: -5
                                },
                                onPress: () => {
                                    AlertIOS.alert(
                                        `Zowni app is powered by Dark Sky weather API, which is paid. Beta test edition includes 10000 API request quota. In public version I will offer some way to extend API quota.`
                                    );
                                }
                            },
                            text(
                                {
                                    style: {
                                        width: 24,
                                        height: 24,
                                        borderRadius: 12,
                                        borderWidth: 1,
                                        borderStyle: 'solid',
                                        borderColor: '#3599dd',
                                        color: '#3599dd',
                                        textAlign: 'center',
                                        lineHeight: 24
                                    }
                                },
                                'i'
                            )
                        )
                    )
                )
            )
        );
    }
}));
