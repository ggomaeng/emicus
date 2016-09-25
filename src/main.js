import React, { Component } from 'react';
import {
    StyleSheet,
    Navigator,
} from 'react-native';

import landing from './landing/index';



var ROUTES = {
    landing: landing,
};

export default class Main extends Component {


    renderScene(route, navigator) {
        var Component = ROUTES[route.name];

        return <Component route={route} navigator={navigator}/>


    }

    configureScene(route) {
        if (route.sceneConfig) {
            return route.sceneConfig;
        }
        return {
            ...CustomNavigatorSceneConfigs.FloatFromRight,
            gestures: {}
        };
    }

    render() {
        return (
            <Navigator
                initialRoute={{name: 'landing'}}
                renderScene={this.renderScene.bind(this)}
                configureScene={(route) => ({ ... Navigator.SceneConfigs.VerticalDownSwipeJump, gestures: false })}
                style={[styles.container]}
            />
        )
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1
    }
});