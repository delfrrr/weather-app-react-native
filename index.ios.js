/**
 * @file entry point for ios app
 */

const React = require('react');
const {AppRegistry, StyleSheet} = require('react-native');
const getDimensions = require('./lib/getDimensions');
const scrollView = React.createFactory(require('react-native').ScrollView);
const View = React.createFactory(require('react-native').View);
const touchableOpacity = React.createFactory(
    require('react-native').TouchableOpacity
);
const Provider = React.createFactory(require('react-redux').Provider);
const store = require('./reducers/main');
const locality = React.createFactory(require('./components/locality'));
const column = React.createFactory(require('./components/column'));
const dateSelect = React.createFactory(require('./components/dateSelect'));
const background = React.createFactory(require('./components/background'));
const next = React.createFactory(require('./components/next'));
const menuIcon = React.createFactory(require('./components/menuIcon'));
const locationIcon = React.createFactory(require('./components/locationIcon'));
const reload = React.createFactory(require('./components/reload'));
const citySelect = React.createFactory(require('./components/city-select'));
const details = React.createFactory(require('./components/details'));
const options = React.createFactory(require('./components/options'));
const styles = StyleSheet.create({
    header: {
        flex: 0.35
    },
    body: {
        flex: 0.65,
        flexDirection: 'row',
        flexWrap: 'nowrap'
    }
});

let {scaleLinear} = require('d3-scale');
function getScrollOpacity(height, verticalScroll) {
    let scrollOpacityScale = scaleLinear()
        .domain([-10000, 0, height, 10000])
        .range([0, 0, 1, 1]);
    let d = height - verticalScroll;
    return scrollOpacityScale(d);
}

let zowninative = React.createClass({
    getInitialState: function () {
        return {
            scrollEnabled: true,
            menuOpen: false,
            refreshing: false,
            scroll: 0,
            verticalScroll: 0
        };
    },

    componentWillMount: function () {
        store.loadState();
    },
    componentDidUpdate: function () {
        let {scrollEnabled} = this.state;
        if (!scrollEnabled) {
            setTimeout(() => {
                this.setState({scrollEnabled: true})
            }, 500);
        }
    },
    onCitySelectPress: function () {
        if (this.verticalScrollView) {
            setTimeout(() => {
                this.verticalScrollView.scrollTo({
                    x: 0,
                    y: 0
                });
            }, 500);
        }
    },
    onMenuPress: function () {
        this.verticalScrollView.scrollTo({x: 0, y: 230})
    },
    onLocationPress: function () {
        store.toggleCitySelect();
    },
    onVerticalScroll: function ({nativeEvent}) {
        const {scrollEnabled} = this.state;
        const y = nativeEvent.contentOffset.y;
        this.setState({verticalScroll: y});
        if (
            y < -70 &&
            this.verticalScrollView &&
            scrollEnabled
        ) {
            this.setState({
                scrollEnabled: false
            });
            store.initDates();
            this.verticalScrollView.scrollTo({x: 0, y: 0});
        }
    },
    onHorizontalScroll: function ({nativeEvent}) {
        const {scrollEnabled} = this.state;
        let x  = Math.abs(nativeEvent.contentOffset.x);
        this.setState({scroll: nativeEvent.contentOffset.x});
        if (
            x > 50 &&
            this.horizontalScrollView &&
            scrollEnabled
        ) {
            store.slideDates(nativeEvent.contentOffset.x);
            this.setState({
                scrollEnabled: false
            })
            this.horizontalScrollView.scrollTo({x: 0, y: 0});
        }
    },
    render: function () {
        let {scrollEnabled, scroll, verticalScroll} = this.state;
        let {width, viewHeight, statusBarHeight} = getDimensions();
        return Provider(
            {store},
            View(
                {
                    style: {
                        flex: 1,
                        backgroundColor: 'black'
                    }
                },
                scrollView(
                    {
                        style: {
                            width,
                            height: viewHeight//,
                            // marginTop: statusBarHeight
                        },
                        scrollEnabled,
                        directionalLockEnabled: true,
                        snapToInterval: 230,
                        ref: ref => {this.verticalScrollView = ref},
                        showsVerticalScrollIndicator: false,
                        onScroll: this.onVerticalScroll,
                        scrollEventThrottle: scrollEnabled ? 16 : 50
                    },
                    View(
                        {
                            style: {
                                width,
                                height: viewHeight
                            }
                        },
                        reload({scroll: verticalScroll}),
                        scrollView(
                            {
                                scrollEnabled,
                                horizontal: true,
                                ref: ref => {this.horizontalScrollView = ref},
                                onScroll: this.onHorizontalScroll,
                                directionalLockEnabled: true,
                                scrollEventThrottle: scrollEnabled ? 16 : 50,
                                style: {
                                    width,
                                    height: viewHeight
                                }
                            },
                            next({
                                index: 0,
                                scroll
                            }),
                            next({
                                index: 1,
                                scroll
                            }),
                            background(),
                            View(
                                {
                                    style: {
                                        position: 'absolute',
                                        width,
                                        height: viewHeight
                                    }
                                },
                                View(
                                    {
                                        position: 'absolute',
                                        top: statusBarHeight,
                                        opacity: getScrollOpacity(20, verticalScroll),
                                        left: -2,
                                        right: -2,
                                        height: 42,
                                        zIndex: 2,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between'
                                    },
                                    touchableOpacity(
                                        {
                                            style: {
                                                width: 42,
                                                height: 42,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            },
                                            onPress: this.onMenuPress
                                        },
                                        menuIcon()
                                    ),
                                    touchableOpacity(
                                        {
                                            style: {
                                                width: 42,
                                                height: 42,
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            },
                                            onPress: this.onLocationPress
                                        },
                                        locationIcon()
                                    )
                                ),
                                View(
                                    {
                                        style: [
                                            styles.header,
                                            {opacity: getScrollOpacity(
                                                80,
                                                verticalScroll
                                            )}
                                        ]
                                    },
                                    locality()
                                ),
                                View(
                                    {
                                        style: styles.body
                                    },
                                    column({
                                        index: 0,
                                        dateOpacity: getScrollOpacity(
                                            viewHeight * 0.3,
                                            verticalScroll
                                        )
                                    }),
                                    column({
                                        index: 1,
                                        dateOpacity: getScrollOpacity(
                                            viewHeight * 0.3,
                                            verticalScroll
                                        )
                                    })
                                )
                            ),
                            details()
                        )
                    ),
                    options({
                        onCitySelectPress: this.onCitySelectPress
                    })
                ),
                dateSelect(),
                citySelect()
            )
        );
    }
});

AppRegistry.registerComponent('zowninative', () => zowninative);
