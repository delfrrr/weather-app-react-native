/**
 * @module components/locality
 */

const React = require('react');
const text = React.createFactory(require('./text'));
const connect = require('react-redux').connect;
const view = React.createFactory(
    require('react-native').View
);

const scaleLinear = require('d3-scale').scaleLinear;

const get2ColumnsSize = scaleLinear().range(
    [32, 32, 16, 16]
).domain(
    [0, 9, 18, Infinity]
);

const get1ColumnsSize = scaleLinear().range(
    [40, 40, 24, 24]
).domain(
    [0, 15, 30, Infinity]
);

/**
 * @param  {object} feature
 * @return {string}
 */
function getLabel(feature) {
    return feature && feature.properties.label.split(',')[0];
}

module.exports = connect(
    function mapStateToProps(state) {
        return {
            selectedLoacalities: state.selectedLoacalities
        }
    }
)(React.createClass({
    render: function () {
        const {selectedLoacalities, index} = this.props;
        if (!selectedLoacalities.length) {
            return null;
        }
        let label1;
        let label2;
        if (typeof index === 'number') {
            label1 = getLabel(
                selectedLoacalities[index] || selectedLoacalities[0]
            );
        } else {
            label1 = getLabel(selectedLoacalities[0]);
            label2 = getLabel(selectedLoacalities[1]);
        }
        const maxLength = Math.max(...label1.split(' ').concat(
            label2 ? label2.split(' ') : []
        ).map(l => l.length));
        return view(
            {
                style: {
                    flex: 1,
                    justifyContent: 'center'
                }
            },
            label2 ?
            view(
                {
                    style: {
                        flexDirection: 'row',
                        alignItems: 'center'
                    }
                },
                view(
                    {
                        style: {
                            flex: 1
                        }
                    },
                    text(
                        {
                            style: {
                                textAlign: 'center',
                                fontSize: get2ColumnsSize(maxLength),
                                fontWeight: '200'
                            },
                            ellipsizeMode: 'middle',
                            numberOfLines: 2
                        },
                        label1
                    )
                ),
                view(
                    {
                        style: {
                            flex: 1
                        }
                    },
                    text(
                        {
                            style: {
                                textAlign: 'center',
                                fontSize: get2ColumnsSize(maxLength),
                                fontWeight: '200'
                            },
                            ellipsizeMode: 'middle',
                            numberOfLines: 2
                        },
                        label2
                    )
                )
            ) :
            view(
                {},
                text(
                    {
                        style: {
                            textAlign: 'center',
                            fontSize: get1ColumnsSize(maxLength),
                            fontWeight: '200',
                            paddingLeft: 15,
                            paddingRight: 15
                        },
                        ellipsizeMode: 'middle',
                        numberOfLines: 2
                    },
                    label1
                )
            )
        );
    }
}));
