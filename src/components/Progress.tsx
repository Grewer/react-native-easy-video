import React from 'react'
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  NativeModules,
  PanResponder,
  PanResponderInstance,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native'

interface IProps {
  style: StyleProp<ViewStyle>
  onEnd?: (rate: number) => void
  value: number
  onMove?: (rate: number) => void
  onStart?: () => void
  gap: number
}

export default class Progress extends React.PureComponent<IProps, {}> {
  private pageX: number
  private progressLocation: { name?: string, width: number; pageX: number }
  private panResponder: PanResponderInstance
  private progress: (null | { setNativeProps(props: Object): void })
  private progressStyles = {
    style: {
      width: '0%',
    }
  }
  private isMove: boolean = false
  private record = 0

  constructor(props: IProps) {
    super(props)
    this.pageX = 0//记录触摸按钮的位置
    //进度条的位置和长度
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
      onPanResponderGrant: (evt) => {
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
      //有竞争时候，不释放响应者角色
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
    //获取 按钮的 x的位置
    this.pageX = e.nativeEvent.pageX
    this.isMove = true
    this.props.onStart && this.props.onStart()
  }

  //触摸点移动时回调
  onMove = (e: GestureResponderEvent) => {
    // console.log(this.pageX, e.nativeEvent.pageX)
    //获取手指相对屏幕 x的坐标，并设计拖动按钮的位置，拖动按钮不能超出进度条的位置
    const pageX = e.nativeEvent.pageX
    this.pageX = pageX
    // this.record = pageX
    // console.log(this.pageX, this.progressLocation.pageX)
    const progressLength = this.progressLocation.pageX
    if (pageX <= progressLength) {
      this.pageX = progressLength
    } else if (pageX > (progressLength + this.progressLocation.width)) {
      //-10的目的是为了修正触摸点的直径，防止超过100%
      this.pageX = progressLength + this.progressLocation.width
    }
    const rate = (this.pageX - progressLength) / this.progressLocation.width
    this.progressStyles.style.width = (rate * 100).toFixed(0) + '%'
    this._updateNativeStyles()
    if (Math.abs(this.record - pageX) > (this.props.gap || 1)) {
      this.record = pageX
      this.props.onMove && this.props.onMove(rate)
    }
  }

  //触摸结束时回调
  onEnd = () => {
    this.isMove = false
    this.props.onEnd && this.props.onEnd((this.pageX - this.progressLocation.pageX) / this.progressLocation.width)
  }


  onLayout = (event: LayoutChangeEvent) => {
    // let {x, y, width, height} = event.nativeEvent.layout;
    //拿到这个view的x位置和宽度
    // @ts-ignore
    NativeModules.UIManager.measure(event.target, (x, y, width, height, pageX, pageY) => {
      //安卓手机获取的值与ios不一样，特殊处理
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
          <View ref={(ref) => {
            this.progress = ref
          }} style={[styles.currentProgress, this.isMove ? {} : { width: (this.props.value || 0) * 100 + '%' }]}/>
          <View {...this.panResponder.panHandlers} style={styles.dragWrap}>
            <View style={styles.drag}/>
          </View>
          <View style={styles.track}>
          </View>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  maxProgress: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    height: 30,
    position: 'relative'
  },
  currentProgress: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 3,
    backgroundColor: '#17AAFF',
    zIndex: 1001,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3
  },
  dragWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 30,
    zIndex: 3001,
  },
  drag: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 20,
    height: 20,
    backgroundColor: '#fff',
    zIndex: 3001,
    transform: [{ translateX: -10 }]
  },
  track: {
    backgroundColor: '#999',
    flex: 1,
    height: 3,
    zIndex: 1000,
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 3,
  }
})
