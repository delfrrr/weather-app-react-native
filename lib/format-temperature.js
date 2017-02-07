/**
 * @module format-temperature
 */

/**
 * @param  {number} temperatureC
 * @param  {string} temperatureFormat F or C
 * @param  {String} [sufix='']        to balance sighn
 * @return {string}
 */
module.exports = function (temperatureC, temperatureFormat, sufix = '') {
    if (Number.isNaN(temperatureC)) {
        return '';
    }
    let temperature = Math.round(temperatureFormat === 'F' ?
        temperatureC * 1.8 + 32 :
        temperatureC);
    let temperatureStr = '';
    if (temperature > 0) {
        temperatureStr = '+';
    } else if (temperature < 0) {
        temperatureStr = '-';
    } else {
        sufix = ''; //no sufix when no sighn
    }
    temperatureStr += String(Math.abs(temperature)) + sufix;
    return temperatureStr;
}
