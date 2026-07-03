// pages/index/index.js
const { get } = require('../../utils/request')
const { formatDate } = require('../../utils/util')

Page({
  data: {
    banners: [],
    hotEvents: [],
    recentChallenges: [],
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
      const [eventsRes, challengesRes] = await Promise.all([
        get('/api/events/hot', { limit: 5 }),
        get('/api/challenges/recent', { limit: 5 })
      ])
      this.setData({
        hotEvents: eventsRes.data || [],
        recentChallenges: challengesRes.data || []
      })
    } catch (err) {
      console.error('[Index] 加载失败', err)
    } finally {
      this.setData({ loading: false })
    }
  },

  onEventTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/event/detail/detail?id=${id}` })
  },

  onChallengeTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/challenge/detail/detail?id=${id}` })
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/event/search/search' })
  },

  onAiRecommendTap() {
    wx.navigateTo({ url: '/pages/ai/recommend/recommend' })
  },

  onShareAppMessage() {
    return {
      title: 'Get Yourself - 每天进步一点点',
      path: '/pages/index/index'
    }
  }
})
