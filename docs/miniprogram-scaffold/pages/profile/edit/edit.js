// pages/profile/edit/edit.js
const { post, upload } = require('../../../utils/request')
const { getUserInfo, checkLogin } = require('../../../utils/auth')
const { showToast, showLoading, hideLoading } = require('../../../utils/util')

Page({
  data: {
    form: {
      avatarUrl: '',
      nickName: '',
      gender: 0,
      bio: ''
    },
    genderOptions: ['未知', '男', '女'],
    genderIndex: 0,
    submitting: false
  },

  onLoad() {
    const userInfo = getUserInfo()
    if (userInfo) {
      this.setData({
        form: {
          avatarUrl: userInfo.avatarUrl || '',
          nickName: userInfo.nickName || '',
          gender: userInfo.gender || 0,
          bio: userInfo.bio || ''
        },
        genderIndex: userInfo.gender || 0
      })
    }
  },

  async onChooseAvatar() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed']
      })
      const filePath = res.tempFiles[0].tempFilePath
      this.setData({ 'form.avatarUrl': filePath })
    } catch (err) {
      console.log('取消选择头像')
    }
  },

  onNicknameInput(e) {
    this.setData({ 'form.nickName': e.detail.value })
  },

  onBioInput(e) {
    this.setData({ 'form.bio': e.detail.value })
  },

  onGenderChange(e) {
    const idx = e.detail.value
    this.setData({
      genderIndex: idx,
      'form.gender': idx
    })
  },

  async onSubmit() {
    const { form } = this.data

    if (!form.nickName.trim()) {
      showToast('请输入昵称')
      return
    }

    try {
      await checkLogin()
      this.setData({ submitting: true })
      showLoading('保存中...')

      let avatarUrl = form.avatarUrl
      // 如果是本地文件路径则先上传
      if (avatarUrl && avatarUrl.startsWith('wxfile://')) {
        const uploadRes = await upload('/api/upload/image', avatarUrl)
        avatarUrl = uploadRes.data.url
      }

      await post('/api/user/profile', {
        ...form,
        avatarUrl
      })

      // 更新本地缓存
      const userInfo = getUserInfo()
      const updatedInfo = { ...userInfo, ...form, avatarUrl }
      wx.setStorageSync('userInfo', updatedInfo)

      hideLoading()
      showToast('保存成功', 'success')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      hideLoading()
      console.error('[ProfileEdit] 保存失败', err)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
