// pages/ai/recommend/recommend.js
const { get, post } = require('../../../utils/request')
const { checkLogin } = require('../../../utils/auth')
const { showToast } = require('../../../utils/util')

Page({
  data: {
    recommendations: [],
    loading: true,
    refreshing: false,
    userTags: [],
    selectedTags: []
  },

  onLoad() {
    this.loadRecommendations()
  },

  async loadRecommendations() {
    this.setData({ loading: true })
    try {
      await checkLogin()
      const res = await get('/api/ai/recommendations', {
        tags: this.data.selectedTags.join(',')
      })
      this.setData({
        recommendations: res.data.list || [],
        userTags: res.data.tags || [],
        loading: false
      })
    } catch (err) {
      console.error('[AIRecommend] 加载失败', err)
      this.setData({ loading: false })
    }
  },

  async onRefresh() {
    this.setData({ refreshing: true })
    try {
      await post('/api/ai/refresh-recommendations')
      await this.loadRecommendations()
      showToast('已刷新推荐', 'success')
    } catch (err) {
      console.error('[AIRecommend] 刷新失败', err)
    } finally {
      this.setData({ refreshing: false })
    }
  },

  onTagTap(e) {
    const { tag } = e.currentTarget.dataset
    let { selectedTags } = this.data
    const idx = selectedTags.indexOf(tag)
    if (idx > -1) {
      selectedTags.splice(idx, 1)
    } else {
      selectedTags.push(tag)
    }
    this.setData({ selectedTags })
    this.loadRecommendations()
  },

  onItemTap(e) {
    const { type, id } = e.currentTarget.dataset
    if (type === 'event') {
      wx.navigateTo({ url: `/pages/event/detail/detail?id=${id}` })
    } else if (type === 'challenge') {
      wx.navigateTo({ url: `/pages/challenge/detail/detail?id=${id}` })
    }
  },

  onShareAppMessage() {
    return {
      title: 'Get Yourself - AI 为你推荐的活动和挑战',
      path: '/pages/ai/recommend/recommend'
    }
  }
})
