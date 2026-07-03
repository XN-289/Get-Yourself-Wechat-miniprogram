const { get } = require('../../../utils/request')
const { formatDate, getCategoryLabel, getCategoryColor } = require('../../../utils/util')
const app = getApp()

Page({
  data: { records: [], summary: null, loading: true, radarData: [] },
  onShow() { this.loadData() },
  onPullDownRefresh() { this.loadData().finally(() => wx.stopPullDownRefresh()) },
  async loadData() {
    this.setData({ loading: true })
    try {
      await app.ensureLogin()
      const [records, summary] = await Promise.all([get('/api/achievements/history'), get('/api/achievements/summary')])
      this.setData({
        records: (records || []).map(r => ({ ...r, completedAtFormatted: formatDate(r.completedAt, 'YYYY-MM-DD'), categoryLabel: getCategoryLabel(r.category), categoryColor: getCategoryColor(r.category) })),
        summary: summary || {},
        loading: false
      })
      if (summary?.growthCurve?.length > 0) {
        const latest = summary.growthCurve[summary.growthCurve.length - 1]
        const dims = latest.dimensions || {}
        this.setData({ radarData: Object.entries(dims).map(([name, value]) => ({ name, value: Math.min(value, 100) })) })
      }
    } catch (err) { this.setData({ loading: false }) }
  },
  onRecordTap(e) { wx.navigateTo({ url: `/pages/achievement/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  onShareAppMessage() { return { title: `我已完成 ${this.data.summary?.completedCount || 0} 个成长记录`, path: '/pages/index/index/index' } }
})
