/**
 * @module setStateAnimated
 */

const {interpolate} = require('d3-interpolate');

module.exports = function (duration = 500) {
    let animation;
    return function (newState) {
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
            this.setState(interpolator(t));
            if (t < 1) {
                requestAnimationFrame(animation);
            }
        }
        requestAnimationFrame(animation);
    }
}
