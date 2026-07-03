const { get } = require('../../../utils/request')
const { getCategoryLabel, getCategoryColor, formatDate, getCategoryIcon } = require('../../../utils/util')
const app = getApp()

Page({
  data: {
    events: [],
    loading: true,
    error: '',
    keyword: '',
    activeCategory: '全部',
    categories: ['全部', '志愿公益', '企业实习', '科研竞赛', '线上实践', '文体活动', '校内活动', '技能提升'],
    categoryCodes: ['', 'VOLUNTEER', 'INTERNSHIP', 'RESEARCH', 'ONLINE', 'CULTURE', 'CAMPUS', 'SKILL'],
    isLoggedIn: false,
    refreshing: false
  },

  onLoad() {
    this.checkLoginAndLoad()
  },

  onShow() {
    // 每次显示页面时检查登录状态
    this.setData({ isLoggedIn: !!app.globalData.token })
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true })
    this.loadEvents().finally(() => {
      wx.stopPullDownRefresh()
      this.setData({ refreshing: false })
    })
  },

  async checkLoginAndLoad() {
    // 尝试自动登录
    try {
      await app.ensureLogin()
      this.setData({ isLoggedIn: true })
    } catch (err) {
      console.log('[Index] 自动登录失败，展示未登录状态')
    }
    this.loadEvents()
  },

  async loadEvents() {
    this.setData({ loading: true, error: '' })
    try {
      const idx = this.data.categories.indexOf(this.data.activeCategory)
      const category = this.data.categoryCodes[idx] || ''
      const events = await get('/api/events', {
        keyword: this.data.keyword,
        category
      })

      const list = (events || []).map(e => ({
        ...e,
        startTimeFormatted: formatDate(e.startTime, 'MM-DD HH:mm'),
        categoryLabel: getCategoryLabel(e.category),
        categoryColor: getCategoryColor(e.category),
        categoryIcon: getCategoryIcon(e.category)
      }))

      this.setData({ events: list, loading: false })
    } catch (err) {
      console.error('[Index] 加载事件失败', err)
      this.setData({
        error: err.message || '加载失败',
        loading: false
      })
    }
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value })
  },

  onSearchConfirm() {
    this.loadEvents()
  },

  onClearSearch() {
    this.setData({ keyword: '' })
    this.loadEvents()
  },

  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ activeCategory: category })
    this.loadEvents()
  },

  onEventTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/event/detail/detail?id=${id}` })
  },

  onAiTap() {
    wx.navigateTo({ url: '/pages/ai/recommend/recommend' })
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/event/search/search' })
  },

  onRetry() {
    this.loadEvents()
  },

  onShareAppMessage() {
    return {
      title: 'Get Yourself - 记录成长，发现机会',
      path: '/pages/index/index/index'
    }
  }
})
