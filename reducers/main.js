/**
 * redux store
 * @module reducers/main
 */

const redux = require('redux');
const {AsyncStorage, Alert, NativeModules} = require('react-native');
const url = require('url');
const moment = require('moment-timezone');
const lodash = require('lodash');
const {DARK_SKY_API_KEY, MAPZEN_API_KEY} = require('../credentials.json');
const {LayoutAnimation} = require('react-native');
//reverse geocoding endpoint
const MAPZEN_BASE_URL = `https://search.mapzen.com/v1/?api_key=${
    MAPZEN_API_KEY
}`;
const reportError = require('../lib/reportError');
const showAlert = require('../lib/showAlert');
const actionTypes = require('./action-types');

/**
 * @returns {Date[]}
 */
function getInitDates(twoCities = false) {
    let hours = (new Date).getHours();
    if (hours > 20) {
        return [moment().toDate(), moment().add(1, 'day').toDate()];
    } else if (twoCities) {
        return [moment().toDate(), moment().toDate()];
    } else {
        return [moment().add(-1, 'day').toDate(), moment().toDate()];
    }
}

/**
 * @param {actionTypes} actionType
 * @param {array} initValue
 * @returns {function} reducer
 */
function getColumnReducer(actionType, initValue) {
    return (
        propertyAr = initValue,
        action
    ) => {
        switch(action.type) {
            case actionType:
                propertyAr = propertyAr.slice(0);
                propertyAr[action.index] = action.value
                return propertyAr;
            default:
                return propertyAr;
        }

    }
}

/**
 * @param {actionTypes} actionType
 * @param {*} initValue - scalar value
 * @returns {function} reducer
 */
function getScalarReducer(actionType, initValue) {
    return (
        value = initValue,
        action
    ) => {
        switch(action.type) {
            case actionType:
                return action.value;
            default:
                return value;
        }

    }
}

/**
 * @param  {string} toggleActionType
 * @param  {Boolean} initValue
 * @return {function} reducer
 */
function getBooleanReducer(toggleActionType, initValue) {
    return (
        value = initValue,
        {type}
    ) => {
        switch (type) {
            case toggleActionType:
                return !value;
            default:
                return value;
        }
    }
}

/**
s * @see https://en.wikipedia.org/wiki/12-hour_clock
 * @return {Promise.<Boolean>}
 */
function detect12h() {
    return NativeModules.Locale.dateFormat(Date.now(), 'short', 'short').then((d) => {
        return Boolean(d.match(/[ap]m/i));
    });
}

/**
 * @return {string} us or metric
 */
function getUnitSystem() {
    return NativeModules.Locale.measurementSystem === 'U.S.' ? 'us' : 'metric';
}

/**
 * @return {string}
 */
function getTemperatureFormat() {
    return NativeModules.Locale.measurementSystem === 'U.S.' ? 'F' : 'C';
}

let store;

const defaultHourRange = [8, 21];

module.exports = store = redux.createStore(redux.combineReducers({
    localities: function (localities = [], action) {
        switch (action.type) {
            case actionTypes.SET_LOCALITIES:
                return [].concat(action.localities);
            case actionTypes.ADD_LOCALITY:
                return localities.concat([action.feature])
            case actionTypes.REMOVE_LOCALITY:
                return localities.filter((feature) => {
                    return (
                        feature.properties.id !== action.feature.properties.id
                    );
                });
            default:
                return localities
        }
    },
    selectedLoacalities: function (selectedLoacalities = [], action) {
        switch (action.type) {
            case actionTypes.SET_SELECTED_LOCALITIES:
                return [].concat(action.selectedLoacalities);
            default:
                return selectedLoacalities
        }
    },
    dateSelect: function (dateSelect = null, action) {
        switch(action.type) {
            case actionTypes.CHANGE_DATE:
                return {
                    index: action.index
                };
            case actionTypes.CLOSE_DATE_SELECT:
                return null;
            default:
                return dateSelect;
        }
    },
    citySearch: getBooleanReducer(actionTypes.TOGGLE_CITY_SEARCH, false),
    citySelect: getBooleanReducer(actionTypes.TOGGLE_CITY_SELECT, false),
    timezones: getColumnReducer(actionTypes.SET_TIMEZONE, [
        moment.tz.guess(), moment.tz.guess()
    ]),
    selectedBars: function (selectedBars = [0, 0, 0, 0], action) {
        let turnOn;
        switch (action.type) {
            case actionTypes.TOGGLE_BAR:
                turnOn = !selectedBars[action.index];
                selectedBars = [0, 0, 0, 0];
                if (turnOn) {
                    selectedBars[action.index] = 1;
                }
                return selectedBars
            case actionTypes.RESET_BAR:
                return [0, 0, 0, 0];
            default:
                return selectedBars;
        }
    },
    details: function (details = null, action) {
        switch (action.type) {
            case actionTypes.OPEN_DETAILS:
                return action.index;
            case actionTypes.CLOSE_DETAILS:
                return null;
            default:
                return details;
        }
    },
    hourRange: function (
        hourRange = defaultHourRange, action
    ) {
        let {selectedBars, type} = action;
        let selectedIndex;
        switch (type) {
            case actionTypes.SET_HOUR_RANGE:
                selectedIndex = selectedBars.indexOf(1);
                if (selectedIndex >= 0) {
                    return [selectedIndex * 6, selectedIndex * 6 + 5];
                }
                return defaultHourRange.slice(0);
            default:
                return hourRange;
        }
    },
    forecastApiRequests: function (forecastApiRequests = 0, action) {
        switch (action.type) {
            case actionTypes.FORECAST_REQUEST:
                return ++forecastApiRequests;
            case actionTypes.SET_FORECAST_REQ:
                return action.value;
            default:
                return forecastApiRequests;
        }
    },
    dates: getColumnReducer(actionTypes.SET_DATE, getInitDates()),
    hourly: getColumnReducer(actionTypes.SET_HOURLY_WEATHER, [null, null]),
    currently: getColumnReducer(actionTypes.SET_CURRENT_WEATHER, [null, null]),
    minTemperture: getScalarReducer(actionTypes.SET_MIN_TEMPERATURE, 0),
    maxTemperture: getScalarReducer(actionTypes.SET_MAX_TEMPERATURE, 0),
    citySearchResult: getScalarReducer(actionTypes.SET_CITY_SEARCH_RESULT, null),
    temperatureFormat: getScalarReducer(
        actionTypes.SET_TEMPERATURE_FORMAT, getTemperatureFormat()
    ),
    is12h: getScalarReducer(
        actionTypes.SET_12H, null
    ),
    unitSystem: getScalarReducer(
        actionTypes.SET_UNIT_SYSTEM, getUnitSystem()
    )
}));

//handle layout animations
const defaultAnimationDuration = 400;
let animationDuration = defaultAnimationDuration;
let nextAnimationDuration = null;

function configureAnimation() {
    LayoutAnimation.configureNext(
        LayoutAnimation.create(animationDuration, 'linear', 'opacity'),
        () => {
            if (typeof nextAnimationDuration === 'number') {
                animationDuration = nextAnimationDuration;
                nextAnimationDuration = null;
            }
        }
    );
}

store.subscribe(configureAnimation);

/**
 * configure animation for next layout change
 * @param  {number} [ad=defaultAnimationDuration] animation duration
 */
module.exports.configureAnimation = function (
    ad = defaultAnimationDuration
) {
    animationDuration = ad;
    nextAnimationDuration = defaultAnimationDuration;
    configureAnimation();
}

const propertiesToSave = [
    'locality',
    'localities',
    'selectedLoacalities',
    'temperatureFormat',
    'forecastApiRequests'
];
const storageKey = 'reducers.main.store.state';
function saveStore() {
    var stateToSave = {};
    var state = store.getState();
    propertiesToSave.forEach((p) => {
        stateToSave[p] = state[p];
    });
    AsyncStorage
        .setItem(storageKey, JSON.stringify(stateToSave))
        .catch(reportError);
}

store.subscribe(lodash.debounce(saveStore, 100));

/**
 * opens date picker
 * @param {number} index - index of column
 */
module.exports.requestDateInput = function (index) {
    this.dispatch({
        type: actionTypes.CHANGE_DATE,
        index
    })
};

module.exports.closeDateInput = function () {
    this.dispatch({
        type: actionTypes.CLOSE_DATE_SELECT
    })
};

module.exports.opensDetails = function (index) {
    animationDuration = 200;
    nextAnimationDuration = defaultAnimationDuration;
    this.dispatch({
        type: actionTypes.OPEN_DETAILS,
        index
    })
};

module.exports.closeDetails = function () {
    animationDuration = 200;
    nextAnimationDuration = defaultAnimationDuration;
    this.dispatch({
        type: actionTypes.CLOSE_DETAILS
    })
};

module.exports.lookupCity = function (inputText) {
    if (!inputText) {
        return;
    }
    const mapzenUrlObj = url.parse(MAPZEN_BASE_URL, true);
    delete mapzenUrlObj.search;
    mapzenUrlObj.query.text = inputText;
    mapzenUrlObj.query.limit = 10;
    mapzenUrlObj.query.layers = 'locality';
    mapzenUrlObj.pathname += 'search';
    const mapzenUrl = url.format(mapzenUrlObj);
    safeFetch(mapzenUrl).then(res => res.json()).then((res) => {
        this.dispatch({
            type: actionTypes.SET_CITY_SEARCH_RESULT,
            value: res.features
        });
    }).catch(reportError);
};

/**
 * @param {number} x - scroll position
 */
module.exports.slideDates = function (x) {
    const {dates} = this.getState();
    if (x > 0) {
        this.setDate(0, moment(dates[0]).add(1, 'day').toDate());
        this.setDate(1, moment(dates[1]).add(1, 'day').toDate());
    } else {
        this.setDate(0, moment(dates[0]).add(-1, 'day').toDate());
        this.setDate(1, moment(dates[1]).add(-1, 'day').toDate());
    }
};

/**
 * @param {number} index - index of column
 * @param {Date} value
 */
module.exports.setDate = function (index, value) {
    this.dispatch({
        type: actionTypes.SET_DATE,
        index,
        value
    });
    this.fetchCurrentWeather(index);
};

/**
 * wrapper for fetch with error reporting
 * @param  {string} urlStr
 * @param  {object} options fetch options
 * @return {Promise}
 */
function safeFetch(urlStr, options) {
    return fetch(urlStr, options).then(
        res => {
            if (!res.ok) {
                const urlObj = url.parse(urlStr);
                return Promise.reject(new Error(`Request to ${
                    urlObj.hostname
                } failed with status ${res.status}`));
            }
            return res;
        },
        e => {
            const urlObj = url.parse(urlStr);
            e.message = `${e.message} when fetching from ${
                urlObj.hostname
            }`;
            e.network = true;
            return Promise.reject(e);
        }
    );
}

//last response tyme from forecast API
let lastDate = null;

/**
 * fetch wether for location
 * @param  {object} feature GEOJSON feature
 * @param  {number} ts      forecast date in seconds
 * @return {Promise}
 */
function fetchWeather(feature, ts) {
    const {coordinates} = feature.geometry;
    const {forecastApiRequests} = store.getState();
    if (forecastApiRequests > 10000) {
        showAlert(
            'Dark Sky API limit exceeded',
            `It means that you used your API limit before I introduced ` +
            `in-app purchase.\n` +
            `Try to update app from app-store or contact me to ` +
            `bilonenko.v@gmail.com`
        );
        return new Promise(() => {});
    }
    let url = `https://api.forecast.io/forecast/${
        DARK_SKY_API_KEY
    }/${
        coordinates[1]
    },${
        coordinates[0]
    },${ts}?units=si`;
    return safeFetch(url).then((res) => {
        const resDate = new Date(res.headers.map.date[0]);
        if (!lastDate) {
            //we relly only on date from server
            lastDate = resDate;
        }
        if (resDate >= lastDate) {
            //not cache
            lastDate = resDate;
            store.dispatch({
                type: actionTypes.FORECAST_REQUEST
            })
        }
        return res.json();
    });
}

/**
 * return selected locality by index of columne
 * @param  {number} index
 * @return {object} GEOJSON feature
 */
function getLocality(index) {
    const {selectedLoacalities} = store.getState();
    return selectedLoacalities[index] || selectedLoacalities[0];
}

/**
 * fetch current weather for given column index
 * @param {number} index
 */
module.exports.fetchCurrentWeather = function (index) {
    let {dates} = this.getState();
    const locality = getLocality(index);
    if (!locality) {
        return;
    }
    let ts = Math.round(dates[index].getTime() / 1000);
    fetchWeather(locality, ts).then((res) => {
        this.dispatch({
            type: actionTypes.SET_TIMEZONE,
            index,
            value: res.timezone
        });
        this.dispatch({
            type: actionTypes.SET_CURRENT_WEATHER,
            value: res.currently,
            index
        });
        this.fetchForecast(index);
    }).catch(reportError);
};

/**
 * fetch data from forecasts.io
 * @param {number} column - index
 */
module.exports.fetchForecast = function (index) {
    const {dates, timezones} = this.getState();
    const locality = getLocality(index);
    const ts = Math.round(moment
        .tz(dates[index], timezones[index])
        .startOf('day')
        .toDate()
        .getTime()/1000);
    fetchWeather(locality, ts).then((res) => {
        this.dispatch({
            type: actionTypes.SET_HOURLY_WEATHER,
            value: res.hourly,
            index
        });
        this.setHourlyMinMax();
    }).catch(reportError);
};

module.exports.toggleCitySelect = function () {
    this.dispatch({
        type: actionTypes.TOGGLE_CITY_SELECT
    });
}

module.exports.toggleCitySearch = function () {
    const {citySearch} = this.getState();
    if (!citySearch) {
        animationDuration = 0;
    } else {
        nextAnimationDuration = defaultAnimationDuration;
    }
    this.dispatch({
        type: actionTypes.TOGGLE_CITY_SEARCH
    });
}

module.exports.toggleBar = function (index) {
    this.dispatch({
        type: actionTypes.TOGGLE_BAR,
        index
    });
    this.setHourRange(this.getState().selectedBars);
}

module.exports.resetBars = function () {
    this.dispatch({
        type: actionTypes.RESET_BAR
    });
    this.setHourRange(this.getState().selectedBars);
}

/**
 * @param {number[]} selectedBars
 */
module.exports.setHourRange = function (selectedBars) {
    this.dispatch({
        type: actionTypes.SET_HOUR_RANGE,
        selectedBars
    });
}

const tScales = [10, 20, 30, 50, 80, 130, 210];

module.exports.setHourlyMinMax = function () {
    let {hourly} = this.getState();
    let tAr = hourly.reduce((tAr, dataBlock) => {
        if (dataBlock) {
            dataBlock.data.forEach((dataPoint) => {
                tAr.push(dataPoint.temperature, dataPoint.apparentTemperature)
            })
        }
        return tAr;
    }, []);
    //snap to fixed temp scale
    let max = Math.ceil(Math.max(...tAr));
    let min = Math.floor(Math.min(...tAr));
    let t0 = Math.floor(min / 10) * 10;
    let i = 0;
    let maxDt = tScales[i];
    while(maxDt && maxDt < (max - t0)) {
        i++;
        maxDt = tScales[i];
    }
    this.dispatch({
        type: actionTypes.SET_MAX_TEMPERATURE,
        value: t0 + maxDt
    });
    this.dispatch({
        type: actionTypes.SET_MIN_TEMPERATURE,
        value: t0
    });
}

/**
 * set current locality for which show weather
 * @param {object} feature - GEOJSON feature
 */
module.exports.setSelectedLocalities = function (selectedLoacalities) {
    this.dispatch({
        type: actionTypes.SET_SELECTED_LOCALITIES,
        selectedLoacalities
    });

    //reset hours
    this.dispatch({
        type: actionTypes.SET_HOURLY_WEATHER,
        value: null,
        index: 0
    });
    this.dispatch({
        type: actionTypes.SET_HOURLY_WEATHER,
        value: null,
        index: 1
    });
    this.initDates();
}

/**
 * add locality to history list
 * @param {object} feature - GEOJSON feature
 */
module.exports.addLocality = function (feature) {
    const {localities} = this.getState();
    const sameLocalities = localities.filter((locality) => {
        return locality.properties.id === feature.properties.id;
    });
    if (sameLocalities.length === 0) {
        this.dispatch({
            type: actionTypes.ADD_LOCALITY,
            feature
        });
        this.setSelectedLocalities([feature]);
    }
}

/**
 * remove locality from history list
 * @param {object} feature - GEOJSON feature
 */
module.exports.removeLocality = function (feature) {
    const {selectedLoacalities, localities} = this.getState();
    const otherLocalities = localities.filter((locality) => {
        return locality.properties.id !== feature.properties.id;
    });
    const otherSelectedLocalities = selectedLoacalities.filter((locality) => {
        return locality.properties.id !== feature.properties.id;
    });

    if (otherLocalities.length) {
        this.dispatch({
            type: actionTypes.REMOVE_LOCALITY,
            feature
        });
        if (otherSelectedLocalities.length < selectedLoacalities.length) {
            this.toggleSelectedLoacality(feature);
        }
    } else {
        Alert.alert(
            'Oh no!',
            'I don\'t know what to do when you drop last city in a list'
        );
    }
}

/**
 * set date for current
 */
module.exports.initDates = function () {
    const {selectedLoacalities} = store.getState();
    store.resetBars();
    let dates = getInitDates(selectedLoacalities.length === 2);
    this.setDate(0, dates[0]);
    this.setDate(1, dates[1]);
}

module.exports.toggleTemperatureFormat = function () {
    const {temperatureFormat} = this.getState();
    this.dispatch({
        type: actionTypes.SET_TEMPERATURE_FORMAT,
        value: temperatureFormat === 'C' ? 'F' : 'C'
    });
}

/**
 * toggles localities for city select check boxes
 * @param  {object} feature GEOJSON feature
 */
module.exports.toggleSelectedLoacality = function (feature) {
    const {selectedLoacalities, localities} = this.getState();
    const otherLocalities = selectedLoacalities.filter((locality) => {
        return locality.properties.id !== feature.properties.id
    });
    if (otherLocalities.length === selectedLoacalities.length) {
        //add
        this.setSelectedLocalities(
            selectedLoacalities.slice(-1).concat([feature])
        );
    } else if (otherLocalities.length === 0) {
        //need to add from localities
        this.setSelectedLocalities(localities.slice(0, 1));
    } else {
        //remove
        this.setSelectedLocalities(otherLocalities);
    }
}

module.exports.setChartType = function (chartType) {
    this.dispatch({
        type: actionTypes.SET_CHART_FORMAT,
        value: chartType
    });
    this.setHourlyMinMax();
}

/**
 * loads state from AsyncStorage
 */
module.exports.loadState = function () {
    //detect time format
    detect12h().then((is12h) => {
        this.dispatch({
            type: actionTypes.SET_12H,
            value: is12h
        });
    }).catch(reportError);

    //load state from storage
    AsyncStorage.getItem(storageKey).then((stateStr) => {
        if (stateStr) {
            const state = JSON.parse(stateStr);
            const {
                localities,
                selectedLoacalities,
                temperatureFormat,
                forecastApiRequests
            } = state;
            if (typeof forecastApiRequests === 'number') {
                this.dispatch({
                    type: actionTypes.SET_FORECAST_REQ,
                    value: forecastApiRequests
                });
            }
            if (localities && localities.length) {
                this.dispatch({
                    type: actionTypes.SET_LOCALITIES,
                    localities
                });
            }
            if (temperatureFormat) {
                this.dispatch({
                    type: 'SET_TEMPERATURE_FORMAT',
                    value: temperatureFormat
                });
            }
            if (selectedLoacalities && selectedLoacalities.length) {
                this.setSelectedLocalities(selectedLoacalities);
            } else {
                this.setPosition();
            }
        } else {
            this.setPosition();
        }

    }).catch(reportError);
}

/**
 * resolves position with cuppertino as default
 * @return {Promise}
 */
function getCurrentPosition() {
    return new Promise((success) => {
        navigator.geolocation.getCurrentPosition(
            position => success(position),
            () => {
                Alert.alert(
                    'Can\'t get your position.',
                    'I\'ll show you weather in Cuppertino.' +
                    '\nBut you can change city anytime by clicking on it.'
                );
                success({ //cuppertino
                    coords: {
                        latitude: 37.325885,
                        longitude: -122.039870
                    }
                });
            }
        );
    });
}

/**
 * updates position in store
 */
module.exports.setPosition = function () {
    getCurrentPosition().then((position) => {
        let mapzenUrlObj = url.parse(MAPZEN_BASE_URL, true);
        delete mapzenUrlObj.search;
        mapzenUrlObj.query['point.lat'] = position.coords.latitude;
        mapzenUrlObj.query['point.lon'] = position.coords.longitude;
        mapzenUrlObj.query['layers'] = 'locality';
        mapzenUrlObj.query['size'] = 1;
        mapzenUrlObj.pathname += 'reverse';
        let mapzenUrl = url.format(mapzenUrlObj);
        return safeFetch(mapzenUrl);
    }).then((res) => res.json()).then((res) => {
        const feature = res.features[0];
        this.addLocality(feature);
        this.setSelectedLocalities(feature);
    }).catch(reportError);
}
