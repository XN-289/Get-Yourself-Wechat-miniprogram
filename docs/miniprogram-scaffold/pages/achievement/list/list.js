// pages/achievement/list/list.js
const { get } = require('../../../utils/request')

Page({
  data: {
    achievements: [],
    stats: {
      total: 0,
      unlocked: 0,
      points: 0
    },
    loading: true
  },

  onLoad() {
    this.loadData()
  },

  onShow() {},

  onPullDownRefresh() {
    this.loadData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadData() {
    this.setData({ loading: true })
    try {
      const res = await get('/api/achievements')
      const { achievements, stats } = res.data
      this.setData({
        achievements: achievements || [],
        stats: stats || this.data.stats,
        loading: false
      })
    } catch (err) {
      console.error('[AchievementList] 加载失败', err)
      this.setData({ loading: false })
    }
  },

  onItemTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/achievement/detail/detail?id=${id}` })
  },

  onShareAppMessage() {
    return {
      title: `我已解锁 ${this.data.stats.unlocked} 个成就，快来看看`,
      path: '/pages/achievement/list/list'
    }
  }
})
