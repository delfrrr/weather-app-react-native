/**
 * @module components/column
 */

const React = require('react');
const view = React.createFactory(require('react-native').View);
const touchableOpacity = React.createFactory(
    require('react-native').TouchableOpacity
);
const hourScale = React.createFactory(require('./hourScale'));
const date = React.createFactory(require('./date'));
const curve = React.createFactory(require('./curve'));
const connect = require('react-redux').connect;
const {Dimensions} = require('react-native');
const store = require('../reducers/main');
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
            touchableOpacity(
                {
                    style: {
                        flex: 1.5,
                        flexDirection: 'row'
                    },
                    onPress: () => store.opensDetails(index)
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
            hourScale({hours: [3, 9, 15, 21]})
        );
    }
}));
