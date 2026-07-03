# Get Yourself — 微信小程序 PRD v1.0

## 一、产品概述

### 1.1 产品名称
**Get Yourself** — 大学生成长记录与机会发现平台

### 1.2 一句话定位
帮助大学生记录每一次成长、发现值得参加的实践机会，把经历沉淀为可展示的能力档案。

### 1.3 目标用户
- **核心用户**：中国国内在校大学生（本科/研究生）
- **用户特征**：有成长意识、愿意尝试实践机会、但苦于信息分散、经历难以沉淀
- **第一用户**：产品创建者本人（自用验证）

### 1.4 核心价值主张
| 痛点 | 解决方案 |
|------|----------|
| 实践机会信息分散，不知道有什么可以参加 | 平台精选推荐 + AI智能匹配 |
| 参加了很多活动但没有记录，简历空洞 | 结构化成就记录 + 反思沉淀 |
| 不知道自己成长了什么，能力在哪里 | 成长统计 + 能力标签自动生成 |
| 没有外部活动时就没有成长素材 | 个人挑战模块，自定义目标 |

### 1.5 产品形态
微信小程序（原生开发），后端复用现有Spring Boot服务并做适配。

---

## 二、用户模型

### 2.1 用户生命周期
```
首次进入 → 微信登录 → 完善信息(可选) → 浏览事件/创建挑战 → 参与/完成 → 记录反思 → 查看成长 → 分享/回访
```

### 2.2 用户信息
| 字段 | 必填 | 时机 | 说明 |
|------|------|------|------|
| openid | 是 | 微信登录自动获取 | 用户唯一标识 |
| unionid | 否 | 关联公众号后获取 | 跨应用标识 |
| 昵称 | 否 | 首次登录后引导 | 微信昵称或自定义 |
| 头像 | 否 | 首次登录后引导 | 微信头像 |
| 手机号 | 否 | 需要时绑定 | 用于通知和身份确认 |
| 学校 | 否 | 用到时填写 | 用于事件筛选和推荐 |
| 专业 | 否 | 用到时填写 | 用于能力画像 |

### 2.3 用户角色（MVP简化）
- **学生**：浏览事件、创建挑战、记录成就、查看成长
- **平台运营**：通过后台/数据库发布和管理事件（暂不做独立管理端）

---

## 三、功能规格

### 3.1 MVP功能清单

#### P0 — 必须有（核心闭环）
| 编号 | 功能 | 说明 |
|------|------|------|
| F01 | 微信登录 | wx.login获取code，后端换openid，自动创建账号 |
| F02 | 浏览事件列表 | 分类筛选、关键词搜索、分页加载 |
| F03 | 事件详情 | 查看事件完整信息 |
| F04 | 预约事件 | 一键预约，状态管理 |
| F05 | 完成事件 | 标记完成 + 填写"做了什么/学到了什么" |
| F06 | 创建个人挑战 | 标题、分类、目标、描述 |
| F07 | 完成挑战 | 标记完成 + 填写反思 |
| F08 | 成就历史列表 | 按时间倒序展示所有完成记录 |
| F09 | 成就详情/编辑反思 | 查看和修改"做了什么/学到了什么" |
| F10 | 成长统计 | 按类别统计、能力维度雷达图 |
| F11 | AI事件推荐 | 输入需求，返回推荐结果（简化为单次LLM调用） |

#### P1 — 应该有（体验增强）
| 编号 | 功能 | 说明 |
|------|------|------|
| F12 | 订阅消息推送 | 活动提醒、成就达成通知 |
| F13 | 分享卡片 | 分享事件/成就到微信聊天 |
| F14 | 个人主页 | 头像、昵称、统计概览 |
| F15 | 关注组织 | 收藏感兴趣的组织 |
| F16 | 我的预约 | 查看预约状态 |

#### P2 — 可以有（后续迭代）
| 编号 | 功能 | 说明 |
|------|------|------|
| F17 | 智能简历生成 | AI基于成就生成简历要点 |
| F18 | 日程管理 | 管理活动和个人计划 |
| F19 | 扫码签到 | 线下活动扫码完成 |
| F20 | 社交动态 | 看到同学的成长动态 |

### 3.2 页面结构

```
tabBar (底部导航)
├── 首页 (pages/index/index)        — 事件浏览 + AI推荐入口
├── 挑战 (pages/challenge/list)      — 我的挑战列表
├── 成就 (pages/achievement/list)    — 成就历史 + 成长统计
└── 我的 (pages/profile/index)       — 个人信息 + 设置

二级页面
├── pages/event/detail               — 事件详情
├── pages/event/search               — 搜索事件
├── pages/challenge/create           — 创建挑战
├── pages/challenge/detail           — 挑战详情/完成
├── pages/achievement/detail         — 成就详情/编辑反思
├── pages/ai/recommend               — AI推荐
└── pages/profile/edit               — 编辑个人信息
```

### 3.3 核心流程

#### 流程1：发现并完成一个事件
```
首页浏览 → 搜索/筛选事件 → 查看详情 → 预约事件
→ (线下参与) → 标记完成 → 填写反思 → 成就入库
→ 成长统计更新 → 订阅消息通知
```

#### 流程2：创建并完成一个挑战
```
挑战tab → 创建挑战 → 填写标题/目标/分类
→ (一段时间后) → 标记完成 → 填写反思
→ 成就入库 → 成长统计更新
```

#### 流程3：AI推荐事件
```
首页AI入口 → 输入需求(自然语言)
→ AI分析 → 返回推荐事件列表
→ 查看详情 → 预约
```

---

## 四、数据模型变更

### 4.1 用户表新增字段
```sql
ALTER TABLE users ADD COLUMN openid VARCHAR(64) UNIQUE;
ALTER TABLE users ADD COLUMN unionid VARCHAR(64);
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
ALTER TABLE users ADD COLUMN nickname VARCHAR(60);
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
ALTER TABLE users ADD COLUMN school VARCHAR(120);
ALTER TABLE users ADD COLUMN major VARCHAR(120);
```

### 4.2 事件分类调整（适配国内场景）
| 原分类 | 新分类 | 说明 |
|--------|--------|------|
| PUBLIC_WELFARE | 志愿公益 | 志愿服务、公益活动 |
| COMPANY | 企业实习 | 企业实习、校招、职业体验 |
| RESEARCH | 科研竞赛 | 科研项目、学科竞赛 |
| ONLINE | 线上实践 | 线上兼职、远程项目 |
| CULTURE | 文体活动 | 文化、体育、艺术活动 |
| CAMPUS | 校内活动 | 社团、学生会、校内讲座 |
| SKILL | 技能提升 | 培训、考证、自学项目 |

---

## 五、API设计

### 5.1 微信登录
```
POST /api/auth/wechat-login
Request: { "code": "wx.login返回的code" }
Response: { "token": "...", "isNewUser": true, "user": {...} }
```

### 5.2 绑定手机号
```
POST /api/auth/bindphone
Request: { "code": "getPhoneNumber返回的code" }
Response: { "user": {...} }
```

### 5.3 更新用户信息
```
PUT /api/auth/profile
Request: { "nickname": "...", "avatarUrl": "...", "school": "...", "major": "..." }
Response: { "user": {...} }
```

### 5.4 事件相关（复用现有，微调）
```
GET  /api/events                    — 搜索事件
GET  /api/events/{id}               — 事件详情
POST /api/events/{id}/reserve       — 预约事件
POST /api/events/{id}/complete      — 完成事件
GET  /api/events/mine               — 我发布的事件
GET  /api/events/reservations       — 我的预约
```

### 5.5 挑战相关（复用现有）
```
GET  /api/challenges                — 挑战列表
POST /api/challenges                — 创建挑战
POST /api/challenges/{id}/complete  — 完成挑战
DEL  /api/challenges/{id}           — 取消挑战
```

### 5.6 成就相关（复用现有）
```
GET  /api/achievements/history      — 成就历史
GET  /api/achievements/summary      — 成长统计
PUT  /api/achievements/{id}/reflection — 更新反思
```

### 5.7 AI推荐（简化）
```
POST /api/ai/recommend-events
Request: { "need": "想找线上实习" }
Response: { "message": "...", "recommendations": [...] }
```

### 5.8 订阅消息
```
POST /api/subscribe/send
Request: { "type": "ACHIEVEMENT", "userId": "...", "data": {...} }
```

---

## 六、非功能需求

### 6.1 性能
- 页面首屏加载 < 2秒
- API响应 < 3秒（AI推荐 < 8秒）
- 列表分页加载，每页10条

### 6.2 安全
- 微信登录code一次性使用
- session_key不下发前端
- API鉴权：Bearer token
- 基础输入校验
- 敏感操作日志

### 6.3 合规
- 隐私政策弹窗（首次登录）
- 用户协议
- AI生成内容标注

---

## 七、MVP交付标准

### 7.1 可验收的用户故事
1. 作为新用户，我可以微信一键登录，无需注册
2. 作为学生，我可以浏览和搜索实践事件
3. 作为学生，我可以预约一个事件
4. 作为学生，我可以标记事件完成并填写反思
5. 作为学生，我可以创建一个个人挑战
6. 作为学生，我可以完成挑战并填写反思
7. 作为学生，我可以查看我的所有成就记录
8. 作为学生，我可以查看成长统计图表
9. 作为学生，我可以获得AI事件推荐
10. 作为学生，我可以收到成就达成的订阅消息

### 7.2 不在MVP范围内
- 组织端独立发布界面
- 扫码签到
- 智能简历生成
- 日程管理
- 社交动态
- 支付功能
- 管理后台

---

## 八、技术架构

### 8.1 整体架构
```
微信小程序 (原生WXML/WXSS/JS)
    ↓ HTTPS
Spring Boot API (现有后端 + 适配)
    ↓
MySQL (主数据存储)
Redis (session + 缓存)
国内大模型API (AI推荐)
```

### 8.2 后端变更
1. 新增 `wechat` 模块：微信登录、手机号绑定、订阅消息
2. 修改 `auth` 模块：支持微信登录方式
3. 简化 `ai` 模块：单次LLM调用替代多Agent
4. 新增 Flyway 迁移：用户表扩展字段
5. 事件分类枚举调整

### 8.3 小程序技术选型
- 框架：微信原生小程序
- 图表：wx-charts 或 echarts-for-weixin-miniprogram
- 状态管理：getApp().globalData（简单场景）
- 网络请求：wx.request 封装
