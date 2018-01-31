/**
 * @module lib/getFeatureId
 */

/**
 * @param {object} feature
 * @returns {string}
 */
module.exports = function getFeatureId(feature) {
    return feature.id || feature.properties.id;
}
