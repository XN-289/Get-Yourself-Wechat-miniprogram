const { get, post } = require('../../../utils/request')
const { formatDate, getCategoryLabel, getCategoryColor, showSuccess, showError } = require('../../../utils/util')
const app = getApp()

Page({
  data: {
    event: null,
    loading: true,
    error: '',
    isReserved: false,
    reservationId: null,
    qrToken: null,
    reserving: false,
    completing: false,
    showCompleteForm: false,
    did: '',
    learned: ''
  },

  onLoad(options) {
    if (options.id) {
      this.eventId = options.id
      this.loadEvent()
      this.checkReservation()
    }
  },

  async loadEvent() {
    this.setData({ loading: true, error: '' })
    try {
      const events = await get('/api/events')
      const event = (events || []).find(e => String(e.id) === String(this.eventId))
      if (event) {
        event.startTimeFormatted = formatDate(event.startTime, 'YYYY-MM-DD HH:mm')
        event.categoryLabel = getCategoryLabel(event.category)
        event.categoryColor = getCategoryColor(event.category)
        this.setData({ event, loading: false })
      } else {
        this.setData({ error: '事件不存在', loading: false })
      }
    } catch (err) {
      this.setData({ error: err.message || '加载失败', loading: false })
    }
  },

  async checkReservation() {
    if (!app.globalData.token) return
    try {
      const reservations = await get('/api/reservations')
      const reservation = (reservations || []).find(r => r.event?.id == this.eventId)
      if (reservation) {
        this.setData({
          isReserved: true,
          reservationId: reservation.id,
          qrToken: reservation.qrToken
        })
      }
    } catch (e) {
      // 静默失败
    }
  },

  async onReserve() {
    if (this.data.reserving || this.data.isReserved) return
    try { await app.ensureLogin() } catch (e) { showError('请先登录'); return }

    this.setData({ reserving: true })
    try {
      const result = await post('/api/reservations', { eventId: Number(this.eventId) })
      this.setData({
        isReserved: true,
        reserving: false,
        reservationId: result.id,
        qrToken: result.qrToken
      })
      showSuccess('预约成功')
    } catch (err) {
      this.setData({ reserving: false })
      showError(err.message || '预约失败')
    }
  },

  onCompleteTap() {
    this.setData({ showCompleteForm: true })
  },

  onDidInput(e) {
    this.setData({ did: e.detail.value })
  },

  onLearnedInput(e) {
    this.setData({ learned: e.detail.value })
  },

  onCancelComplete() {
    this.setData({ showCompleteForm: false })
  },

  async onConfirmComplete() {
    if (this.data.completing) return

    if (!this.data.qrToken) {
      showError('预约信息不完整，请重新预约')
      return
    }

    this.setData({ completing: true })
    try {
      await post('/api/reservations/scan-complete', { qrToken: this.data.qrToken })
      this.setData({ completing: false, showCompleteForm: false })
      showSuccess('完成记录已保存')
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) {
      this.setData({ completing: false })
      showError(err.message || '记录失败')
    }
  },

  onShareAppMessage() {
    return {
      title: this.data.event?.title || 'Get Yourself',
      path: `/pages/event/detail/detail?id=${this.eventId}`
    }
  }
})
