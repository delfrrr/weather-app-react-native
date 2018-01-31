/**
 * @module lib/getFeatureLabel
 */

/**
 * @param {Object} feature geocoder responce
 * @returns {String} result full name
 */
 module.exports = function getFeatureLabel(feature) {
    if (feature && feature.place_name) {
        return feature.place_name;
    }
    if (feature && feature.properties && feature.properties.label) {
        return feature.properties.label;
    }
    return '';
}