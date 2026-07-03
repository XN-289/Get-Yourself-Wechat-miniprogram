const { get } = require('../../../utils/request')
const { getCategoryLabel, getCategoryColor, formatDate } = require('../../../utils/util')
Page({
  data: { keyword: '', events: [], loading: false, searched: false, activeCategory: '全部', categories: ['全部','志愿公益','企业实习','科研竞赛','线上实践','文体活动','校内活动','技能提升'], categoryCodes: ['','VOLUNTEER','INTERNSHIP','RESEARCH','ONLINE','CULTURE','CAMPUS','SKILL'] },
  onSearchInput(e) { this.setData({ keyword: e.detail.value }) },
  onSearchConfirm() { this.doSearch() },
  onCategoryTap(e) { this.setData({ activeCategory: e.currentTarget.dataset.category }); if (this.data.searched) this.doSearch() },
  async doSearch() {
    const keyword = this.data.keyword.trim()
    this.setData({ loading: true, searched: true })
    try {
      const idx = this.data.categories.indexOf(this.data.activeCategory)
      const events = await get('/api/events', { keyword, category: this.data.categoryCodes[idx] || '' })
      this.setData({ events: (events || []).map(e => ({ ...e, startTimeFormatted: formatDate(e.startTime, 'MM-DD HH:mm'), categoryLabel: getCategoryLabel(e.category), categoryColor: getCategoryColor(e.category) })), loading: false })
    } catch (err) { this.setData({ loading: false }); wx.showToast({ title: '搜索失败', icon: 'none' }) }
  },
  onEventTap(e) { wx.navigateTo({ url: `/pages/event/detail/detail?id=${e.currentTarget.dataset.id}` }) }
})



