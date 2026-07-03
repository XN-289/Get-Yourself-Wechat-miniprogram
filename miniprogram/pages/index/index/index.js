const { get } = require('../../../utils/request')
const { getCategoryLabel, getCategoryColor, formatDate } = require('../../../utils/util')
const app = getApp()

Page({
  data: {
    events: [], loading: true, error: '', keyword: '',
    activeCategory: '全部',
    categories: ['全部', '志愿公益', '企业实习', '科研竞赛', '线上实践', '文体活动', '校内活动', '技能提升'],
    categoryCodes: ['', 'VOLUNTEER', 'INTERNSHIP', 'RESEARCH', 'ONLINE', 'CULTURE', 'CAMPUS', 'SKILL']
  },
  onLoad() { this.loadEvents() },
  onPullDownRefresh() { this.loadEvents().finally(() => wx.stopPullDownRefresh()) },
  async loadEvents() {
    this.setData({ loading: true, error: '' })
    try {
      const idx = this.data.categories.indexOf(this.data.activeCategory)
      const category = this.data.categoryCodes[idx] || ''
      const events = await get('/api/events', { keyword: this.data.keyword, category })
      const list = (events || []).map(e => ({
        ...e,
        startTimeFormatted: formatDate(e.startTime, 'MM-DD HH:mm'),
        categoryLabel: getCategoryLabel(e.category),
        categoryColor: getCategoryColor(e.category)
      }))
      this.setData({ events: list, loading: false })
    } catch (err) { this.setData({ error: err.message || '加载失败', loading: false }) }
  },
  onSearchInput(e) { this.setData({ keyword: e.detail.value }) },
  onSearchConfirm() { this.loadEvents() },
  onCategoryTap(e) { this.setData({ activeCategory: e.currentTarget.dataset.category }); this.loadEvents() },
  onEventTap(e) { wx.navigateTo({ url: `/pages/event/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  onAiTap() { wx.navigateTo({ url: '/pages/ai/recommend/recommend' }) }
})
