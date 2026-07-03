/**
 * 网络请求封装
 * 复用窗口1的脚手架设计，增加 showLoading 支持
 */

const BASE_URL = 'http://localhost:8080'

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    if (options.showLoading) wx.showLoading({ title: '加载中...', mask: true })

    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success(res) {
        if (options.showLoading) wx.hideLoading()
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.showToast({ title: '请重新登录', icon: 'none' })
          reject(new Error('TOKEN_EXPIRED'))
        } else {
          const msg = res.data?.message || `请求失败 (${res.statusCode})`
          wx.showToast({ title: msg, icon: 'none' })
          reject(new Error(msg))
        }
      },
      fail(err) {
        if (options.showLoading) wx.hideLoading()
        wx.showToast({ title: '网络异常', icon: 'none' })
        reject(err)
      }
    })
  })
}

const get = (url, data) => request({ url, method: 'GET', data })
const post = (url, data) => request({ url, method: 'POST', data })
const put = (url, data) => request({ url, method: 'PUT', data })
const del = (url, data) => request({ url, method: 'DELETE', data })

module.exports = { request, get, post, put, del }
