/**
 * 微信登录 & Token 管理
 */

const { post } = require('./request')

/**
 * 微信登录完整流程
 * 1. wx.login 获取 code
 * 2. 将 code 发送到后端换取 token
 * 3. 存储 token 和用户信息
 * @returns {Promise<{token: string, userInfo: Object}>}
 */
const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (loginRes) => {
        if (!loginRes.code) {
          reject(new Error('wx.login 获取 code 失败'))
          return
        }
        try {
          const res = await post('/api/auth/wx-login', { code: loginRes.code })
          const { token, userInfo } = res.data
          // 持久化存储
          wx.setStorageSync('token', token)
          if (userInfo) {
            wx.setStorageSync('userInfo', userInfo)
          }
          resolve({ token, userInfo })
        } catch (err) {
          console.error('[Auth] 后端登录接口失败', err)
          reject(err)
        }
      },
      fail(err) {
        console.error('[Auth] wx.login 失败', err)
        reject(err)
      }
    })
  })
}

/**
 * 检查登录状态，未登录则自动登录
 * @returns {Promise<{token: string, userInfo?: Object}>}
 */
const checkLogin = () => {
  const token = wx.getStorageSync('token')
  if (token) {
    const userInfo = wx.getStorageSync('userInfo')
    return Promise.resolve({ token, userInfo })
  }
  return login()
}

/**
 * 获取当前 token
 * @returns {string|null}
 */
const getToken = () => {
  return wx.getStorageSync('token') || null
}

/**
 * 获取当前用户信息
 * @returns {Object|null}
 */
const getUserInfo = () => {
  return wx.getStorageSync('userInfo') || null
}

/**
 * 退出登录
 */
const logout = () => {
  wx.removeStorageSync('token')
  wx.removeStorageSync('userInfo')
  const app = getApp()
  if (app) {
    app.globalData.token = null
    app.globalData.userInfo = null
  }
  wx.reLaunch({ url: '/pages/index/index' })
}

/**
 * 获取手机号（配合 button open-type="getPhoneNumber" 使用）
 * @param {Object} e - bindgetphonenumber 回调事件对象
 * @returns {Promise<Object>} 后端返回的手机号信息
 */
const getPhoneNumber = (e) => {
  return new Promise((resolve, reject) => {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      reject(new Error('用户拒绝授权手机号'))
      return
    }
    const code = e.detail.code
    post('/api/auth/phone-number', { code })
      .then(res => resolve(res.data))
      .catch(reject)
  })
}

module.exports = { login, checkLogin, getToken, getUserInfo, logout, getPhoneNumber }
