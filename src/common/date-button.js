/**
 * Created by ggoma on 9/24/16.
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableHighlight,
    StyleSheet
} from 'react-native';

export default class DateButton extends Component {
    render() {

        var dot = <View style={{position:'absolute', left: 4, top: -4}}><Text style={{color: 'red', fontSize: 24}}></Text></View>;
        var fontSize = this.props.fontSize ? this.props.fontSize : 16;

        if(!this.props.empty) {
            dot = <View style={{position:'absolute', left: 4, top: -4}}><Text style={{color: 'red', fontSize: 24}}>.</Text></View>
        }

        return (
            <TouchableHighlight underlayColor='transparent' style={[{flex: 1}]}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{color: 'black', fontSize: fontSize}}>{this.props.text}</Text>
                    {dot}
                </View>
            </TouchableHighlight>
        )
    }
}