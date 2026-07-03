/**
 * 通用工具函数
 */

/**
 * 日期格式化
 * @param {Date|number|string} date - Date 对象、时间戳或日期字符串
 * @param {string} fmt - 格式模板，如 'YYYY-MM-DD HH:mm:ss'
 * @returns {string}
 */
const formatDate = (date, fmt = 'YYYY-MM-DD') => {
  if (!date) return ''
  if (typeof date === 'number' || typeof date === 'string') {
    date = new Date(date)
  }
  if (!(date instanceof Date) || isNaN(date.getTime())) return ''

  const map = {
    'YYYY': date.getFullYear(),
    'MM': padZero(date.getMonth() + 1),
    'DD': padZero(date.getDate()),
    'HH': padZero(date.getHours()),
    'mm': padZero(date.getMinutes()),
    'ss': padZero(date.getSeconds())
  }

  let result = fmt
  Object.keys(map).forEach(key => {
    result = result.replace(key, map[key])
  })
  return result
}

/**
 * 补零
 * @param {number} n
 * @returns {string}
 */
const padZero = (n) => {
  return n < 10 ? '0' + n : '' + n
}

/**
 * 相对时间（几分钟前、几小时前）
 * @param {Date|number|string} date
 * @returns {string}
 */
const timeAgo = (date) => {
  if (!date) return ''
  if (typeof date === 'number' || typeof date === 'string') {
    date = new Date(date)
  }
  const now = Date.now()
  const diff = now - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  return formatDate(date, 'MM-DD')
}

/**
 * 数字格式化（超过万用 W 表示）
 * @param {number} num
 * @returns {string}
 */
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  if (num >= 10000) {
    return (num / 10000).toFixed(1).replace(/\.0$/, '') + 'W'
  }
  return '' + num
}

/**
 * 防抖
 * @param {Function} fn
 * @param {number} delay - 毫秒
 * @returns {Function}
 */
const debounce = (fn, delay = 300) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 节流
 * @param {Function} fn
 * @param {number} interval - 毫秒
 * @returns {Function}
 */
const throttle = (fn, interval = 300) => {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 生成唯一 ID
 * @returns {string}
 */
const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * 深拷贝
 * @param {*} obj
 * @returns {*}
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj
  return JSON.parse(JSON.stringify(obj))
}

/**
 * rpx 转 px
 * @param {number} rpx
 * @returns {number}
 */
const rpxToPx = (rpx) => {
  const systemInfo = wx.getSystemInfoSync()
  return rpx * systemInfo.windowWidth / 750
}

/**
 * 显示加载中
 * @param {string} title
 */
const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true })
}

/**
 * 隐藏加载中
 */
const hideLoading = () => {
  wx.hideLoading()
}

/**
 * 显示轻提示
 * @param {string} title
 * @param {string} icon - success | error | none
 */
const showToast = (title, icon = 'none') => {
  wx.showToast({ title, icon, duration: 2000 })
}

module.exports = {
  formatDate,
  padZero,
  timeAgo,
  formatNumber,
  debounce,
  throttle,
  uuid,
  deepClone,
  rpxToPx,
  showLoading,
  hideLoading,
  showToast
}
