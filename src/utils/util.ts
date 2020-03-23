import { Dimensions, Platform } from 'react-native'

export default class Util {
  // 屏幕尺寸
  static size = Dimensions.get('window')

  static getSize = () => {
    Util.size = Dimensions.get('window')
  }

  static getDynamicWidth = () => {
    return Dimensions.get('window').width
  }

  // 获取屏幕宽度
  static getWidth() {
    return Util.size.width
  }

  // 获取屏幕高度
  static getHeight() {
    return Util.size.height
  }

  // 是否是指定平台
  static isPlatform(platform: string) {
    return Platform.OS === platform
  }

  // 判断是否是IPhoneX
  static isIPhoneX() {
    const size = Dimensions.get('window')

    return Platform.OS === 'ios' && (size.height === 812 || size.width === 812 || size.height === 896 || size.width === 896)
  }

  // 把传入的秒数格式化成 时分秒（00：00：00），
  static formSecondTotHMS = (seconds: number): string => {
    const minute: number = Math.floor(seconds / 60)
    return `${minute.toString().padStart(2, '0')}:${Math.floor(seconds - minute * 60)
      .toString()
      .padStart(2, '0')}`
  }
}
