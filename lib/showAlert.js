/**
 * show alert with error
 * @module reportError
 */

'use strict';

const {AlertIOS} = require('react-native');
let doNotOpen = false;

/**
 * debounced alert
 * @param  {string} title
 * @param  {string} text
 */
module.exports = function showAlert(title, text) {
    if (doNotOpen) {
        return;
    }
    doNotOpen = true;
    AlertIOS.alert(
        title,
        text,
        function () {
            doNotOpen = false;
        }
    );
}
