/**
 * @module lib/getDataPoints
 */

/**
 * checks points are consistent and return them
 * @param  {ForecastDataBlock} dataBlock
 * @return {object[]|null} hours
 */
module.exports = function (dataBlock) {
    if (
        dataBlock &&
        dataBlock.data &&
        dataBlock.data.length
    ) {
        let points = dataBlock.data.slice(0);
        //sitch on winter time
        if (points.length === 25) {
            points = points.slice(1);
        }
        //sitch on summer time
        if (points.length === 23) {
            points.unshift(points[0]);
        }
        const verfifiedPoints = points.filter(
            p => {
                return typeof p.apparentTemperature === 'number' &&
                    typeof p.temperature === 'number';
            }
        );
        if (verfifiedPoints.length === 24) {
            return verfifiedPoints;
        }
    }
    return null;
}
