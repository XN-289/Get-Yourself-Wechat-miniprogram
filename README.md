# Get Yourself 微信小程序 MVP

## 项目概述

**Get Yourself** — 帮助大学生记录成长、发现实践机会的微信小程序。

核心闭环：微信登录 → 浏览事件 → 预约/完成 → 记录反思 → 成长统计

## 最终文件结构

```
miniprogram/                           # 小程序前端（可直接导入微信开发者工具）
├── app.js / app.json / app.wxss       # 全局配置
├── project.config.json                # 项目配置（填入AppID）
├── sitemap.json
├── utils/
│   ├── request.js                     # 网络请求封装（带token、错误处理）
│   ├── auth.js                        # 微信登录（wx.login + code2session）
│   └── util.js                        # 工具函数（日期、分类映射）
├── images/                            # tab图标（需放入8个png文件）
└── pages/                             # 11个页面，嵌套结构
    ├── index/index/                   # 首页：事件浏览 + AI入口
    ├── event/detail/                  # 事件详情：预约 + 完成 + 反思
    ├── event/search/                  # 搜索事件
    ├── challenge/list/                # 挑战列表（进行中/已完成/全部）
    ├── challenge/create/              # 创建挑战
    ├── challenge/detail/              # 挑战详情：完成 + 反思
    ├── achievement/list/              # 成就列表 + 能力统计
    ├── achievement/detail/            # 成就详情：编辑反思
    ├── profile/index/                 # 个人主页
    ├── profile/edit/                  # 编辑资料
    └── ai/recommend/                  # AI智能推荐事件

docs/                                  # 文档
├── PRD.md                             # 产品需求文档
├── ai-simplification.md              # AI精简决策（砍掉多Agent，保留单次LLM+规则降级）
├── backend-changes.md                # 后端变更说明
├── test-plan.md                      # 测试计划（23个用例）
├── wechat-miniprogram-reference.md   # 微信小程序开发参考
└── miniprogram-scaffold/             # 参考脚手架（窗口1产出，可对照）

backend/                               # 后端适配代码
├── src/main/java/.../wechat/
│   ├── WechatService.java            # code2session + access_token
│   ├── WechatAuthController.java     # 微信登录 + 更新资料接口
│   └── WechatConfig.java             # 配置读取
├── src/main/java/.../entity/         # 实体类（窗口2产出，Lombok风格）
└── src/main/resources/
    ├── application.yml                # 完整配置
    └── db/migration/V20__add_wechat_user_fields.sql  # 数据库迁移
```

## 你的行动步骤

### 第一步：注册小程序（必须最先做）

1. 去 [mp.weixin.qq.com](https://mp.weixin.qq.com) 注册小程序账号
2. 获取 **AppID** 和 **AppSecret**
3. 填入 `miniprogram/project.config.json` 的 `appid` 字段

### 第二步：配置 tab 图标

在 `miniprogram/images/` 目录下放入 8 个 png 图标文件（81x81px）：

| 文件名 | 用途 |
| --- | --- |
| tab-discover.png | 发现 tab（未选中） |
| tab-discover-active.png | 发现 tab（选中） |
| tab-challenge.png | 挑战 tab（未选中） |
| tab-challenge-active.png | 挑战 tab（选中） |
| tab-achievement.png | 成就 tab（未选中） |
| tab-achievement-active.png | 成就 tab（选中） |
| tab-profile.png | 我的 tab（未选中） |
| tab-profile-active.png | 我的 tab（选中） |

> 临时方案：可以用 emoji 图片或者纯色方块替代，先跑起来再美化。

### 第三步：导入小程序

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram/` 目录
3. 填入你的 AppID
4. 在 `app.js` 中修改 `baseUrl` 为你的后端地址
5. 勾选"不校验合法域名"（开发阶段）

### 第四步：后端适配

将以下文件合并到你现有的 `D:\Get-Yourself\backend` 项目中：

1. `V20__add_wechat_user_fields.sql` → 复制到现有项目的 `src/main/resources/db/migration/`
2. `wechat/` 目录 → 复制到现有项目的 `src/main/java/com/getyourself/backend/`
3. `application.yml` 中的 `wechat:` 配置段 → 合并到现有配置
4. `UserEntity.java` → 添加 `openid`, `unionid`, `phone`, `nickname`, `avatarUrl`, `school`, `major` 字段
5. `UserRepository.java` → 添加 `findByOpenid(String openid)` 方法

### 第五步：AI精简（后续）

详见 [ai-simplification.md](docs/ai-simplification.md)：

- 砍掉多Agent、计划生成、向量检索
- 保留事件推荐 + 规则降级
- 接入 DeepSeek-V3（¥0.001/千token）

### 第六步：上线准备

- 服务器 + 已备案域名 + HTTPS
- 微信后台配置服务器域名
- 配置订阅消息模板
- ICP 备案

## 技术栈

| 层 | 技术 |
| --- | --- |
| 前端 | 微信原生小程序（WXML + WXSS + JS） |
| 后端 | Spring Boot 3.3 + Java 21 + MySQL + Redis |
| AI | DeepSeek-V3（待接入） |
| 登录 | 微信 wx.login + code2session |
