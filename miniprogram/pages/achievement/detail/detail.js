const { get, put } = require('../../../utils/request')
const { formatDate, getCategoryLabel, getCategoryColor, showSuccess, showError } = require('../../../utils/util')
Page({
  data: { record: null, loading: true, editing: false, saving: false, did: '', learned: '' },
  onLoad(options) { if (options.id) { this.recordId = options.id; this.loadRecord() } },
  async loadRecord() {
    this.setData({ loading: true })
    try {
      const records = await get('/api/achievements/history')
      const record = (records || []).find(r => String(r.id) === String(this.recordId))
      if (record) {
        record.completedAtFormatted = formatDate(record.completedAt, 'YYYY-MM-DD HH:mm')
        record.categoryLabel = getCategoryLabel(record.category)
        record.categoryColor = getCategoryColor(record.category)
        this.setData({ record, did: record.did || '', learned: record.learned || '', loading: false })
      } else { showError('记录不存在'); setTimeout(() => wx.navigateBack(), 1500) }
    } catch (err) { this.setData({ loading: false }); showError('加载失败') }
  },
  onEditTap() { this.setData({ editing: true }) },
  onCancelEdit() { this.setData({ editing: false, did: this.data.record.did || '', learned: this.data.record.learned || '' }) },
  onDidInput(e) { this.setData({ did: e.detail.value }) },
  onLearnedInput(e) { this.setData({ learned: e.detail.value }) },
  async onSave() {
    if (this.data.saving) return
    this.setData({ saving: true })
    try {
      await put(`/api/achievements/${this.recordId}/reflection`, { did: this.data.did, learned: this.data.learned })
      this.setData({ saving: false, editing: false, 'record.did': this.data.did, 'record.learned': this.data.learned })
      showSuccess('已保存')
    } catch (err) { this.setData({ saving: false }); showError('保存失败') }
  }
})
