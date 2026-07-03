# 后端适配变更说明

## 1. 新增模块：wechat

### 1.1 WechatConfig.java
- 从 `application.yml` 读取微信配置（appid、secret、subscribeTemplateId）
- 配置项前缀：`wechat`

### 1.2 WechatService.java
- `code2session(code)`: 调用微信 jscode2session 接口，换取 openid 和 session_key
- `getAccessToken()`: 获取微信 access_token（带缓存）
- `sendSubscribeMessage()`: 发送订阅消息

### 1.3 WechatAuthController.java
- `POST /api/auth/wechat-login`: 微信登录（核心接口）
- `POST /api/auth/bindphone`: 绑定手机号
- `PUT /api/auth/profile`: 更新用户信息（昵称、头像、学校、专业）

### 1.4 WechatDtos.java
- 请求/响应 DTO 定义

## 2. 数据库迁移

### V20__add_wechat_user_fields.sql
新增字段：
- `openid` VARCHAR(64) UNIQUE — 微信用户唯一标识
- `unionid` VARCHAR(64) — 跨应用标识
- `phone` VARCHAR(20) — 手机号
- `nickname` VARCHAR(60) — 昵称
- `avatar_url` VARCHAR(500) — 头像URL
- `school` VARCHAR(120) — 学校
- `major` VARCHAR(120) — 专业

种子数据更新：
- 清除日本场景数据
- 插入国内场景组织和事件

## 3. 需要修改的现有文件

### 3.1 UserRepository.java
新增方法：
```java
Optional<UserEntity> findByOpenid(String openid);
```

### 3.2 UserEntity.java
新增字段：
```java
private String openid;
private String unionid;
private String phone;
private String nickname;
private String avatarUrl;
private String school;
private String major;
```

### 3.3 EventCategory.java
枚举值调整：
```java
VOLUNTEER("志愿公益"),
INTERNSHIP("企业实习"),
RESEARCH("科研竞赛"),
ONLINE("线上实践"),
CULTURE("文体活动"),
CAMPUS("校内活动"),
SKILL("技能提升");
```

### 3.4 application.yml
新增配置：
```yaml
wechat:
  appId: ${WECHAT_APP_ID:your-app-id}
  secret: ${WECHAT_SECRET:your-secret}
  subscribeTemplateId: ${WECHAT_TEMPLATE_ID:your-template-id}
```

### 3.5 CurrentUser.java
确保支持新的 token 格式（无变化，已有 Bearer token 解析）

## 4. 简化版AI服务建议

### 当前状态
- 多Agent架构（Goal Agent, Planner Agent, Critic Agent, Evidence Collector）
- 混合检索（BM25 + 语义 + 关键词）
- 每次推荐消耗大量 token

### MVP简化方案
1. 保留 `recommendEvents` 接口
2. 简化为单次 LLM 调用（去掉多Agent和Critic）
3. 检索层保留关键词匹配 + 简单规则评分
4. 使用国内大模型（DeepSeek / 通义千问）替代 OpenAI
5. 去掉 `recommendPlans` 接口（MVP不需要）

### 成本优化
- 候选事件限制为 10 个
- 推荐结果限制为 3 个
- prompt 精简，去掉冗余上下文
- 缓存相同需求的推荐结果（短期）

## 5. 依赖变更

### pom.xml
无需新增依赖。现有依赖已覆盖：
- spring-boot-starter-web (RestTemplate)
- spring-boot-starter-data-redis (token存储)
- spring-boot-starter-data-jpa (用户管理)
- jackson-databind (JSON解析)
