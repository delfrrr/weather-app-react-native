/**
 * svg group with wind by hour
 * @module detailsCloudCoverage
 */

'use strict';

const React = require('react');
const {width} = require('../lib/getDimensions')();
const height = 50;
const svg = React.createFactory(require('react-native-svg').Svg);
const Defs = React.createFactory(require('react-native-svg').Defs);
const Stop = React.createFactory(require('react-native-svg').Stop);
const LinearGradient = React.createFactory(
    require('react-native-svg').LinearGradient
);
const {scaleLinear, scaleThreshold} = require('d3-scale');
const {area, curveMonotoneX} = require('d3-shape');
const path = React.createFactory(require('react-native-svg').Path);
const setStateAnimated = require('../lib/setStateAnimated');
const view = React.createFactory(require('react-native').View);
const text = React.createFactory(require('./text'));
const labelTypes = [
    'clear', 'partly-cloudy', 'cloudy'
];
const labelTypeLables = {
    'clear': 'Clear',
    'partly-cloudy': 'Partly Cloudy',
    'cloudy': 'Cloudy'
};
const cloudCoverScale = scaleThreshold()
    .domain([.2, 1])
    .range(labelTypes);
const store = require('../reducers/main');

const labelWidth = 100;

/**
 * @param  {Object[]} points
 * @return {Object} point
 */
function getLabelPoint(points) {
    const slicePadding = Math.floor(xScale.invert(labelWidth / 2));
    const slicedPoints = points.slice(
        slicePadding,
        points.length - 1 - slicePadding
    );
    let currentGroup = [points[0]];
    let groups = [currentGroup];
    slicedPoints.slice(1).forEach((point) => {
        if (point.cloudCover === currentGroup[0].cloudCover) {
            currentGroup.push(point);
        } else {
            currentGroup = [point];
            groups.push(currentGroup);
        }
    });
    let biggestGroup = groups[0];
    groups.forEach((group) => {
        if (group.length > biggestGroup.length) {
            biggestGroup = group;
        }
    });
    let biggestGroupMiddleIndex = Math.floor(biggestGroup.length / 2);
    return biggestGroup[biggestGroupMiddleIndex];
}

/**
 * @param  {Object} props
 * @return {Object} state
 */
function getSateFromProps(props) {
    let {
        dataPoints
    } = props;
    if (dataPoints.length === 24) {
        let points = dataPoints.map(({cloudCover}, hour) => {
            return {
                cloudCover: Math.round((cloudCover || 0) * 4) / 4,
                labelType: cloudCoverScale(cloudCover),
                hour
            }
        });
        return {
            labelPoint: getLabelPoint(points),
            points,
            valid: true
        };
    }
    return {
        valid: false
    };
}

const xScale = scaleLinear()
    .domain([0, 23])
    .range([0, width]);

const yScale = scaleLinear()
    .domain([0, 1])
    .range([height, 0]);

const areaFn = area()
    .y0(p => yScale(p.cloudCover))
    .y1(height)
    .x((p) => xScale(p.hour))
    .curve(curveMonotoneX);

module.exports = React.createClass({
    getInitialState: function () {
        return Object.assign(
            {
                points: null,
                valid: false,
                animationProgress: 1
            },
            getSateFromProps(this.props)
        );
    },
    componentWillMount: function () {
        this.setStateAnimated = setStateAnimated(500, () => {
            store.configureAnimation();
        });
    },
    componentWillReceiveProps: function (props) {
        const newState = getSateFromProps(props);
        if (!newState.valid) {
            this.setState(newState);
            return;
        }
        this.setState({animationProgress: 0});
        setTimeout(() => {
            newState.animationProgress = 1;
            this.setStateAnimated(newState);
        })
    },
    render: function () {
        const {points, labelPoint, animationProgress, valid} = this.state;
        if (!points) {
            return null;
        }
        const d = areaFn(points);
        return view(
            {
                width,
                height
            },
            (animationProgress === 1 && valid) ? text(
                {
                    style: {
                        position: 'absolute',
                        top: 20,
                        left: xScale(labelPoint.hour) - labelWidth / 2,
                        width: labelWidth,
                        fontSize: 12,
                        textAlign: 'center'
                    }
                },
                labelTypeLables[labelPoint.labelType]
            ) : null,
            svg(
                {
                    width,
                    height
                },
                Defs(null,
                    LinearGradient(
                        {
                            id: 'grad',
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: height
                        },
                        Stop({
                            offset: String(0),
                            stopColor: 'rgba(255, 255, 255)',
                            stopOpacity: .1
                        }),
                        Stop({
                            offset: String(1),
                            stopColor: 'rgba(255, 255, 255)',
                            stopOpacity: 0
                        })
                    )
                ),
                path({
                    d,
                    strokeWidth: 0,
                    fill: 'url(#grad)'
                })
            )
        );
    }
});
