/**
 * factory for setState animated method
 * @module setStateAnimated
 */

const {interpolate} = require('d3-interpolate');
const {isEqual} = require('lodash');
/**
 * @param  {Number}   [duration=500]
 * @param  {Function} cb will be called before last set state
 * @return {function} set state method
 */
module.exports = function (duration = 500, cb) {
    let animation;
    let goingToState = null;
    return function (newState) {
        if (isEqual(goingToState, newState)) {
            return;
        } else {
            goingToState = newState;
        }
        const start = Date.now();
        const interpolator = interpolate(
            this.state,
            newState
        );
        animation = () => {
            const now = Date.now();
            let t = (now - start) / duration;
            if (t > 1) {
                t = 1;
            }
            if (t === 1 && cb) {
                cb();
            }
            this.setState(interpolator(t));
            if (t < 1) {
                requestAnimationFrame(animation);
            } else {
                goingToState = null;
            }
        }
        requestAnimationFrame(animation);
    }
}
