/**
 * provides default styling for text
 * @module components/text
 */

let React = require('react');
let Text = React.createFactory(require('react-native').Text);
let StyleSheet = require('react-native').StyleSheet;
const styles = StyleSheet.create({
    normal: {
        color: 'white',
        backgroundColor: 'transparent'
    },
    link: {
        color: 'rgb(17, 107, 255)'
    }
})

module.exports = React.createClass({
    render: function () {
        const {style, ellipsizeMode, numberOfLines} = this.props;
        return Text(
            {
                style: [
                    styles.normal,
                    styles[this.props.class]
                ].concat(style),
                ellipsizeMode,
                numberOfLines
            },
            this.props.children
        );
    }
});
