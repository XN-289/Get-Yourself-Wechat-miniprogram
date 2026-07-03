const { post } = require('../../../utils/request')
const { getCategoryLabel, getCategoryColor, formatDate } = require('../../../utils/util')
const app = getApp()

Page({
  data: {
    need: '', loading: false, recommendations: [], message: '', error: '',
    quickNeeds: ['想找线上实习机会', '周末想参加志愿活动', '想提升编程能力', '想找有报酬的兼职']
  },
  onLoad() { app.ensureLogin().catch(() => {}) },
  onNeedInput(e) { this.setData({ need: e.detail.value }) },
  onQuickNeed(e) { this.setData({ need: e.currentTarget.dataset.need }) },
  async onSubmit() {
    const need = this.data.need.trim()
    if (!need || this.data.loading) return
    this.setData({ loading: true, error: '', recommendations: [], message: '' })
    try {
      await app.ensureLogin()
      const res = await post('/api/ai/recommend-events', { need })
      this.setData({
        recommendations: (res.recommendations || []).map(r => ({
          ...r,
          event: r.event ? { ...r.event, categoryLabel: getCategoryLabel(r.event.category), categoryColor: getCategoryColor(r.event.category), startTimeFormatted: formatDate(r.event.startTime, 'MM-DD HH:mm') } : null
        })),
        message: res.message || '', loading: false
      })
    } catch (err) { this.setData({ error: err.message || 'AI推荐暂时不可用', loading: false }) }
  },
  onEventTap(e) { wx.navigateTo({ url: `/pages/event/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  onClear() { this.setData({ need: '', recommendations: [], message: '', error: '' }) }
})
