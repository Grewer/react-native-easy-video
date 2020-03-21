import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Orientation from 'react-native-orientation-locker'


const VideoHeader: React.FC<{
  controlShow: boolean
  isPortrait: boolean
  goBack(): void
  title: string
  renderMenu?: (isPortrait:boolean) => React.ReactNode
}> = React.memo((props) => {
  return <View style={styles.container}>
    <TouchableOpacity
      onPress={() => {
        if (props.isPortrait) {
          props.goBack && props.goBack()
        } else {
          Orientation.lockToPortrait()
        }
      }}
      style={{ height: '100%', width: 40, justifyContent: 'center', alignItems: 'center' }}>
      <Image style={{ height: 30, width: 30 }} source={require('../images/back.png')}/>
    </TouchableOpacity>

    <Text style={{ color: '#fff' }}>{props.title}</Text>

    {props.renderMenu && props.renderMenu(props.isPortrait)}
  </View>
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: 50,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)'
  }
})

export default VideoHeader
