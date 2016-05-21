/**
 * show alert with error
 * @module reportError
 */

'use strict';

const showAlert = require('./showAlert');

/**
 * use it insted of done
 * @param  {Error} e
 */
module.exports = function reportError(e) {
    if (e.network) {
        showAlert(
            'Looks like you are offline',
            'Zowni needs Interenet connection.' +
            '\nTry again, when you have one.'
        );
    } else {
        showAlert(
            'Some problem with my code',
            e.message +
            '.\nMaybe, try again slowly.'
        );
    }
    console.error(e);
}
