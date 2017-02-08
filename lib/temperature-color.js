/**
 * @module temperature-color
 */
'use strict';

let scale = require('d3-scale').scaleLinear;

/**
 * @param {number} temperature
 * @returns {string} color
 */
module.exports = scale().domain([
    -Infinity,
    -50,
    -10,
    0,
    10,
    20,
    25,
    30,
    40,
    Infinity
]).range([
    'blue',
    'blue',
    '#334DA3',
    '#3599dd',
    '#00A69E',
    '#54b87b',
    '#FFA15A',
    '#ff5053',
    'rgb(236, 0, 125)',
    'rgb(236, 0, 125)'
]);
