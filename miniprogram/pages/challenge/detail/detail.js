const { get, post } = require('../../../utils/request')
const { formatDate, showSuccess, showError } = require('../../../utils/util')
Page({
  data: { challenge: null, loading: true, completing: false, showCompleteForm: false, did: '', learned: '' },
  onLoad(options) { if (options.id) { this.challengeId = options.id; this.loadChallenge() } },
  async loadChallenge() {
    this.setData({ loading: true })
    try {
      const challenges = await get('/api/challenges')
      const challenge = (challenges || []).find(c => String(c.id) === String(this.challengeId))
      if (challenge) {
        challenge.createdAtFormatted = formatDate(challenge.createdAt, 'YYYY-MM-DD HH:mm')
        challenge.completedAtFormatted = challenge.completedAt ? formatDate(challenge.completedAt, 'YYYY-MM-DD HH:mm') : ''
        this.setData({ challenge, loading: false })
      } else { showError('挑战不存在'); setTimeout(() => wx.navigateBack(), 1500) }
    } catch (err) { this.setData({ loading: false }); showError('加载失败') }
  },
  onCompleteTap() { this.setData({ showCompleteForm: true }) },
  onDidInput(e) { this.setData({ did: e.detail.value }) },
  onLearnedInput(e) { this.setData({ learned: e.detail.value }) },
  onCancelComplete() { this.setData({ showCompleteForm: false }) },
  async onConfirmComplete() {
    if (this.data.completing) return
    this.setData({ completing: true })
    try {
      await post(`/api/challenges/${this.challengeId}/complete`, { did: this.data.did, learned: this.data.learned })
      this.setData({ completing: false, showCompleteForm: false }); showSuccess('恭喜完成挑战！')
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) { this.setData({ completing: false }); showError(err.message || '记录失败') }
  }
})
