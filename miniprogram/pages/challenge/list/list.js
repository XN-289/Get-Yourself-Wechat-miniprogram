const { get, post } = require('../../../utils/request')
const { formatDate, showSuccess, showError } = require('../../../utils/util')
const app = getApp()
Page({
  data: { challenges: [], loading: true, activeTab: 'ACTIVE', tabs: [{ key: 'ACTIVE', label: '进行中' }, { key: 'COMPLETED', label: '已完成' }, { key: '', label: '全部' }] },
  onShow() { this.loadChallenges() },
  onPullDownRefresh() { this.loadChallenges().finally(() => wx.stopPullDownRefresh()) },
  async loadChallenges() {
    this.setData({ loading: true })
    try {
      await app.ensureLogin()
      const challenges = await get('/api/challenges', this.data.activeTab ? { status: this.data.activeTab } : {})
      this.setData({ challenges: (challenges || []).map(c => ({ ...c, createdAtFormatted: formatDate(c.createdAt, 'MM-DD HH:mm'), completedAtFormatted: c.completedAt ? formatDate(c.completedAt, 'MM-DD HH:mm') : '' })), loading: false })
    } catch (err) { this.setData({ loading: false }) }
  },
  onTabTap(e) { this.setData({ activeTab: e.currentTarget.dataset.tab }); this.loadChallenges() },
  onCreateTap() { wx.navigateTo({ url: '/pages/challenge/create/create' }) },
  onChallengeTap(e) { wx.navigateTo({ url: `/pages/challenge/detail/detail?id=${e.currentTarget.dataset.id}` }) },
  onCancelChallenge(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({ title: '确认取消', content: '确定要取消这个挑战吗？', success: async (res) => {
      if (res.confirm) { try { await post(`/api/challenges/${id}/cancel`); showSuccess('已取消'); this.loadChallenges() } catch (err) { showError('取消失败') } }
    }})
  }
})
