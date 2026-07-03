const { get } = require('../../../utils/request')
const app = getApp()

Page({
  data: { userInfo: null, summary: null, loading: true, isLoggedIn: false },
  onShow() { this.checkLogin() },
  checkLogin() {
    const userInfo = app.globalData.userInfo
    const isLoggedIn = !!app.globalData.token
    this.setData({ userInfo, isLoggedIn })
    if (isLoggedIn) { this.loadSummary() } else { this.setData({ loading: false }) }
  },
  async loadSummary() {
    try { const summary = await get('/api/achievements/summary'); this.setData({ summary: summary || {}, loading: false }) }
    catch (err) { this.setData({ loading: false }) }
  },
  async onLogin() {
    try { wx.showLoading({ title: '登录中...' }); await app.ensureLogin(); wx.hideLoading(); this.checkLogin(); wx.showToast({ title: '登录成功', icon: 'success' }) }
    catch (err) { wx.hideLoading(); wx.showToast({ title: '登录失败', icon: 'none' }) }
  },
  onEditProfile() { wx.navigateTo({ url: '/pages/profile/edit/edit' }) },
  onLogout() {
    wx.showModal({ title: '确认退出', content: '退出后需要重新登录', success: (res) => {
      if (res.confirm) { app.logout(); this.setData({ userInfo: null, summary: null, isLoggedIn: false }); wx.showToast({ title: '已退出', icon: 'success' }) }
    }})
  }
})
