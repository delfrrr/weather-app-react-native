/**
 * city item in city select
 * @module components/cityItem
 */

'use strict'
const React = require('react');
const {Dimensions, LayoutAnimation} = require('react-native');
const text = React.createFactory(require('./text'));
const selectIcon = React.createFactory(require('./selectIcon'));
const view = React.createFactory(require('react-native').View);
const store = require('../reducers/main');
const scrollView = React.createFactory(require('react-native').ScrollView);
const touchableHighlight = React.createFactory(
    require('react-native').TouchableHighlight
);

module.exports = React.createClass({
    getInitialState() {
        return {
            scrollEnabled: true
        }
    },
    componentDidUpdate() {
        const {scrollEnabled} = this.state;
        // const {selected} = this.props;
        if (!scrollEnabled) {
            setTimeout(() => {
                this.setState({
                    scrollEnabled: true
                })
            }, 500);
        }
    },
    render() {
        const {width} = Dimensions.get('window');
        const {scrollEnabled} = this.state;
        const {feature, selected, editDisabled} = this.props;
        const localityAr = feature.properties.label.split(',');
        return view(
            null,
            scrollView(
                {
                    horizontal: true,
                    pagingEnabled: true,
                    scrollEnabled,
                    showsHorizontalScrollIndicator: false,
                    ref: ref => {this.scrollViewInstance = ref},
                    onScroll: ({nativeEvent}) => {
                        if (!scrollEnabled) {
                            return;
                        }
                        let x  = nativeEvent.contentOffset.x;
                        if (editDisabled) {
                            if (Math.abs(x) > 30) {
                                this.setState({scrollEnabled: false});
                                this.scrollViewInstance.scrollTo({x: 0, y: 0});
                            }
                        } else {
                            if (x >= width) {
                                LayoutAnimation.configureNext(
                                    LayoutAnimation.create(250, 'linear', 'scaleXY')
                                );
                                store.removeLocality(feature);
                            }
                        }
                    },
                    scrollEventThrottle: 50
                },
                view(
                    {
                        style: {
                            height: 50,
                            flex: 1,
                            width,
                            flexDirection: 'row'
                        }
                    },
                    touchableHighlight(
                        {
                            style: {
                                flex: 1
                            },
                            underlayColor: 'rgba(0, 0, 0, 0.1)',
                            onPress: () => {
                                store.toggleSelectedLoacality(feature);
                            }
                        },
                        view(
                            {
                                flexDirection: 'row'
                            },
                            view(
                                {
                                    style: {
                                        position: 'relative',
                                        top: 3
                                    }
                                },
                                selectIcon({selected})
                            ),
                            view(
                                {
                                    style: {
                                        flex: 1,
                                        height: 50,
                                        paddingRight: 10,
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        borderBottomWidth: 1,
                                        borderBottomColor: 'rgba(255, 255, 255, 0.1)'
                                    }
                                },
                                text(
                                    {
                                        style: {
                                            fontSize: 18
                                        },
                                        ellipsizeMode: 'middle',
                                        numberOfLines: 1
                                    },
                                    localityAr[0].trim()
                                ),
                                text(
                                    {
                                        style: {
                                            // lineHeight: 20,
                                            fontSize: 10
                                        },
                                        ellipsizeMode: 'middle',
                                        numberOfLines: 1
                                    },
                                    localityAr.slice(1).join(',').trim()
                                )
                            )
                        )
                    )
                ),
                view(
                    {
                        style: {
                            backgroundColor: '#ff5053',
                            height: 50,
                            paddingLeft: 10,
                            width//,
                            // position: 'absolute',
                            // left: width
                        }
                    },
                    text(
                        {
                            style: {
                                lineHeight: 50,
                                fontSize: 16
                            }
                        },
                        'Delete'
                    )
                )
            )
        );
    }
});
