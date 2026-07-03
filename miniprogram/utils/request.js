/**
 * 网络请求封装
 *
 * 设计原则：
 * 1. 自动携带 token
 * 2. 统一错误处理
 * 3. 401 自动清除登录态
 * 4. 支持 showLoading
 * 5. 请求超时处理
 */

const BASE_URL = 'http://localhost:8080'
const TIMEOUT = 15000  // 15秒超时

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    if (options.showLoading) {
      wx.showLoading({ title: options.loadingText || '加载中...', mask: true })
    }

    const startTime = Date.now()

    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      timeout: TIMEOUT,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success(res) {
        if (options.showLoading) wx.hideLoading()

        const duration = Date.now() - startTime
        if (duration > 3000) {
          console.warn(`[Request] ${options.url} took ${duration}ms`)
        }

        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // token 过期，清除登录态
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          const app = getApp()
          if (app) {
            app.globalData.token = null
            app.globalData.userInfo = null
          }
          wx.showToast({ title: '请重新登录', icon: 'none', duration: 2000 })
          reject(new Error('TOKEN_EXPIRED'))
        } else if (res.statusCode === 400) {
          const msg = res.data?.message || '参数错误'
          wx.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        } else if (res.statusCode === 404) {
          wx.showToast({ title: '资源不存在', icon: 'none' })
          reject(new Error('NOT_FOUND'))
        } else if (res.statusCode >= 500) {
          wx.showToast({ title: '服务器繁忙，请稍后重试', icon: 'none' })
          reject(new Error(`SERVER_ERROR_${res.statusCode}`))
        } else {
          const msg = res.data?.message || `请求失败 (${res.statusCode})`
          wx.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail(err) {
        if (options.showLoading) wx.hideLoading()

        let msg = '网络异常，请检查网络连接'
        if (err.errMsg?.includes('timeout')) {
          msg = '请求超时，请稍后重试'
        }
        wx.showToast({ title: msg, icon: 'none', duration: 2000 })
        reject(err)
      }
    })
  })
}

/**
 * GET 请求
 */
const get = (url, data) => request({ url, method: 'GET', data })

/**
 * POST 请求
 */
const post = (url, data) => request({ url, method: 'POST', data })

/**
 * PUT 请求
 */
const put = (url, data) => request({ url, method: 'PUT', data })

/**
 * DELETE 请求
 */
const del = (url, data) => request({ url, method: 'DELETE', data })

/**
 * 带 loading 的 POST 请求
 */
const postWithLoading = (url, data, loadingText) =>
  request({ url, method: 'POST', data, showLoading: true, loadingText })

module.exports = { request, get, post, put, del, postWithLoading }
