/**
 * @module components/column
 */

const React = require('react');
const view = React.createFactory(require('react-native').View);
const text = React.createFactory(require('./text'));
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
        return view(
            {
                style: {
                    flex: 1,
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    overflow: 'hidden'
                }
            },
            view(
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
            view(
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
            ),
            view(
                {
                    style: {
                        position: 'absolute',
                        bottom: 5,
                        left: 0,
                        right: 0,
                        height: 15,
                        flexDirection: 'row'
                    }
                },
                [3, 9, 15, 21].map((h, key, arr) => {
                    let sufix = '';
                    if (key === 0 || key === arr.length - 1 ) {
                        sufix = 'h';
                    }
                    return text(
                        {
                            key,
                            style: {
                                flex: 1,
                                textAlign: 'center',
                                height: 15,
                                lineHeight: 15,
                                fontSize: 10
                            }
                        },
                        h + sufix
                    );
                })
            )
        );
    }
}));
