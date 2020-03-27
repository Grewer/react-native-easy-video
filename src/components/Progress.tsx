import * as React from 'react'
import { Component } from 'react'
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeModules,
  PanResponder,
  PanResponderInstance,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'

interface IProps {
  style: StyleProp<ViewStyle>
  onEnd?: (rate: number) => void
  value: number
  onMove?: (rate: number) => void
  onStart?: () => void
  gap: number
}

export default class Progress extends Component<IProps, {}> {
  private pageX: number
  private progressLocation: { name?: string; width: number; pageX: number }
  private panResponder: PanResponderInstance
  private progress: null | { setNativeProps(props: Record<string, any>): void }
  private progressStyles = {
    style: {
      width: '0%',
    },
  }

  constructor(props: IProps) {
    super(props)
    this.pageX = 0 // 记录触摸按钮的位置
    // 进度条的位置和长度
    this.progressLocation = {
      pageX: 0,
      width: 0,
    }
    // console.log(this.props)
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: evt => {
        this.onStart(evt)
      },
      onPanResponderMove: (evt, gestureState) => {
        if (Math.abs(gestureState.vx) > 0) {
          // console.log('onMove', evt.nativeEvent.locationX)
          this.onMove(evt)
        }
      },
      onPanResponderRelease: () => {
        this.onEnd()
      },
      // 有竞争时候，不释放响应者角色
      onPanResponderTerminationRequest: () => {
        return false
      },
      onPanResponderTerminate: () => {
        this.onEnd()
      },
      onShouldBlockNativeResponder: () => {
        return true
      },
    })
  }

  _updateNativeStyles = () => {
    this.progress && this.progress.setNativeProps(this.progressStyles)
  }

  onStart = (e: GestureResponderEvent) => {
    // 获取 按钮的 x的位置
    this.pageX = e.nativeEvent.pageX
    this.props.onStart && this.props.onStart()
  }

  // 触摸点移动时回调
  onMove = (e: GestureResponderEvent) => {
    // console.log(this.pageX, e.nativeEvent.pageX)
    // 获取手指相对屏幕 x的坐标，并设计拖动按钮的位置，拖动按钮不能超出进度条的位置
    const { pageX } = e.nativeEvent
    this.pageX = pageX
    // console.log(this.pageX, this.progressLocation.pageX)
    const progressLength = this.progressLocation.pageX
    if (pageX <= progressLength) {
      this.pageX = progressLength
    } else if (pageX > progressLength + this.progressLocation.width) {
      // -10的目的是为了修正触摸点的直径，防止超过100%
      this.pageX = progressLength + this.progressLocation.width
    }
    const rate = (this.pageX - progressLength) / this.progressLocation.width
    this.progressStyles.style.width = `${(rate * 100).toFixed(0)}%`
    this._updateNativeStyles()
    this.props.onMove && this.props.onMove(rate)
  }

  // 触摸结束时回调
  onEnd = () => {
    this.props.onEnd && this.props.onEnd((this.pageX - this.progressLocation.pageX) / this.progressLocation.width)
  }

  onLayout = (event: LayoutChangeEvent) => {
    // let {x, y, width, height} = event.nativeEvent.layout;
    // 拿到这个view的x位置和宽度
    // @ts-ignore
    NativeModules.UIManager.measure(event.target, (x, y, width) => {
      // 安卓手机获取的值与ios不一样，特殊处理
      // if (Util.isPlatform('android')) {
      //   // x = pageX + 10
      // }
      // console.log('onLayout', x, y, width, height, pageX)
      this.progressLocation = {
        name: 'progressLocation',
        pageX: 20,
        width: width - 40,
      }
    })
  }

  render() {
    // console.log('render progress', ((this.pageX - this.progressLocation.pageX) / this.progressLocation.width), this.progressLocation)
    // Slider
    return (
      <View style={[this.props.style, { paddingHorizontal: 20 }]} onLayout={this.onLayout}>
        <View style={styles.maxProgress}>
          <View
            ref={ref => {
              this.progress = ref
            }}
            style={[styles.currentProgress, { width: `${(this.props.value || 0) * 100}%` }]}
          />
          <View {...this.panResponder.panHandlers} style={styles.drag} />
          <View style={styles.track} />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  currentProgress: {
    alignItems: 'center',
    backgroundColor: '#17AAFF',
    borderBottomLeftRadius: 3,
    borderTopLeftRadius: 3,
    height: 3,
    justifyContent: 'center',
    zIndex: 1001,
  },
  drag: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    transform: [{ translateX: -10 }],
    width: 20,
    zIndex: 3001,
  },
  maxProgress: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 30,
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%',
  },
  track: {
    backgroundColor: '#999',
    borderRadius: 3,
    flex: 1,
    height: 3,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 1000,
  },
})
