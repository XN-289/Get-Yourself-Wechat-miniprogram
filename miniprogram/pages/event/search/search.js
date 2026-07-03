const { get } = require('../../../utils/request')
const { getCategoryLabel, getCategoryColor, formatDate } = require('../../../utils/util')
Page({
  data: { keyword: '', events: [], loading: false, searched: false, activeCategory: '全部', categories: ['全部','公益','企业','研究','线上','文化','校内'], categoryCodes: ['','PUBLIC_WELFARE','COMPANY','RESEARCH','ONLINE','CULTURE','CAMPUS'] },
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



