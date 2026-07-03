const { put } = require('../../../utils/request')
const { showSuccess, showError } = require('../../../utils/util')
const app = getApp()

Page({
  data: { nickname: '', avatarUrl: '', school: '', major: '', saving: false },
  onLoad() {
    const u = app.globalData.userInfo || {}
    this.setData({ nickname: u.nickname || '', avatarUrl: u.avatarUrl || '', school: u.school || '', major: u.major || '' })
  },
  onNicknameInput(e) { this.setData({ nickname: e.detail.value }) },
  onSchoolInput(e) { this.setData({ school: e.detail.value }) },
  onMajorInput(e) { this.setData({ major: e.detail.value }) },
  onChooseAvatar(e) { this.setData({ avatarUrl: e.detail.avatarUrl }) },
  async onSave() {
    if (this.data.saving) return
    this.setData({ saving: true })
    try {
      const res = await put('/api/auth/profile', { nickname: this.data.nickname.trim(), avatarUrl: this.data.avatarUrl, school: this.data.school.trim(), major: this.data.major.trim() })
      const userInfo = { ...app.globalData.userInfo, ...res }
      app.globalData.userInfo = userInfo; wx.setStorageSync('userInfo', userInfo)
      this.setData({ saving: false }); showSuccess('已保存')
      setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) { this.setData({ saving: false }); showError('保存失败') }
  }
})
