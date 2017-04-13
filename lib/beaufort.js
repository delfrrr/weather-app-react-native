/**
 * @module beaufort
 */
const {scaleLinear} = require('d3-scale');

module.exports = scaleLinear()
    .domain([0, .3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8]) // m/s
    .range([0,  1,  2,   3,   4,   5, 6,    7, 8, 9]); //beaufort
