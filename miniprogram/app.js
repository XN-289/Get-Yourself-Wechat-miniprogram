const { login, checkLogin, logout } = require('./utils/auth')

App({
  globalData: {
    userInfo: null,
    token: null,
    baseUrl: 'http://localhost:8080'
  },

  onLaunch() {
    // 从缓存恢复登录态
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    if (token) {
      this.globalData.token = token
      this.globalData.userInfo = userInfo
    }
  },

  /**
   * 确保已登录
   */
  async ensureLogin() {
    if (this.globalData.token) return this.globalData.token
    const { token, userInfo } = await login()
    this.globalData.token = token
    this.globalData.userInfo = userInfo
    return token
  },

  /**
   * 退出登录
   */
  logout() {
    logout()
    this.globalData.token = null
    this.globalData.userInfo = null
  }
})
