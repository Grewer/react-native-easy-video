import * as React from 'react'
import { Component, createRef } from 'react'
import { ActivityIndicator, PanResponder, PanResponderInstance, StatusBar, StyleSheet, View } from 'react-native'
import Video from 'react-native-video'
import Orientation, { OrientationType } from 'react-native-orientation-locker'
import Util from './utils/util'
import Control from './components/Control'
import RateView from './components/RateView'
import VideoHeader from './components/VideoHeader'

export interface VideoPropsType {
  /**
   * 正常播放下回退按钮的操作
   */
  goBack(): void

  /**
   * 头部右侧渲染
   * */
  renderMenu?: (isPortrait: boolean) => React.ReactNode

  /**
   *  文件名
   * */
  title: string

  /**
   *  文件源
   *  如果文件路径有中文记得使用 encodeURI
   *  如果需要播放 m3u8 ,需要添加 type:'m3u8'
   *  如果 uri 是一个本地文件地址,那暂不支持播放
   * */
  source: { uri?: string; type?: string; headers?: { [key: string]: any } } | number

  /**
   *  加载错误时的 callback
   * */
  onError?(error: {
    error: {
      '': string
      errorString: string
    }
  }): void

  /**
   * 默认倍数的显示
   * @default 1x
   * */
  defaultRateLabel?: ''

  /**
   * 视频缩放模式
   * @default contain
   * */
  resizeMode?: 'stretch' | 'contain' | 'cover' | 'none'
}

interface VideoViewStateType {
  volume: number
  duration: number
  currentTime: number
  paused: boolean
  rate: number
  rateShow: boolean
  controlShow: boolean
  isPortrait: boolean
  loading: boolean
  muted: boolean
}

export default class VideoView extends Component<VideoPropsType, VideoViewStateType> {
  private timeOut: NodeJS.Timeout
  private panResponder: PanResponderInstance
  private videoRatio: { rate?: number; width: number; height: number }
  private videoScreen: { width: number; paddingTop: number; paddingLeft: number; height: number; rate?: number }
  private statusHeight: number
  private video: InstanceType<typeof Video>
  private controlRef: React.RefObject<any> = createRef()
  private readonly isIphoneX: boolean
  private seekTimeOut: NodeJS.Timeout
  private seekTimeCheck = 0

  constructor(props: any) {
    super(props)
    // 页面初始，锁定屏幕为竖屏
    Orientation.lockToPortrait()
    this.isIphoneX = Util.isIPhoneX()
    // 初始化页面参数
    this.state = {
      rate: 1, // 用于倍速播放，0.0-暂停播放，1.0-正常速率播放，其他值 - 自定义速率，例如0.5慢速播放或者2.0快速播放
      volume: 1, // 视频播放的音量控制，1.0-满音量， 0.0-将音频静音
      muted: false, // 控制音频是否静音，(true、false)
      paused: true, // 控制视频播放暂停 (true、false) ，以上是Video组件的受控的参数
      loading: true,
      duration: 0.0, // 视频的总时长
      currentTime: 0.0, // 视频的当前播放进度，单位为秒
      rateShow: false, // 控制进度条的显示
      controlShow: true, // 用于控制层的控制
      isPortrait: true, // 初始为竖屏
    }
    this.calculateParams(true)
    // 处理触摸事件
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return true
      },
      onPanResponderTerminationRequest: () => {
        return true
      },
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        const { dx, dy } = gestureState
        return Math.abs(dx) > 5 || Math.abs(dy) > 5
      },
      onPanResponderGrant: e => {
        // console.log('view onPanResponderGrant', e.nativeEvent, g)
        // 显示控制层
        if (!this.state.controlShow) {
          this.setState({
            controlShow: true,
          })
        }
        // 清除定时器
        this.clearTimeout()
        if (this.state.rateShow) {
          // 隐藏右边的变速
          if (e.nativeEvent.pageX < this.videoScreen.width - 120) {
            this.setState({
              rateShow: false,
            })
          }
        }
      },
      onPanResponderMove: () => {
        // console.log('view onPanResponderMove')
        return false
      },
      onPanResponderRelease: () => {
        // 重新设置定时器，用于隐藏控制层
        this.closeControl()
      },
      onMoveShouldSetPanResponderCapture: () => {
        return false
      },
      onStartShouldSetPanResponderCapture: () => false,
    })
  }

  componentDidMount() {
    this.closeControl()

    // 添加屏幕方向监听
    Orientation.addOrientationListener(this.updateOrientation)
  }

  componentWillUnmount() {
    this.clearTimeout()
    // 关闭页面时让系统竖屏
    Orientation.lockToPortrait()
    // 移除屏幕监听
    Orientation.removeOrientationListener(this.updateOrientation)
  }

  updateOrientation = (orientation: OrientationType) => {
    // 监听屏幕的改变，重新计算视频的布局并重新渲染
    // console.log('屏幕变化', orientation)
    const isPortrait = orientation === 'PORTRAIT'
    this.calculateParams(isPortrait)
    this.setState({
      isPortrait,
    })
  }

  clearTimeout = () => {
    this.timeOut && clearTimeout(this.timeOut)
  }

  closeControl = () => {
    this.clearTimeout()
    this.timeOut = setTimeout(() => {
      this.setState({
        controlShow: false,
      })
    }, 5000)
  }

  changeLoading = (loading: boolean) => {
    if (loading !== this.state.loading) {
      this.setState({ loading })
    }
  }

  onLoadStart = () => {
    this.changeLoading(true)
  }

  changePaused = () => {
    this.setState(prevState => ({
      paused: !prevState.paused,
    }))
  }

  changeRateVisible = (rateShow: boolean) => {
    this.setState({ rateShow })
  }

  changeRate = (rate: number) => {
    this.setState({ rate })
  }

  // 计算视频的显示布局
  calculateParams = (isPortrait: boolean) => {
    Util.getSize()

    let width = Util.getWidth()
    let height = Util.getHeight()

    if (Util.isPlatform('android') && this.state.isPortrait !== isPortrait) {
      width = Util.getHeight()
      height = Util.getWidth()
    }

    // console.log(width, height, this.state.isPortrait, isPortrait)

    // 初始化视频可用分辨率
    this.videoScreen = {
      width,
      height,
      paddingTop: 0, // 用于竖屏
      paddingLeft: 0, // 用于横屏
      // rate:Util.getWidth()/Util.getHeight() //宽高比
    }

    // 计算视频可用分辨率
    this.statusHeight = 0

    // 竖屏
    if (isPortrait) {
      if (this.isIphoneX) {
        this.statusHeight = 40
        this.videoScreen.height -= 74
      } else {
        this.statusHeight = 20
        this.videoScreen.height -= 20
      }

      // 安卓不开启沉浸式时为0，
      if (Util.isPlatform('android')) {
        this.statusHeight = 0
      }
      // 竖屏设置top
      this.videoScreen.paddingTop = this.statusHeight
      this.videoScreen.paddingLeft = 0
    } else {
      // 横屏
      if (this.isIphoneX) {
        this.statusHeight = 40
        this.videoScreen.width -= 74
      } else if (Util.isPlatform('android')) {
        this.videoScreen.height = this.videoScreen.height - StatusBar.currentHeight || 0
      }
      // 横屏设置left
      this.videoScreen.paddingTop = 0
      this.videoScreen.paddingLeft = 34
    }

    // console.log(this.videoScreen)

    // 可用屏幕宽高比
    this.videoScreen.rate = this.videoScreen.width / this.videoScreen.height

    // 竖屏时候特殊处理，不全屏
    if (isPortrait) {
      if (this.videoRatio && this.videoScreen.rate < this.videoRatio.rate) {
        this.videoScreen.height = this.videoScreen.width / this.videoRatio.rate
      }
    }
  }

  // 设置视频的播放进度
  changeProgress = (time: number) => {
    this.video.seek(time)
  }

  // 改变视频的播放时间
  changeCurrentTime: (rate: number) => void = (rate: number) => {
    this.setState(prevState => ({
      currentTime: rate * prevState.duration,
    }))
  }

  // 加载视频获取视频相关参数
  onLoad = (data: any) => {
    // 如果在安卓中已经播放
    console.log('onLoad', data)
    if (Util.isPlatform('android')) {
      this.changeLoading(false)
    }
    this.setState({ duration: data.duration })
    // 获取视频实际分辨率
    this.videoRatio = {
      width: data.width,
      height: data.height,
    }
  }

  // 获取视频的播放进度
  onProgress = (data: { currentTime: any }) => {
    this.setState({ currentTime: data.currentTime })
  }

  // 视频播放完回调
  onEnd = () => {
    // console.log('onEnd')
    this.video.seek(0)
  }

  seekTrigger = (time: number) => {
    console.log('seekTrigger')
    this.seekTimeCheck = time
    this.seekTimeOut && clearTimeout(this.seekTimeOut)
    this.seekTimeOut = setTimeout(() => {
      this.changeLoading(true)
    }, 300)
  }

  onSeek = (data: { currentTime: number }) => {
    if (Util.isPlatform('android')) {
      return
    }
    console.log('onSeek', data, this.seekTimeCheck)
    if (Math.floor(this.seekTimeCheck) === Math.floor(data.currentTime)) {
      this.seekTimeOut && clearTimeout(this.seekTimeOut)
      this.changeLoading(false)
    }
  }

  render() {
    const { goBack, title, source, renderMenu, onError, defaultRateLabel, resizeMode } = this.props
    const { videoScreen } = this
    const { loading, rateShow, controlShow, isPortrait, volume, paused, muted, currentTime, duration, rate } = this.state
    const controlConfig = {
      duration,
      paused,
      rate,
      changeProgress: this.changeProgress,
      currentTime,
      isPortrait,
      changeCurrentTime: this.changeCurrentTime,
      changePaused: this.changePaused,
      changeRateVisible: this.changeRateVisible,
      defaultRateLabel,
      seekTrigger: this.seekTrigger,
    }

    // console.log('render video views', loading)
    return (
      <View
        style={{
          paddingTop: videoScreen.paddingTop,
          paddingLeft: this.isIphoneX ? videoScreen.paddingLeft : 0,
          flex: 1,
          justifyContent: isPortrait ? 'flex-start' : 'center',
          alignItems: isPortrait ? 'center' : 'flex-start',
          backgroundColor: 'black',
          position: 'relative',
        }}
      >
        <View {...this.panResponder.panHandlers} style={{ width: videoScreen.width, height: videoScreen.height, backgroundColor: 'black' }}>
          {/* 关于 iOS 加载 HTTP https://www.npmjs.com/package/react-native-video#ios-app-transport-security */}
          <Video
            reportBandwidth
            allowsExternalPlayback
            onLoadStart={this.onLoadStart}
            onReadyForDisplay={() => {
              this.changeLoading(false)
            }}
            source={source}
            style={{ width: '100%', height: '100%' }}
            rate={rate}
            paused={paused}
            volume={volume}
            muted={muted}
            resizeMode={resizeMode || 'contain'}
            repeat={false}
            onLoad={this.onLoad}
            onProgress={this.onProgress}
            onEnd={this.onEnd}
            onError={err => {
              this.changeLoading(false)
              onError && onError(err)
            }}
            onSeek={this.onSeek}
            useTextureView={false} // android 某种设置 test
            ref={ref => {
              this.video = ref
            }}
          />
          {loading && (
            <View style={[styles.loading, styles.horizontal]}>
              <ActivityIndicator size="large" color="#b0b0b0" />
            </View>
          )}

          {controlShow && (
            <View
              style={[
                styles.touchContainer,
                {
                  width: this.videoScreen.width,
                },
              ]}
            >
              <VideoHeader renderMenu={renderMenu} title={title} controlShow={controlShow} goBack={goBack} isPortrait={isPortrait} />
              <RateView rateShow={rateShow} changeRate={this.changeRate} />
              <View style={styles.control}>
                <Control ref={this.controlRef} {...controlConfig} />
              </View>
            </View>
          )}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  control: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    bottom: 0,
    height: 65,
    left: 0,
    position: 'absolute',
    width: '100%',
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loading: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    height: 100,
    justifyContent: 'center',
    left: '50%',
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -50 }, { translateX: -50 }],
    width: 100,
  },
  touchContainer: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0)',
    height: '100%',
    justifyContent: 'center',
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
  },
})
