// app.js
const { login } = require('./utils/auth')

App({
  onLaunch() {
    // 小程序启动时自动登录
    this.autoLogin()
  },

  /**
   * 自动登录：wx.login → 后端 code2session → 存储 token
   */
  async autoLogin() {
    try {
      const { token, userInfo } = await login()
      this.globalData.token = token
      this.globalData.userInfo = userInfo
      console.log('[App] 登录成功', userInfo)
    } catch (err) {
      console.error('[App] 登录失败', err)
    }
  },

  /**
   * 全局数据
   */
  globalData: {
    token: null,
    userInfo: null,
    baseUrl: 'http://localhost:8080'
  }
})
