# 原生微信小程序开发参考

> 面向 Get-Yourself 项目的微信小程序开发速查手册。

---

## 1. 标准项目结构

```
miniprogram/
├── app.js                  # 小程序逻辑（全局 App）
├── app.json                # 小程序公共配置（页面路由、窗口、tabBar）
├── app.wxss                # 小程序公共样式
├── project.config.json     # 项目配置（appid 等）
├── sitemap.json            # 小程序搜索配置
├── utils/
│   ├── request.js          # 网络请求封装
│   ├── auth.js             # 登录 & token 管理
│   └── util.js             # 工具函数
├── components/             # 自定义组件
│   └── my-comp/
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
└── pages/
    ├── index/
    │   ├── index.js
    │   ├── index.json
    │   ├── index.wxml
    │   └── index.wxss
    └── ...
```

---

## 2. 页面生命周期

```js
Page({
  // ============ 生命周期 ============
  onLoad(options) {
    // 页面创建时触发，options 为路由参数
  },
  onShow() {
    // 页面显示/切入前台时触发
  },
  onReady() {
    // 页面初次渲染完成（只触发一次）
  },
  onHide() {
    // 页面隐藏/切入后台时触发
  },
  onUnload() {
    // 页面销毁时触发（redirectTo / navigateBack）
  },

  // ============ 页面事件 ============
  onPullDownRefresh() {
    // 下拉刷新（需在 json 中开启 enablePullDownRefresh）
  },
  onReachBottom() {
    // 上拉触底
  },
  onShareAppMessage() {
    // 用户点击右上角分享
    return {
      title: '分享标题',
      path: '/pages/index/index?id=123',
      imageUrl: '/images/share.png'
    }
  },
  onShareTimeline() {
    // 分享到朋友圈
    return { title: '标题', imageUrl: '/images/share.png' }
  },

  // ============ 页面数据 ============
  data: {}
})
```

### 组件生命周期

```js
Component({
  lifetimes: {
    created()      { /* 组件实例创建，还不能 setData */ },
    attached()     { /* 进入页面节点树，常用于初始化 */ },
    ready()        { /* 组件渲染完成 */ },
    detached()     { /* 从页面节点树移除 */ },
  },
  pageLifetimes: {
    show()    { /* 所在页面 show */ },
    hide()    { /* 所在页面 hide */ },
  },
  methods: {}
})
```

---

## 3. wx.request 网络请求封装

### 基础封装模式

```js
// utils/request.js
const BASE_URL = 'http://localhost:8080'

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${BASE_URL}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header
      },
      success(res) {
        if (res.statusCode === 200) {
          if (res.data.code === 0 || res.data.code === 200) {
            resolve(res.data)
          } else if (res.data.code === 401) {
            // token 过期 → 重新登录
            wx.removeStorageSync('token')
            wx.navigateTo({ url: '/pages/index/index' })
            reject(new Error('登录已过期'))
          } else {
            wx.showToast({ title: res.data.message || '请求失败', icon: 'none' })
            reject(res.data)
          }
        } else {
          wx.showToast({ title: `服务器错误 ${res.statusCode}`, icon: 'none' })
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail(err) {
        wx.showToast({ title: '网络异常', icon: 'none' })
        reject(err)
      }
    })
  })
}

const get = (url, data) => request({ url, method: 'GET', data })
const post = (url, data) => request({ url, method: 'POST', data })
const put = (url, data) => request({ url, method: 'PUT', data })
const del = (url, data) => request({ url, method: 'DELETE', data })

module.exports = { request, get, post, put, del }
```

### 使用示例

```js
const { get, post } = require('../../utils/request')

// GET
const res = await get('/api/events', { page: 1, size: 10 })

// POST
const res2 = await post('/api/events', { title: '新活动', date: '2026-07-01' })
```

---

## 4. wx.login + code2session 完整流程

```
┌──────────┐       ┌──────────┐       ┌──────────────┐
│  小程序   │       │  微信服务器 │       │   业务后端    │
└────┬─────┘       └────┬─────┘       └──────┬───────┘
     │  wx.login()      │                    │
     │─────────────────>│                    │
     │  返回 code        │                    │
     │<─────────────────│                    │
     │                   │                    │
     │  发送 code 到后端  │                    │
     │──────────────────────────────────────>│
     │                   │   code2session     │
     │                   │<──────────────────│
     │                   │  openid/session_key│
     │                   │──────────────────>│
     │                   │                    │  生成自定义 token
     │  返回 token        │                    │
     │<──────────────────────────────────────│
     │  存储 token         │                    │
```

### 前端代码

```js
// utils/auth.js
const { post } = require('./request')

const login = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: async (loginRes) => {
        if (!loginRes.code) {
          reject(new Error('wx.login 失败'))
          return
        }
        try {
          // 将 code 发送到后端
          const res = await post('/api/auth/wx-login', { code: loginRes.code })
          const { token, userInfo } = res.data
          wx.setStorageSync('token', token)
          wx.setStorageSync('userInfo', userInfo)
          resolve({ token, userInfo })
        } catch (err) {
          reject(err)
        }
      },
      fail: reject
    })
  })
}

const checkLogin = () => {
  const token = wx.getStorageSync('token')
  if (!token) return login()
  return Promise.resolve({ token })
}

module.exports = { login, checkLogin }
```

### app.js 中调用

```js
App({
  onLaunch() {
    this.autoLogin()
  },
  async autoLogin() {
    try {
      const { login } = require('./utils/auth')
      const { token, userInfo } = await login()
      this.globalData.token = token
      this.globalData.userInfo = userInfo
    } catch (err) {
      console.error('自动登录失败', err)
    }
  },
  globalData: {
    token: null,
    userInfo: null,
    baseUrl: 'http://localhost:8080'
  }
})
```

---

## 5. getPhoneNumber 获取手机号

### 前端

```html
<!-- 必须是 button 组件，open-type="getPhoneNumber" -->
<button
  open-type="getPhoneNumber"
  bindgetphonenumber="onGetPhoneNumber"
>
  获取手机号
</button>
```

```js
onGetPhoneNumber(e) {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    wx.showToast({ title: '获取手机号失败', icon: 'none' })
    return
  }
  // 将加密数据发送到后端解密
  const { code } = e.detail  // 2023年后新接口用 code
  wx.request({
    url: 'http://localhost:8080/api/auth/phone-number',
    method: 'POST',
    data: { code },
    header: {
      'Authorization': `Bearer ${wx.getStorageSync('token')}`
    },
    success(res) {
      console.log('手机号', res.data.phoneNumber)
    }
  })
}
```

### 后端（伪代码）

```python
# 后端使用 code 换取手机号（需微信云调用或商户证书）
POST https://api.weixin.qq.com/wxa/business/getuserphonenumber
Body: { "code": "<前端传来的code>" }
Header: { "Authorization": "ACCESS_TOKEN" }
# 返回 { phone_info: { phoneNumber, purePhoneNumber, countryCode } }
```

---

## 6. 订阅消息 wx.requestSubscribeMessage

```js
// 一次性订阅消息 —— 每次都需要用户授权
wx.requestSubscribeMessage({
  tmplIds: ['template_id_1', 'template_id_2'],  // 订阅消息模板ID（最多3个）
  success(res) {
    // res 是对象，key 为模板ID，value 为 'accept' | 'reject' | 'ban'
    console.log(res)
    if (res['template_id_1'] === 'accept') {
      // 用户同意订阅，可发送一次消息
    }
  },
  fail(err) {
    console.error('订阅失败', err)
  }
})

// 典型调用时机：用户点击"提醒我"按钮
```

### 后端发送订阅消息

```python
POST https://api.weixin.qq.com/cgi-bin/message/subscribe/send
Body: {
  "touser": "<用户openid>",
  "template_id": "xxx",
  "page": "pages/event/detail?id=123",
  "data": {
    "thing1": { "value": "活动名称" },
    "date2": { "value": "2026-07-15" },
    "thing3": { "value": "记得准时参加" }
  }
}
```

---

## 7. 分享 onShareAppMessage

```js
Page({
  // 用户点击右上角「转发」或自定义按钮
  onShareAppMessage() {
    return {
      title: '快来参加这个挑战！',
      path: '/pages/challenge/detail/detail?id=' + this.data.id,
      imageUrl: this.data.coverImage || '/images/default-share.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '快来参加这个挑战！',
      query: 'id=' + this.data.id,
      imageUrl: this.data.coverImage
    }
  },

  // 自定义分享按钮
  onShareBtnTap() {
    // 不需要手动调用，只需在 button 上设置 open-type="share"
    // <button open-type="share">分享给好友</button>
  }
})
```

---

## 8. tabBar 配置模板

```json
{
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#FF6B35",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "images/tab/home.png",
        "selectedIconPath": "images/tab/home-active.png"
      },
      {
        "pagePath": "pages/challenge/list/list",
        "text": "挑战",
        "iconPath": "images/tab/challenge.png",
        "selectedIconPath": "images/tab/challenge-active.png"
      },
      {
        "pagePath": "pages/achievement/list/list",
        "text": "成就",
        "iconPath": "images/tab/achievement.png",
        "selectedIconPath": "images/tab/achievement-active.png"
      },
      {
        "pagePath": "pages/profile/index/index",
        "text": "我的",
        "iconPath": "images/tab/profile.png",
        "selectedIconPath": "images/tab/profile-active.png"
      }
    ]
  }
}
```

---

## 9. 常用组件速查

### scroll-view

```html
<!-- 纵向滚动 -->
<scroll-view
  scroll-y
  style="height: 600rpx;"
  bindscrolltolower="onLoadMore"
  refresher-enabled
  bindrefresherrefresh="onRefresh"
  :refresher-triggered="{{isRefreshing}}"
>
  <view wx:for="{{list}}" wx:key="id">{{item.title}}</view>
  <view wx:if="{{noMore}}" class="no-more">没有更多了</view>
</scroll-view>
```

### swiper

```html
<swiper
  class="banner-swiper"
  autoplay
  interval="{{3000}}"
  circular
  indicator-dots
  indicator-color="rgba(255,255,255,0.4)"
  indicator-active-color="#ffffff"
  bindchange="onSwiperChange"
>
  <swiper-item wx:for="{{banners}}" wx:key="id">
    <image src="{{item.imageUrl}}" mode="aspectFill" class="banner-img" />
  </swiper-item>
</swiper>
```

### picker

```html
<!-- 普通选择器 -->
<picker
  mode="selector"
  range="{{categories}}"
  range-key="name"
  bindchange="onCategoryChange"
>
  <view class="picker-value">
    {{categories[categoryIndex].name || '请选择分类'}}
  </view>
</picker>

<!-- 日期选择器 -->
<picker mode="date" value="{{date}}" bindchange="onDateChange">
  <view>{{date || '选择日期'}}</view>
</picker>

<!-- 多列选择器 -->
<picker
  mode="multiSelector"
  range="{{multiRange}}"
  bindchange="onMultiChange"
  bindcolumnchange="onColumnChange"
>
  <view>{{selectedText}}</view>
</picker>
```

---

## 10. rpx 适配要点

### 基本原理

- 设计稿宽度以 **750px** 为基准
- `1rpx` = 屏幕宽度 / 750
- iPhone 6 (375px 物理宽): `1rpx = 0.5px`
- 换算公式: `设计稿元素宽度(px) / 设计稿宽度(750) * 750rpx`

### 实际用法

```css
/* 设计稿上元素宽 345px → 345rpx */
.container {
  width: 345rpx;       /* 用 rpx 自动适配 */
  padding: 30rpx;
  font-size: 28rpx;    /* 字体也用 rpx */
}

/* 特殊情况：1px 边框用 px 不用 rpx */
.border {
  border: 1px solid #eee;  /* rpx 在高清屏会模糊，边框用 px */
}

/* 常见断点参考（750设计稿）:
 * 小标题: 32rpx
 * 正文:   28rpx
 * 辅助:   24rpx
 * 间距:   20rpx ~ 40rpx
 * 圆角:   16rpx ~ 24rpx
 */
```

### 注意事项

1. **不要在 `<canvas>` 中使用 rpx** — canvas 用 px
2. **`scroll-view` 必须指定高度** — rpx 或固定值都行
3. **图片建议用 `mode` 属性** — `aspectFill` 裁剪、`widthFix` 宽度自适应
4. **字体渲染** — iOS 和 Android 对小字号渲染不同，最小不要低于 20rpx
5. **iPhone X 适配** — 底部安全区用 `env(safe-area-inset-bottom)` 或 `padding-bottom: constant(safe-area-inset-bottom)`

---

## 附录：常用 wx API 速查

| API | 用途 | 示例 |
|-----|------|------|
| `wx.showToast` | 轻提示 | `wx.showToast({ title: '成功', icon: 'success' })` |
| `wx.showLoading` / `hideLoading` | 加载提示 | `wx.showLoading({ title: '加载中' })` |
| `wx.showModal` | 确认弹窗 | `wx.showModal({ title: '提示', content: '确定？' })` |
| `wx.navigateTo` | 跳转（保留当前页） | `wx.navigateTo({ url: '/pages/a/a?id=1' })` |
| `wx.redirectTo` | 跳转（关闭当前页） | `wx.redirectTo({ url: '/pages/b/b' })` |
| `wx.switchTab` | 切换 tabBar 页 | `wx.switchTab({ url: '/pages/index/index' })` |
| `wx.navigateBack` | 返回 | `wx.navigateBack({ delta: 1 })` |
| `wx.setStorageSync` | 本地存储（同步） | `wx.setStorageSync('key', value)` |
| `wx.getStorageSync` | 读取存储（同步） | `const v = wx.getStorageSync('key')` |
| `wx.getUserProfile` | 获取用户信息（需按钮触发） | 已废弃，用头像昵称组件替代 |
| `wx.chooseImage` | 选择图片 | `wx.chooseImage({ count: 3 })` |
| `wx.previewImage` | 预览图片 | `wx.previewImage({ urls: [...] })` |
| `wx.getLocation` | 获取位置 | `wx.getLocation({ type: 'gcj02' })` |
| `wx.scanCode` | 扫码 | `wx.scanCode({})` |
| `wx.setClipboardData` | 复制到剪贴板 | `wx.setClipboardData({ data: 'text' })` |
