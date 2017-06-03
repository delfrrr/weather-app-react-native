/**
 * store with in app purchases
 * @module components/inAppStore
 */

const React = require('react');
// const closeIcon = React.createFactory(require('./closeIcon'));
const text = React.createFactory(require('./text'));
const modal = React.createFactory(require('react-native').Modal);
const view = React.createFactory(require('react-native').View);
const activityIndicator = React.createFactory(require('react-native').ActivityIndicator);
const {width, height, statusBarHeight} = require('../lib/getDimensions')();
const touchable = React.createFactory(
    require('react-native').TouchableWithoutFeedback
);
const touchableOpacity = React.createFactory(
    require('react-native').TouchableOpacity
);
const connect = require('react-redux').connect;
const store = require('../reducers/main');

module.exports = connect(
    function mapStateToProps({
        inAppStore,
        forecastApiLimit,
        forecastApiRequests,
        products
    }) {
        return {
            inAppStore,
            requestLeft: forecastApiLimit - forecastApiRequests,
            products
        };
    }
)(React.createClass({
    render() {
        const {
            inAppStore,
            requestLeft,
            products
        } = this.props;
        if (!inAppStore) {
            return null;
        }
        const shop = inAppStore === 'shop' || null;
        const leave = inAppStore === 'leave' || null;
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
                            padding: 20,
                            overflow: 'hidden',
                            alignItems: 'center'
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
                            'weather requests left'
                        ),
                        text(
                            {
                                style: {
                                    marginTop: 10,
                                    textAlign: 'center',
                                    fontWeight: '200',
                                    color: 'black'
                                }
                            },

                            // `Zowni app is powered by Dark Sky weather API. Unfortunatly, it is paid and cannot be used continuesly for free.`
                            shop ? `But good news is that you can increase your API qouta!` :
                            leave ? `Thank you for purhase! Enjoy the app!` : null
                        )
                    ),
                    shop && view(
                        {
                            style: {
                                height: 100,
                                justifyContent: 'center'
                            }
                        },
                        products && products.length ? products.map((p, key) => {
                            return view(
                                {
                                    key,
                                    style: {
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingLeft: 40,
                                        paddingRight: 40
                                    }
                                },
                                text(
                                    {
                                        style: {
                                            color: 'black',
                                            width: 140
                                        }
                                    },
                                    p.title
                                ),
                                touchableOpacity(
                                    {
                                        onPress: () => {
                                            store.purchaseProduct(
                                                p.identifier
                                            )
                                        }
                                    },
                                    text(
                                        {
                                            style: {
                                                width: 60,
                                                lineHeight: 25,
                                                borderRadius: 5,
                                                marginLeft: 20,
                                                textAlign: 'center',
                                                color: 'rgb(17, 107, 255)',
                                                borderWidth: 1,
                                                borderColor: 'rgb(17, 107, 255)'
                                            }
                                        },
                                        `${p.price}${p.currencySymbol}`
                                    )
                                ),
                            )
                        }) : activityIndicator()
                    ),
                    touchableOpacity(
                        {
                            onPress: () => {
                                store.hideStore();
                            }
                        },
                        text(
                            {
                                style: {
                                    marginTop: leave ? 20 : 0,
                                    color: 'rgb(17, 107, 255)',
                                    fontSize: 18
                                }
                            },
                            shop ? 'Later' : 'Continue'
                        )
                    )
                )
            )
        )
    }
}));
