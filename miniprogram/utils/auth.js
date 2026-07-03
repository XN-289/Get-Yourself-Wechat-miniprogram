/**
 * 微信登录模块
 *
 * 流程：
 * 1. wx.login() 获取 code
 * 2. 发送 code 到后端
 * 3. 后端用 code 换取 openid，创建/查找用户
 * 4. 返回 token + 用户信息
 * 5. 前端存储 token 和用户信息
 */

const { post } = require('./request')

/**
 * 微信登录
 * @returns {Promise<{token: string, userInfo: object, isNewUser: boolean}>}
 */
const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (loginRes) => {
        if (!loginRes.code) {
          console.error('[Auth] wx.login 获取 code 失败')
          reject(new Error('wx.login 获取 code 失败'))
          return
        }

        try {
          console.log('[Auth] 发送 code 到后端...')
          const res = await post('/api/auth/wechat-login', { code: loginRes.code })

          const { token, user, isNewUser } = res

          // 存储到本地
          wx.setStorageSync('token', token)
          if (user) {
            wx.setStorageSync('userInfo', user)
          }

          // 更新全局状态
          const app = getApp()
          if (app) {
            app.globalData.token = token
            app.globalData.userInfo = user
          }

          console.log('[Auth] 登录成功', isNewUser ? '(新用户)' : '(老用户)')
          resolve({ token, userInfo: user, isNewUser })
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
 * @returns {Promise<{token: string, userInfo?: object}>}
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
 * @returns {object|null}
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
}

/**
 * 获取手机号（配合 button open-type="getPhoneNumber" 使用）
 * @param {object} e - bindgetphonenumber 回调事件对象
 * @returns {Promise<object>} 后端返回的手机号信息
 */
const getPhoneNumber = (e) => {
  return new Promise((resolve, reject) => {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      reject(new Error('用户拒绝授权手机号'))
      return
    }
    const code = e.detail.code
    post('/api/auth/bindphone', { code })
      .then(resolve)
      .catch(reject)
  })
}

module.exports = { login, checkLogin, getToken, getUserInfo, logout, getPhoneNumber }
