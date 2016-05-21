/**
 * city selector
 * @module components/citySelect
 */

const React = require('react');
const {Dimensions} = require('react-native');
const text = React.createFactory(require('./text'));
const textInput = React.createFactory(require('react-native').TextInput);
const view = React.createFactory(require('react-native').View);
const scrollView = React.createFactory(require('react-native').ScrollView);
const blurView = React.createFactory(
    require('react-native-blur').BlurView
);
const touchableOpacity = React.createFactory(
    require('react-native').TouchableOpacity
);
const touchableHighlight = React.createFactory(
    require('react-native').TouchableHighlight
);
const connect = require('react-redux').connect;
const store = require('../reducers/main');
const cityItem = React.createFactory(require('./cityItem'));

module.exports = connect(
    function mapStateToProps(state) {
        return {
            citySelect: state.citySelect,
            citySearchResult: state.citySearchResult,
            localities: state.localities,
            selectedLoacalitiesObj: state.selectedLoacalities.filter(Boolean).reduce(
                (
                    selectedLoacalitiesObj, feature
                ) => {
                    selectedLoacalitiesObj[feature.properties.id] = 1;
                    return selectedLoacalitiesObj;
                }, {}
            )
        };
    }
)(React.createClass({
    getInitialState: function () {
        return {
            searchFocused: false,
            inputValue: ''
        }
    },
    componentDidUpdate: function (prevProps) {
        let {searchFocused, inputValue} = this.state;
        let {citySearchResult} = this.props;
        if (
            searchFocused &&
            Boolean(inputValue) &&
            citySearchResult !== prevProps.citySearchResult
        ) {
            //scroll search view to top when new results
            this.searchScrollViewInstance.scrollTo({x: 0, y: 0});
        }
    },
    render: function () {
        const {height} = Dimensions.get('window');
        const {
            citySelect,
            citySearchResult,
            localities,
            selectedLoacalitiesObj
        } = this.props;
        const {searchFocused, inputValue} = this.state;
        const top = citySelect ? 0 : -height;
        return blurView(
            {
                blurType: 'dark',
                style: {
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top,
                    height
                }
            },
            view(
                {
                    style: {
                        paddingTop: 30,
                        paddingLeft: 10,
                        paddingRight: 0,
                        height: 70,
                        flexDirection: 'row'
                    }
                },
                textInput(
                    {
                        style: {
                            flex: 4,
                            padding: 5,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 3,
                            color: 'white'
                        },
                        ref: 'textInput',
                        placeholder: 'Add city',
                        placeholderTextColor: 'rgba(255, 255, 255, 0.8)',
                        onFocus: () => this.setState({searchFocused: true}),
                        onBlur: () => this.setState({searchFocused: false}),
                        onChangeText: inputValue => {
                            store.lookupCity(inputValue);
                            this.setState({inputValue})
                        },
                        value: inputValue || undefined
                    }
                ),
                searchFocused ?
                touchableOpacity(
                    {
                        style: {
                            paddingLeft: 10,
                            paddingRight: 10
                        },
                        onPress: () => {
                            this.refs.textInput.blur();
                            this.setState({inputValue: ''});
                        }
                    },
                    text(
                        {
                            style: {
                                lineHeight: 40,
                                textAlign: 'center',
                                fontSize: 18
                            }
                        },
                        'Cancel'
                    )
                ) :
                touchableOpacity(
                    {
                        style: {
                            paddingLeft: 10,
                            paddingRight: 10
                        },
                        onPress: () => {
                            store.toggleCitySelect();
                        }
                    },
                    text(
                        {
                            style: {
                                lineHeight: 40,
                                textAlign: 'center',
                                fontSize: 18
                            }
                        },
                        'Done'
                    )
                )
            ),
            !searchFocused && scrollView(
                {
                    keyboardShouldPersistTaps: true
                },
                localities.map((feature) => {
                    let id = feature.properties.id;
                    return cityItem({
                        editDisabled: localities.length === 1,
                        feature,
                        key: id,
                        selected: selectedLoacalitiesObj[id]
                    });
                }),
                view(
                    {
                        style: {
                            marginTop: 10,
                            padding: 10
                        }
                    },
                    text(
                        {
                            style: {
                                textAlign: 'center'
                            }
                        },
                        'Select one or two cities to compare'
                    )
                )
            ),
            searchFocused && view(
                {
                    // behavior: 'padding',
                    style: {
                        flex: 1
                    }
                },
                citySearchResult && Boolean(inputValue) && scrollView(
                    {
                        ref: ref => {this.searchScrollViewInstance = ref},
                        keyboardShouldPersistTaps: true
                    },
                    citySearchResult.map((feature) => {
                        return touchableHighlight(
                            {
                                key: feature.properties.id,
                                style: {
                                    height: 45,
                                    paddingLeft: 15
                                },
                                underlayColor: 'rgba(0, 0, 0, 0.1)',
                                onPress: () => {
                                    this.setState({inputValue: ''});
                                    this.refs.textInput.blur();
                                    store.addLocality(feature);
                                }
                            },
                            view(
                                {},
                                text(
                                    {
                                        style: {
                                            fontSize: 18,
                                            lineHeight: 45
                                        }
                                    },
                                    feature.properties.label
                                )
                            )
                        );
                    }),
                    view({height: 260})
                ),
                !inputValue && view(
                    {
                        style: {
                            padding: 10
                        }
                    },
                    text(
                        {},
                        'Search powered by Mapzen'
                    )
                )
            )
        );
    }
}));
