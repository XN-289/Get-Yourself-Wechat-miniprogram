// pages/profile/index/index.js
const { get } = require('../../../utils/request')
const { getUserInfo, logout, checkLogin } = require('../../../utils/auth')

Page({
  data: {
    userInfo: null,
    stats: {
      eventsJoined: 0,
      challengesJoined: 0,
      achievementsUnlocked: 0,
      totalPoints: 0
    },
    loading: true,
    menuList: [
      { id: 'edit', icon: '✏️', text: '编辑资料', url: '/pages/profile/edit/edit' },
      { id: 'achievements', icon: '🏆', text: '我的成就', url: '/pages/achievement/list/list' },
      { id: 'ai', icon: '🤖', text: 'AI 推荐', url: '/pages/ai/recommend/recommend' },
      { id: 'feedback', icon: '💬', text: '意见反馈', url: '' },
      { id: 'about', icon: 'ℹ️', text: '关于我们', url: '' }
    ]
  },

  onLoad() {
    this.loadProfile()
  },

  onShow() {
    // 每次显示时刷新用户信息
    const userInfo = getUserInfo()
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  onPullDownRefresh() {
    this.loadProfile().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadProfile() {
    this.setData({ loading: true })
    try {
      await checkLogin()
      const userInfo = getUserInfo()
      this.setData({ userInfo })

      const res = await get('/api/user/profile')
      this.setData({
        stats: res.data.stats || this.data.stats,
        loading: false
      })
    } catch (err) {
      console.error('[Profile] 加载失败', err)
      this.setData({ loading: false })
    }
  },

  onMenuTap(e) {
    const { url } = e.currentTarget.dataset
    if (url) {
      wx.navigateTo({ url })
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  onAvatarTap() {
    wx.navigateTo({ url: '/pages/profile/edit/edit' })
  },

  onLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success(res) {
        if (res.confirm) {
          logout()
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: 'Get Yourself - 成为更好的自己',
      path: '/pages/index/index'
    }
  }
})
