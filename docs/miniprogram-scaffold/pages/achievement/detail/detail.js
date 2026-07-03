// pages/achievement/detail/detail.js
const { get } = require('../../../utils/request')
const { formatDate } = require('../../../utils/util')

Page({
  data: {
    id: '',
    achievement: null,
    loading: true
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
      const res = await get(`/api/achievements/${id}`)
      const achievement = res.data
      if (achievement.unlockedAt) {
        achievement.unlockedAtText = formatDate(achievement.unlockedAt, 'YYYY-MM-DD HH:mm')
      }
      this.setData({ achievement, loading: false })
    } catch (err) {
      console.error('[AchievementDetail] 加载失败', err)
      this.setData({ loading: false })
    }
  },

  onShareAppMessage() {
    const { achievement } = this.data
    if (achievement && achievement.unlocked) {
      return {
        title: `我解锁了「${achievement.name}」成就！`,
        path: `/pages/achievement/detail/detail?id=${this.data.id}`
      }
    }
    return {
      title: 'Get Yourself - 成就系统',
      path: '/pages/achievement/list/list'
    }
  }
})
