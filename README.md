# react-native-easy-video


## Dependence:
- react-native-video
- react-native-orientation-locker

### react-native-orientation-locker
```
yarn add react-native-orientation-locker
// or npm i react-native-orientation-locker


// RN 0.59 and and below
react-native link react-native-orientation-locker
```

#### Configuration:
iOS  
Add the following to your project's AppDelegate.m:

```diff
+#import "Orientation.h"

@implementation AppDelegate

// ...

+- (UIInterfaceOrientationMask)application:(UIApplication *)application supportedInterfaceOrientationsForWindow:(UIWindow *)window {
+  return [Orientation getOrientation];
+}

@end
```
### react-native-video

Version 5.x recommends react-native >= 0.60.0 for Android 64bit builds and Android X support.

Version 4.x requires react-native >= 0.57.0

```
yarn add react-native-video
// or npm i react-native-video

react-native link react-native-video
```


#### notice
If you want to use ExoPlayer player in Android  

[project]/android/settings.gradle:
```
// Default player
project(':react-native-video').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-video/android')
// ExoPlayer More extensive support, such as ts in m3u8
project(':react-native-video').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-video/android-exoplayer')
```

## The runtime UI

### Android
<p>
<img src="https://grewer.github.io/dataSave/react-native-easy-video/android.png" width="200" height="400">
<img src="https://grewer.github.io/dataSave/react-native-easy-video/android-right.png" width="200" height="400">
<img src="https://grewer.github.io/dataSave/react-native-easy-video/android-height.png" width="200" height="400">
</p>

### iOS

<p>
<img src="https://grewer.github.io/dataSave/react-native-easy-video/iOS.png" width="200" height="400">
<img src="https://grewer.github.io/dataSave/react-native-easy-video/iOS-right.png" width="200" height="400">
<img src="https://grewer.github.io/dataSave/react-native-easy-video/iOS-height.png" width="200" height="400">
</p>


## example

https://github.com/Grewer/react-native-easy-video/tree/master/example

## Usage

### download
```
yarn add react-native-easy-video

// or npm i react-native-easy-video
```

```
import VideoView from 'react-native-easy-video'

<VideoView
    title="file name video.mp4"
    source={source}
    height={300}
    goBack={() => {
        alert('goBack')
    }}
/>
```

https://github.com/Grewer/react-native-easy-video/blob/master/example/App.js

## Props

```
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

  /**
   * 视频高度
   * */
  height?: number
}

```

## Future features

- [ ] volume  
- [x] mode2(Has a custom height) 
