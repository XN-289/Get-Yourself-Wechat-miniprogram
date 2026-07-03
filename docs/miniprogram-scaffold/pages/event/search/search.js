// pages/event/search/search.js
const { get } = require('../../../utils/request')
const { debounce } = require('../../../utils/util')

Page({
  data: {
    keyword: '',
    results: [],
    loading: false,
    searched: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    // 绑定防抖搜索
    this.debouncedSearch = debounce(this.doSearch.bind(this), 500)
  },

  onInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ keyword })
    if (keyword) {
      this.debouncedSearch()
    } else {
      this.setData({ results: [], searched: false, page: 1, hasMore: true })
    }
  },

  onClear() {
    this.setData({ keyword: '', results: [], searched: false, page: 1, hasMore: true })
  },

  async doSearch() {
    const { keyword, page } = this.data
    if (!keyword) return

    this.setData({ loading: true })
    try {
      const res = await get('/api/events/search', { keyword, page, size: 10 })
      const list = res.data || []
      this.setData({
        results: page === 1 ? list : [...this.data.results, ...list],
        searched: true,
        hasMore: list.length >= 10,
        loading: false
      })
    } catch (err) {
      console.error('[Search] 搜索失败', err)
      this.setData({ loading: false })
    }
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.doSearch()
    }
  },

  onResultTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/event/detail/detail?id=${id}` })
  }
})
