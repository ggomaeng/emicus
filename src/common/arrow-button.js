/**
 * Created by ggoma on 9/24/16.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableHighlight
} from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

export default class ArrowButton extends Component {
    render() {
        return (
            <TouchableHighlight
                underlayColor={this.props.underlayColor}
                onPress={this.props.onPress}
                style={{width: this.props.size, height: this.props.size, backgroundColor: this.props.backgroundColor, justifyContent: 'center', alignItems: 'center'}}>
                <Icon style={{fontSize: this.props.size / 2, fontWeight: '100'}} color='white' name={this.props.name}/>
            </TouchableHighlight>
        )
    }
}