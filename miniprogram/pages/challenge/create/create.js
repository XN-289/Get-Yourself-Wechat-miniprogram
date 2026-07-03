const { post } = require('../../../utils/request')
const { showSuccess, showError } = require('../../../utils/util')
Page({
  data: { title: '', category: '', goal: '', description: '', categories: ['技能提升','考试考证','身体锻炼','阅读学习','项目实践','社交拓展','其他'], submitting: false },
  onTitleInput(e) { this.setData({ title: e.detail.value }) },
  onCategoryChange(e) { this.setData({ category: this.data.categories[e.detail.value] }) },
  onGoalInput(e) { this.setData({ goal: e.detail.value }) },
  onDescInput(e) { this.setData({ description: e.detail.value }) },
  async onSubmit() {
    const { title, category, goal, description } = this.data
    if (!title.trim()) { showError('请输入挑战标题'); return }
    if (!category) { showError('请选择分类'); return }
    this.setData({ submitting: true })
    try {
      await post('/api/challenges', { title: title.trim(), category, goal: goal.trim(), description: description.trim() })
      showSuccess('创建成功'); setTimeout(() => wx.navigateBack(), 1500)
    } catch (err) { showError(err.message || '创建失败') } finally { this.setData({ submitting: false }) }
  }
})
