/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {Component} from 'react';
import {StatusBar, StyleSheet, Text} from 'react-native';
import VideoView from 'react-native-easy-video'

type Props = {};
export default class App extends Component<Props> {
    render() {
        let source = require('./movie.mp4')
        // source = {
        //   uri: '',
        //   type: 'm3u8'
        // }
        return (
            <>
                <StatusBar barStyle={"light-content"}/>
                <VideoView
                    title="file name video.mp4"
                    source={source}
                    goBack={() => {
                        alert('goBack')
                    }}
                />
            </>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});
