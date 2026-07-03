// pages/challenge/detail/detail.js
const { get, post } = require('../../../utils/request')
const { formatDate, showToast } = require('../../../utils/util')
const { checkLogin } = require('../../../utils/auth')

Page({
  data: {
    id: '',
    challenge: null,
    checkinRecords: [],
    loading: true,
    isJoined: false,
    todayChecked: false
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
      const res = await get(`/api/challenges/${id}`)
      const challenge = res.data
      challenge.startDateText = formatDate(challenge.startDate, 'YYYY-MM-DD')
      this.setData({
        challenge,
        isJoined: challenge.isJoined || false,
        todayChecked: challenge.todayChecked || false,
        checkinRecords: challenge.checkinRecords || [],
        loading: false
      })
    } catch (err) {
      console.error('[ChallengeDetail] 加载失败', err)
      this.setData({ loading: false })
    }
  },

  async onJoinTap() {
    try {
      await checkLogin()
      await post(`/api/challenges/${this.data.id}/join`)
      showToast('加入成功', 'success')
      this.setData({ isJoined: true })
      this.loadDetail(this.data.id)
    } catch (err) {
      console.error('[ChallengeDetail] 加入失败', err)
    }
  },

  async onCheckinTap() {
    try {
      await checkLogin()
      await post(`/api/challenges/${this.data.id}/checkin`)
      showToast('打卡成功！', 'success')
      this.setData({ todayChecked: true })
      this.loadDetail(this.data.id)
    } catch (err) {
      console.error('[ChallengeDetail] 打卡失败', err)
    }
  },

  onShareAppMessage() {
    const { challenge } = this.data
    return {
      title: challenge ? `来参加「${challenge.title}」挑战！` : '一起来挑战自己',
      path: `/pages/challenge/detail/detail?id=${this.data.id}`
    }
  }
})
