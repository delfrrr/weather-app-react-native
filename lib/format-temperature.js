/**
 * @module format-temperature
 */

module.exports = function (temperatureC, temperatureFormat) {
    if (Number.isNaN(temperatureC)) {
        return '';
    }
    let temperature = temperatureFormat === 'F' ?
        temperatureC * 1.8 + 32 :
        temperatureC;
    let temperatureStr = '';
    if (temperature > 0) {
        temperatureStr = '+';
    } else if (temperature < 0) {
        temperatureStr = '-';
    }
    temperatureStr += String(Math.abs(Math.round(temperature)));
    return temperatureStr;
}
