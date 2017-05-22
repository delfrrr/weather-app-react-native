/**
 * @module action-types
 */

const actions = [
    'SET_POSITION',
    'SET_LOCALITY',
    'CHANGE_DATE', //opens date picker
    'CLOSE_DATE_SELECT',
    'SET_DATE',
    'SET_TIMEZONE',
    'SET_CURRENT_WEATHER',
    'SET_HOURLY_WEATHER',
    'SET_MIN_TEMPERATURE',
    'SET_MAX_TEMPERATURE',
    'SET_TEMPERATURE_FORMAT',
    'TOGGLE_BAR',
    'RESET_BAR',
    'SET_HOUR_RANGE',
    'TOGGLE_CITY_SELECT',
    'SET_CITY_SEARCH_RESULT',
    'LOAD_STATE_FROM_STORAGE',
    'SET_SELECTED_LOCALITIES',
    'ADD_SELECTED_LOCALITY',
    'SET_LOCALITIES',
    'ADD_LOCALITY',
    'REMOVE_LOCALITY',
    'FORECAST_REQUEST',
    'SET_FORECAST_REQ',
    'SET_CHART_FORMAT',
    'OPEN_DETAILS',
    'CLOSE_DETAILS',
    'TOGGLE_CITY_SEARCH',
    'SET_UNIT_SYSTEM',
    'SET_12H',
    'RAISE_FORECAST_API_LIMIT',
    'SET_SHOW_STORE',
    'SET_FORECAST_API_LIMIT'
];

/**
 * @enum {string}
 */
module.exports = actions.reduce((actionTypes, action) => {
    actionTypes[action] = action;
    return actionTypes;
}, {});
