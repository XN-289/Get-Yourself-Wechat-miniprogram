// pages/challenge/list/list.js
const { get } = require('../../../utils/request')

Page({
  data: {
    categories: ['全部', '运动', '学习', '生活', '社交'],
    currentCategory: 0,
    list: [],
    loading: true,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadList(true)
  },

  onShow() {},

  onPullDownRefresh() {
    this.loadList(true).finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.loadList(false)
    }
  },

  async loadList(refresh) {
    if (refresh) {
      this.setData({ page: 1, hasMore: true })
    }
    this.setData({ loading: true })

    try {
      const category = this.data.categories[this.data.currentCategory]
      const params = {
        page: this.data.page,
        size: 10,
        category: category === '全部' ? '' : category
      }
      const res = await get('/api/challenges', params)
      const list = res.data || []
      this.setData({
        list: refresh ? list : [...this.data.list, ...list],
        hasMore: list.length >= 10,
        loading: false
      })
    } catch (err) {
      console.error('[ChallengeList] 加载失败', err)
      this.setData({ loading: false })
    }
  },

  onCategoryTap(e) {
    const { index } = e.currentTarget.dataset
    if (index === this.data.currentCategory) return
    this.setData({ currentCategory: index })
    this.loadList(true)
  },

  onItemTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/challenge/detail/detail?id=${id}` })
  },

  onCreateTap() {
    wx.navigateTo({ url: '/pages/challenge/create/create' })
  },

  onShareAppMessage() {
    return {
      title: 'Get Yourself - 来挑战自己！',
      path: '/pages/challenge/list/list'
    }
  }
})
