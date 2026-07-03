/**
 * 微信登录模块
 * 复用窗口1脚手架的 auth.js 设计
 */

const { post } = require('./request')

/**
 * 微信登录完整流程
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
          const res = await post('/api/auth/wechat-login', { code: loginRes.code })
          const { token, user, isNewUser } = res
          wx.setStorageSync('token', token)
          if (user) wx.setStorageSync('userInfo', user)
          resolve({ token, userInfo: user, isNewUser })
        } catch (err) {
          reject(err)
        }
      },
      fail: reject
    })
  })
}

/**
 * 检查登录状态
 */
const checkLogin = () => {
  const token = wx.getStorageSync('token')
  if (token) {
    return Promise.resolve({ token, userInfo: wx.getStorageSync('userInfo') })
  }
  return login()
}

/**
 * 获取手机号（配合 button open-type="getPhoneNumber"）
 */
const getPhoneNumber = (e) => {
  return new Promise((resolve, reject) => {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      reject(new Error('用户拒绝授权手机号'))
      return
    }
    post('/api/auth/bindphone', { code: e.detail.code })
      .then(resolve)
      .catch(reject)
  })
}

/**
 * 退出登录
 */
const logout = () => {
  wx.removeStorageSync('token')
  wx.removeStorageSync('userInfo')
}

module.exports = { login, checkLogin, getPhoneNumber, logout }
