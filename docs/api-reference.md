# API 接口文档

## 基础信息

- Base URL: `http://localhost:8080`
- 认证方式: Bearer Token（微信登录后获取）
- 数据格式: JSON

## 认证接口

### 微信登录

```
POST /api/auth/wechat-login
```

**请求:**
```json
{
  "code": "wx.login()返回的code"
}
```

**响应:**
```json
{
  "token": "xxx",
  "expiresAt": "2026-07-10T00:00:00Z",
  "isNewUser": true,
  "user": {
    "publicUserId": "wx-xxx",
    "nickname": "用户昵称",
    "avatarUrl": "头像URL",
    "phone": null,
    "school": null,
    "major": null,
    "role": "STUDENT"
  }
}
```

### 更新用户资料

```
PUT /api/auth/profile
Authorization: Bearer <token>
```

**请求:**
```json
{
  "nickname": "新昵称",
  "avatarUrl": "头像URL",
  "school": "北京大学",
  "major": "计算机科学"
}
```

**响应:** 同用户信息结构

---

## 事件接口

### 搜索事件

```
GET /api/events?keyword=实习&category=INTERNSHIP&location=北京
```

**参数:**
- `keyword` (可选) - 搜索关键词
- `category` (可选) - 分类：VOLUNTEER, INTERNSHIP, RESEARCH, ONLINE, CULTURE, CAMPUS, SKILL
- `location` (可选) - 地点

**响应:** 事件数组

### 事件详情

```
GET /api/events/{id}
```

### 预约事件

```
POST /api/events/{id}/reserve
Authorization: Bearer <token>
```

### 完成事件

```
POST /api/events/{id}/complete
Authorization: Bearer <token>
```

**请求:**
```json
{
  "did": "我做了什么",
  "learned": "我学到了什么"
}
```

### 我的预约

```
GET /api/events/reservations
Authorization: Bearer <token>
```

---

## 挑战接口

### 挑战列表

```
GET /api/challenges?status=ACTIVE
Authorization: Bearer <token>
```

**参数:**
- `status` (可选) - ACTIVE, COMPLETED, CANCELLED

### 创建挑战

```
POST /api/challenges
Authorization: Bearer <token>
```

**请求:**
```json
{
  "title": "30天学会Python",
  "category": "技能提升",
  "goal": "能独立完成数据分析项目",
  "description": "每天学习1小时..."
}
```

### 完成挑战

```
POST /api/challenges/{id}/complete
Authorization: Bearer <token>
```

**请求:**
```json
{
  "did": "完成了Python基础和pandas学习",
  "learned": "掌握了数据处理的基本方法"
}
```

### 取消挑战

```
DELETE /api/challenges/{id}
Authorization: Bearer <token>
```

---

## 成就接口

### 成就历史

```
GET /api/achievements/history
Authorization: Bearer <token>
```

### 成长统计

```
GET /api/achievements/summary
Authorization: Bearer <token>
```

**响应:**
```json
{
  "completedCount": 5,
  "categoryCount": 3,
  "categoryCounts": [
    {"category": "志愿公益", "count": 2},
    {"category": "企业实习", "count": 2},
    {"category": "技能提升", "count": 1}
  ],
  "growthCurve": [...]
}
```

### 更新反思

```
PUT /api/achievements/{id}/reflection
Authorization: Bearer <token>
```

**请求:**
```json
{
  "did": "更新后的做了什么",
  "learned": "更新后的学到了什么"
}
```

---

## AI 接口

### 事件推荐

```
POST /api/ai/recommend-events
Authorization: Bearer <token>
```

**请求:**
```json
{
  "need": "想找线上实习机会",
  "category": "",
  "location": ""
}
```

**响应:**
```json
{
  "mode": "deepseek",
  "message": "已为你找到匹配的活动",
  "recommendations": [
    {
      "event": { ... },
      "score": 85,
      "reason": "该活动与你的需求...",
      "evidence": ["关键词匹配：实习", "求职相关"]
    }
  ]
}
```

---

## 错误响应格式

```json
{
  "timestamp": "2026-07-03T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "具体错误信息",
  "path": "/api/events"
}
```

## 常见状态码

| 状态码 | 含义 |
| --- | --- |
| 200 | 成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或token过期 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
