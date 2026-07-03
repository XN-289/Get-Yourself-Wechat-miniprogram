/**
 * 网络请求封装
 * - 统一 baseURL
 * - 自动携带 token
 * - 统一错误处理
 * - 401 自动跳转登录
 */

const BASE_URL = 'http://localhost:8080'

/**
 * 核心请求方法
 * @param {Object} options
 * @param {string} options.url    - 接口路径（不含 BASE_URL）
 * @param {string} options.method - HTTP 方法
 * @param {Object} options.data   - 请求数据
 * @param {Object} options.header - 额外请求头
 * @returns {Promise<Object>} 后端返回的 data 字段
 */
const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')

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
        if (res.statusCode === 200) {
          // 后端约定 code === 0 表示成功
          if (res.data.code === 0 || res.data.code === 200) {
            resolve(res.data)
          } else if (res.data.code === 401) {
            // token 过期，清除并重新登录
            wx.removeStorageSync('token')
            wx.removeStorageSync('userInfo')
            wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
            setTimeout(() => {
              wx.reLaunch({ url: '/pages/index/index' })
            }, 1500)
            reject(new Error('TOKEN_EXPIRED'))
          } else {
            // 业务错误
            const msg = res.data.message || res.data.msg || '请求失败'
            wx.showToast({ title: msg, icon: 'none' })
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.showToast({ title: '登录已过期', icon: 'none' })
          setTimeout(() => {
            wx.reLaunch({ url: '/pages/index/index' })
          }, 1500)
          reject(new Error('HTTP_401'))
        } else {
          wx.showToast({ title: `服务器异常 (${res.statusCode})`, icon: 'none' })
          reject(new Error(`HTTP_${res.statusCode}`))
        }
      },
      fail(err) {
        wx.showToast({ title: '网络连接失败，请检查网络', icon: 'none' })
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
 * 文件上传
 * @param {string} url     - 接口路径
 * @param {string} filePath - 本地文件路径
 * @param {string} name     - 文件对应的 key
 * @param {Object} formData - 额外表单数据
 * @returns {Promise<Object>}
 */
const upload = (url, filePath, name = 'file', formData = {}) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    wx.uploadFile({
      url: `${BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success(res) {
        if (res.statusCode === 200) {
          const data = JSON.parse(res.data)
          if (data.code === 0 || data.code === 200) {
            resolve(data)
          } else {
            wx.showToast({ title: data.message || '上传失败', icon: 'none' })
            reject(data)
          }
        } else {
          wx.showToast({ title: `上传失败 (${res.statusCode})`, icon: 'none' })
          reject(new Error(`HTTP_${res.statusCode}`))
        }
      },
      fail(err) {
        wx.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

module.exports = { request, get, post, put, del, upload }
