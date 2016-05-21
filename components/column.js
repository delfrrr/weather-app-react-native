/**
 * @module components/column
 */

const React = require('react');
const View = React.createFactory(require('react-native').View);
const date = React.createFactory(require('./date'));
const curve = React.createFactory(require('./curve'));
const connect = require('react-redux').connect;
const {Dimensions} = require('react-native');
const tBar = React.createFactory(require('./t-bar'));
const _ = require('lodash');



module.exports = connect(
    function mapStateToProps(state) {
        return {
            chartType: state.chartType
        }
    }
)(React.createClass({
    render: function () {
        const {dateOpacity, index, chartType} = this.props;
        const {width} = Dimensions.get('window');
        const barWidth = Math.ceil(width / 8);
        return View(
            {
                style: {
                    flex: 1,
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    overflow: 'hidden'
                }
            },
            View(
                {
                    style: {
                        flex: 1
                    }
                },
                date({
                    index,
                    opacity: dateOpacity
                })
            ),
            chartType === 'curve' ?
            curve({index}) :
            View(
                {
                    style: {
                        flex: 1.5,
                        flexDirection: 'row'
                    }
                },
                _.times(4).map((key) => {
                    return tBar({
                        key,
                        startHour: 24 / 4 * key,
                        index,
                        width: barWidth
                    });
                })
            )
        );
    }
}));
