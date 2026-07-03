// pages/event/detail/detail.js
const { get, post } = require('../../../utils/request')
const { formatDate, showToast } = require('../../../utils/util')
const { checkLogin } = require('../../../utils/auth')

Page({
  data: {
    id: '',
    event: null,
    loading: true,
    isJoined: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      this.loadDetail(options.id)
    }
  },

  async loadDetail(id) {
    this.setData({ loading: true })
    try {
      const res = await get(`/api/events/${id}`)
      const event = res.data
      event.dateText = formatDate(event.startTime, 'YYYY-MM-DD HH:mm')
      this.setData({ event, loading: false })
    } catch (err) {
      console.error('[EventDetail] 加载失败', err)
      this.setData({ loading: false })
    }
  },

  async onJoinTap() {
    try {
      await checkLogin()
      await post(`/api/events/${this.data.id}/join`)
      showToast('报名成功', 'success')
      this.setData({ isJoined: true })
      this.loadDetail(this.data.id)
    } catch (err) {
      console.error('[EventDetail] 报名失败', err)
    }
  },

  onShareAppMessage() {
    const { event } = this.data
    return {
      title: event ? event.title : '精彩活动等你来',
      path: `/pages/event/detail/detail?id=${this.data.id}`
    }
  }
})
