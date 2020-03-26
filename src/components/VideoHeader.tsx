import * as React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Orientation from 'react-native-orientation-locker'
import { memo } from 'react'

const VideoHeader: React.FC<{
  controlShow: boolean
  isPortrait: boolean
  goBack(): void
  title: string
  renderMenu?: (isPortrait: boolean) => React.ReactNode
}> = memo(props => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          if (props.isPortrait) {
            props.goBack && props.goBack()
          } else {
            Orientation.lockToPortrait()
          }
        }}
        style={{ height: '100%', width: 40, justifyContent: 'center', alignItems: 'center' }}
      >
        <Image style={{ height: 30, width: 30 }} source={require('../images/back.png')} />
      </TouchableOpacity>

      <Text style={{ color: '#fff' }}>{props.title}</Text>

      {props.renderMenu ? props.renderMenu(props.isPortrait) : <View />}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    height: 50,
    justifyContent: 'space-between',
    left: 0,
    position: 'absolute',
    top: 0,
    width: '100%',
  },
})

export default VideoHeader
