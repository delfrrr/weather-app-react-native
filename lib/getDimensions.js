/**
 * @module lib/getDimensions
 */

const {Dimensions} = require('react-native');

/**
 * @return {number} height without status bar
 */
module.exports = function () {
    const {height, width} = Dimensions.get('window');
    return {
        width, height,
        viewHeight: height - 0,
        statusBarHeight: 20,
        curveHeight: height * .4
    }
}
