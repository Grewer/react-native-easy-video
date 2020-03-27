import * as React from 'react'
import { Component, memo } from 'react'
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import Orientation from 'react-native-orientation-locker'
import Util from '../utils/util'
import Progress from './Progress'
import shallowEqual from '../utils/shallowEqual'

interface IProps {
  changeCurrentTime: (rate: number) => void
  changeProgress: (rate: number) => void
  changeRateVisible: (visible: boolean) => void
  currentTime: number
  duration: number
  paused: boolean
  changePaused: () => void
  isPortrait: boolean
  rate: number
  defaultRateLabel?: string
  seekTrigger: (seekTime: number) => void
}

const StartAndPaused: React.FC<Pick<IProps, 'changePaused' | 'paused'>> = memo(props => {
  return (
    <TouchableOpacity
      onPress={props.changePaused}
      style={{
        height: '100%',
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Image
        style={props.paused ? { height: 20, width: 20 } : { height: 16, width: 16 }}
        source={props.paused ? require('../images/play.png') : require('../images/pause.png')}
      />
    </TouchableOpacity>
  )
})

type IControlRight = {
  changeRateVisible(visible: boolean): void
  isPortrait: boolean
  rate: number
  defaultRateLabel?: string
}
const ControlRight: React.FC<IControlRight> = memo(props => {
  const { changeRateVisible, isPortrait, rate, defaultRateLabel } = props
  return (
    <View style={styles.toolRight}>
      <TouchableOpacity
        onPress={() => {
          changeRateVisible(true)
        }}
        style={{
          height: '100%',
          width: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff' }}>{defaultRateLabel && rate === 1 ? defaultRateLabel : `${rate}x`}</Text>
      </TouchableOpacity>

      {isPortrait && (
        <TouchableOpacity
          onPress={() => {
            Orientation.lockToLandscapeRight()
          }}
          style={{
            height: '100%',
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image style={{ height: 16, width: 16 }} source={require('../images/bigScreen.png')} />
        </TouchableOpacity>
      )}
    </View>
  )
})

class Control extends Component<IProps> {
  private timeCount: any
  private isMove: boolean

  shouldComponentUpdate(nextProps: Readonly<IProps>): boolean {
    if (this.isMove) {
      return false
    }
    return !shallowEqual(nextProps, this.props)
  }

  onStart = () => {
    this.isMove = true
  }

  changeMoveTime = (rate: number) => {
    // this.setState({ moveTime: this.props.duration * rate })
    // console.log(this.timeCount)
    this.timeCount &&
      this.timeCount.setNativeProps({
        text: Util.formSecondTotHMS(this.props.duration * rate),
      })
  }

  onEnd = (rate: number) => {
    this.isMove = false
    const time = rate * this.props.duration
    this.props.seekTrigger(time)
    this.props.changeProgress(time)
  }

  render() {
    const { changePaused, paused, duration, currentTime, rate, isPortrait, changeRateVisible, defaultRateLabel } = this.props
    // console.log('render control', currentTime / duration)
    return (
      <>
        <Progress
          style={styles.slider}
          gap={5}
          value={currentTime / duration}
          onStart={this.onStart}
          onMove={this.changeMoveTime}
          onEnd={this.onEnd}
        />
        <View style={styles.tools}>
          <View style={styles.toolLeft}>
            <StartAndPaused paused={paused} changePaused={changePaused} />
            <TextInput
              style={{
                color: '#fff',
                margin: 0,
                padding: 0,
                fontSize: 14,
              }}
              ref={ref => {
                this.timeCount = ref
              }}
              editable={false}
              defaultValue={Util.formSecondTotHMS(currentTime)}
            />
            <Text
              style={{
                color: '#fff',
              }}
            >{` / ${Util.formSecondTotHMS(duration)}`}</Text>
          </View>
          <ControlRight defaultRateLabel={defaultRateLabel} rate={rate} isPortrait={isPortrait} changeRateVisible={changeRateVisible} />
        </View>
      </>
    )
  }
}

const styles = StyleSheet.create({
  slider: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
  },
  toolLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-start',
  },
  toolRight: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0)',
    flexDirection: 'row',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  tools: {
    backgroundColor: 'rgba(0,0,0,0)',
    flexDirection: 'row',
    height: '50%',
    justifyContent: 'center',
    width: '100%',
  },
})

export default Control
