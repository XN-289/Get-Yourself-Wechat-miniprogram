// pages/challenge/create/create.js
const { post } = require('../../../utils/request')
const { checkLogin } = require('../../../utils/auth')
const { showToast, showLoading, hideLoading } = require('../../../utils/util')

Page({
  data: {
    form: {
      title: '',
      description: '',
      category: '',
      duration: 7,
      difficulty: 1,
      coverImage: ''
    },
    categories: ['运动', '学习', '生活', '社交'],
    categoryIndex: -1,
    durationOptions: [7, 14, 21, 30],
    durationIndex: 0,
    submitting: false
  },

  onLoad() {},

  onTitleInput(e) {
    this.setData({ 'form.title': e.detail.value })
  },

  onDescInput(e) {
    this.setData({ 'form.description': e.detail.value })
  },

  onCategoryChange(e) {
    const idx = e.detail.value
    this.setData({
      categoryIndex: idx,
      'form.category': this.data.categories[idx]
    })
  },

  onDurationChange(e) {
    const idx = e.detail.value
    this.setData({
      durationIndex: idx,
      'form.duration': this.data.durationOptions[idx]
    })
  },

  onDifficultyTap(e) {
    const { level } = e.currentTarget.dataset
    this.setData({ 'form.difficulty': level })
  },

  async onChooseCover() {
    try {
      const res = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed']
      })
      const filePath = res.tempFiles[0].tempFilePath
      this.setData({ 'form.coverImage': filePath })
    } catch (err) {
      console.log('取消选择图片')
    }
  },

  async onSubmit() {
    const { form } = this.data

    // 校验
    if (!form.title.trim()) {
      showToast('请输入挑战标题')
      return
    }
    if (!form.description.trim()) {
      showToast('请输入挑战描述')
      return
    }
    if (!form.category) {
      showToast('请选择分类')
      return
    }

    try {
      await checkLogin()
      this.setData({ submitting: true })
      showLoading('创建中...')

      let coverUrl = ''
      if (form.coverImage) {
        const { upload } = require('../../../utils/request')
        const uploadRes = await upload('/api/upload/image', form.coverImage)
        coverUrl = uploadRes.data.url
      }

      await post('/api/challenges', {
        ...form,
        coverImage: coverUrl
      })

      hideLoading()
      showToast('创建成功', 'success')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    } catch (err) {
      hideLoading()
      console.error('[CreateChallenge] 创建失败', err)
    } finally {
      this.setData({ submitting: false })
    }
  }
})
