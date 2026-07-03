/**
 * 工具函数库
 */

/**
 * 格式化日期
 * @param {string|Date} date - 日期字符串或Date对象
 * @param {string} fmt - 格式字符串，如 'YYYY-MM-DD HH:mm'
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, fmt = 'YYYY-MM-DD') {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const pad = n => String(n).padStart(2, '0')
  const map = {
    'YYYY': d.getFullYear(),
    'MM': pad(d.getMonth() + 1),
    'DD': pad(d.getDate()),
    'HH': pad(d.getHours()),
    'mm': pad(d.getMinutes()),
    'ss': pad(d.getSeconds())
  }

  let result = fmt
  for (const [key, val] of Object.entries(map)) {
    result = result.replace(key, val)
  }
  return result
}

/**
 * 格式化相对时间
 * @param {string} dateStr - 日期字符串
 * @returns {string} 相对时间描述
 */
function formatRelative(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 30) return `${days}天前`
  return formatDate(date, 'MM-DD')
}

/**
 * 节流函数
 * @param {Function} fn - 要节流的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(fn, delay = 500) {
  let timer = null
  return function (...args) {
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

/**
 * 显示成功提示
 * @param {string} title - 提示文字
 */
function showSuccess(title) {
  wx.showToast({ title, icon: 'success', duration: 1500 })
}

/**
 * 显示错误提示
 * @param {string} title - 提示文字
 */
function showError(title) {
  wx.showToast({ title, icon: 'none', duration: 2000 })
}

/**
 * 显示确认对话框
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @returns {Promise<boolean>} 用户是否确认
 */
function showConfirm(title, content) {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm),
      fail: () => resolve(false)
    })
  })
}

/**
 * 事件分类映射
 */
const CATEGORY_MAP = {
  'VOLUNTEER': { label: '志愿公益', color: '#10B981', icon: '🤝' },
  'INTERNSHIP': { label: '企业实习', color: '#3B82F6', icon: '💼' },
  'RESEARCH': { label: '科研竞赛', color: '#8B5CF6', icon: '🔬' },
  'ONLINE': { label: '线上实践', color: '#06B6D4', icon: '💻' },
  'CULTURE': { label: '文体活动', color: '#F59E0B', icon: '🎭' },
  'CAMPUS': { label: '校内活动', color: '#EF4444', icon: '🏫' },
  'SKILL': { label: '技能提升', color: '#EC4899', icon: '📚' }
}

/**
 * 获取分类标签
 * @param {string} code - 分类代码
 * @returns {string} 分类中文名
 */
function getCategoryLabel(code) {
  return CATEGORY_MAP[code]?.label || code
}

/**
 * 获取分类颜色
 * @param {string} code - 分类代码
 * @returns {string} 颜色值
 */
function getCategoryColor(code) {
  return CATEGORY_MAP[code]?.color || '#6B7280'
}

/**
 * 获取分类图标
 * @param {string} code - 分类代码
 * @returns {string} emoji图标
 */
function getCategoryIcon(code) {
  return CATEGORY_MAP[code]?.icon || '📌'
}

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @returns {string} 格式化后的金额
 */
function formatMoney(amount) {
  if (!amount) return ''
  return `¥${Number(amount).toFixed(0)}`
}

/**
 * 截断文本
 * @param {string} text - 原始文本
 * @param {number} maxLen - 最大长度
 * @returns {string} 截断后的文本
 */
function truncate(text, maxLen = 50) {
  if (!text) return ''
  return text.length > maxLen ? text.substring(0, maxLen) + '...' : text
}

module.exports = {
  formatDate,
  formatRelative,
  throttle,
  debounce,
  showSuccess,
  showError,
  showConfirm,
  CATEGORY_MAP,
  getCategoryLabel,
  getCategoryColor,
  getCategoryIcon,
  formatMoney,
  truncate
}
