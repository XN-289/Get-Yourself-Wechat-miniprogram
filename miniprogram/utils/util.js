/**
 * 工具函数
 */

function formatDate(date, fmt = 'YYYY-MM-DD') {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  const pad = n => String(n).padStart(2, '0')
  const map = {
    'YYYY': d.getFullYear(), 'MM': pad(d.getMonth() + 1), 'DD': pad(d.getDate()),
    'HH': pad(d.getHours()), 'mm': pad(d.getMinutes()), 'ss': pad(d.getSeconds())
  }
  let result = fmt
  for (const [key, val] of Object.entries(map)) result = result.replace(key, val)
  return result
}

function showSuccess(title) { wx.showToast({ title, icon: 'success', duration: 1500 }) }
function showError(title) { wx.showToast({ title, icon: 'none', duration: 2000 }) }

const CATEGORY_MAP = {
  'VOLUNTEER': { label: '志愿公益', color: '#10B981' },
  'INTERNSHIP': { label: '企业实习', color: '#3B82F6' },
  'RESEARCH': { label: '科研竞赛', color: '#8B5CF6' },
  'ONLINE': { label: '线上实践', color: '#06B6D4' },
  'CULTURE': { label: '文体活动', color: '#F59E0B' },
  'CAMPUS': { label: '校内活动', color: '#EF4444' },
  'SKILL': { label: '技能提升', color: '#EC4899' }
}

function getCategoryLabel(code) { return CATEGORY_MAP[code]?.label || code }
function getCategoryColor(code) { return CATEGORY_MAP[code]?.color || '#6B7280' }

module.exports = { formatDate, showSuccess, showError, CATEGORY_MAP, getCategoryLabel, getCategoryColor }
