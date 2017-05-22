/**
 * store with in app purchases
 * @module components/inAppStore
 */

const React = require('react');
// const closeIcon = React.createFactory(require('./closeIcon'));
const text = React.createFactory(require('./text'));
const modal = React.createFactory(require('react-native').Modal);
const view = React.createFactory(require('react-native').View);
const {width, height, statusBarHeight} = require('../lib/getDimensions')();
const touchable = React.createFactory(
    require('react-native').TouchableWithoutFeedback
);
const connect = require('react-redux').connect;
const store = require('../reducers/main');

module.exports = connect(
    function mapStateToProps({
        inAppStore,
        forecastApiLimit,
        forecastApiRequests
    }) {
        return {
            inAppStore,
            requestLeft: forecastApiLimit - forecastApiRequests
        };
    }
)(React.createClass({
    render() {
        const {
            inAppStore,
            requestLeft
        } = this.props;
        if (!inAppStore) {
            return null;
        }
        return modal(
            {
                transparent: true,
                supportedOrientations: ['portrait'],
                animationType: 'fade'
            },
            view(
                {
                    style: {
                        flex: 1,
                        justifyContent: 'center',
                        padding: 20
                    }
                },
                touchable(
                    {
                        onPress: () => {
                            store.hideStore();
                        }
                    },
                    view(
                        {
                            style: {
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width,
                                height
                            }
                        }
                    )
                ),
                view(
                    {
                        style: {
                            borderRadius: 10,
                            backgroundColor: 'white',
                            padding: 20
                        }
                    },
                    view(
                        {
                            alignItems: 'center'
                        },
                        text(
                            {
                                style: {
                                    fontWeight: '200',
                                    color: 'black',
                                    fontSize: 40
                                }
                            },
                            requestLeft
                        ),
                        text(
                            {
                                style: {
                                    color: 'black',
                                    fontWeight: '200',
                                    fontSize: 20
                                }
                            },
                            'requests left'
                        ),
                        text(
                            {
                                style: {
                                    marginTop: 10,
                                    fontWeight: '200',
                                    color: 'black'
                                }
                            },
                            `Zowni app is powered by Dark Sky weather API, which is paid`
                        )
                    )
                )
            )
        )
    }
}));
