# 开发指南

## 本地开发环境

### 前端（小程序）

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 打开开发者工具，选择"导入项目"
3. 项目目录选择 `miniprogram/`
4. AppID 填入你的小程序 AppID（或使用测试号）
5. 点击"编译"即可预览

**开发阶段设置**：
- 详情 → 本地设置 → 勾选"不校验合法域名"
- 这样可以访问 localhost:8080 的后端

### 后端

1. 确保已安装 Java 21 和 Maven
2. 确保 MySQL 和 Redis 已启动
3. 创建数据库：
   ```sql
   CREATE DATABASE getyourself CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
4. 配置环境变量（或修改 application.yml）：
   ```bash
   export WECHAT_APPID=your_appid
   export WECHAT_SECRET=your_secret
   ```
5. 启动后端：
   ```bash
   cd D:\Get-Yourself\backend
   mvn spring-boot:run
   ```

## 前后端联调

### API 接口对照

| 功能 | 前端调用 | 后端接口 |
| --- | --- | --- |
| 微信登录 | `post('/api/auth/wechat-login', {code})` | WechatAuthController |
| 更新资料 | `put('/api/auth/profile', {...})` | WechatAuthController |
| 搜索事件 | `get('/api/events', {keyword, category})` | EventController |
| 预约事件 | `post('/api/events/{id}/reserve')` | ReservationController |
| 完成事件 | `post('/api/events/{id}/complete', {did, learned})` | ReservationController |
| 挑战列表 | `get('/api/challenges', {status})` | ChallengeController |
| 创建挑战 | `post('/api/challenges', {...})` | ChallengeController |
| 完成挑战 | `post('/api/challenges/{id}/complete', {did, learned})` | ChallengeController |
| 成就历史 | `get('/api/achievements/history')` | AchievementController |
| 成长统计 | `get('/api/achievements/summary')` | AchievementController |
| AI推荐 | `post('/api/ai/recommend-events', {need})` | SimpleAiController |

### 数据格式

后端返回的数据格式需要和前端期望的一致。主要注意：

1. **事件字段**：前端期望 `title`, `organizationName`, `category`, `startTime`, `location`, `benefitType`, `skill`, `moneyAmount`
2. **时间格式**：后端返回 ISO 格式（如 `2026-07-10T09:00:00`），前端用 `formatDate()` 转换
3. **分类枚举**：前端用字符串（如 `VOLUNTEER`），后端用枚举

## 测试流程

### 功能测试

1. **登录流程**：打开小程序 → 自动登录 → 进入首页
2. **事件浏览**：首页 → 查看事件列表 → 点击事件 → 查看详情
3. **预约流程**：事件详情 → 预约 → 确认预约成功
4. **完成流程**：事件详情 → 标记完成 → 填写反思 → 保存
5. **挑战流程**：挑战 tab → 创建挑战 → 完成挑战 → 查看成就
6. **AI推荐**：首页 AI 入口 → 输入需求 → 查看推荐结果

### 常见问题

| 问题 | 原因 | 解决 |
| --- | --- | --- |
| 登录失败 | 后端未启动或 AppID 未配置 | 检查后端日志和配置 |
| 事件列表为空 | 数据库无数据 | 运行 Flyway 迁移填充种子数据 |
| AI推荐报错 | AI 服务未配置 | 检查 AI_API_KEY 环境变量 |
| 网络请求失败 | 域名未配置 | 开发阶段勾选"不校验合法域名" |

## 代码规范

### 前端

- 页面文件使用嵌套目录结构
- 工具函数放在 `utils/` 目录
- 样式使用 CSS 变量
- 异步操作使用 async/await

### 后端

- Controller 薄，Service 厚
- 使用 DTO 隔离 Entity 和 API
- 异常统一处理
- 日志规范：`log.info/warn/error`
