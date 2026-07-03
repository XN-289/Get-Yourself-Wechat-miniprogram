# Get Yourself 后端变更说明文档

## 1. 概述

本文档说明后端为适配微信小程序所做的主要变更，包括新增模块、配置项、数据库变更等。

---

## 2. 新增模块：wechat

### 2.1 模块结构

```
com.getyourself.backend.wechat/
├── WechatConfig.java          # 微信配置类
├── WechatService.java         # 微信服务（登录、token、消息）
├── WechatAuthController.java  # 认证控制器（登录、绑定、更新）
└── WechatDtos.java            # 请求/响应DTO
```

### 2.2 WechatConfig.java

从 `application.yml` 读取微信配置：

```yaml
wechat:
  appid: wx1234567890abcdef
  secret: your-app-secret-here
  template-id: your-template-id
```

### 2.3 WechatService.java

核心功能：
- **code2Session**: 调用微信 `jscode2session` 接口，获取 openid 和 session_key
- **getAccessToken**: 获取并缓存 access_token（Redis 缓存，提前 5 分钟刷新）
- **sendSubscribeMessage**: 发送订阅消息（成就通知、活动提醒）
- **getPhoneNumber**: 通过 code 获取用户手机号

### 2.4 WechatAuthController.java

API 端点：

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/wechat-login` | 微信登录，自动创建账号 |
| POST | `/api/auth/bindphone` | 绑定手机号 |
| PUT | `/api/auth/profile` | 更新用户信息 |
| GET | `/api/auth/me` | 获取当前用户信息 |

---

## 3. AuthService 修改建议

### 3.1 支持微信登录方式

现有 AuthService 需要扩展以支持微信登录：

```java
// AuthService.java 新增方法
public LoginResult wechatLogin(String code) {
    // 1. 调用 wechatService.code2Session(code)
    // 2. 查找或创建用户（findByOpenid / createNewUser）
    // 3. 生成 JWT token
    // 4. 返回 LoginResult
}
```

### 3.2 认证流程变更

```
原流程：用户名密码 → 验证 → 生成token
新流程：wx.login获取code → 后端code2Session → 查找/创建用户 → 生成token
```

### 3.3 Token 验证不变

JWT token 生成和验证逻辑无需修改，只需在登录时支持 openid 方式。

---

## 4. EventCategory 枚举调整

### 4.1 新分类定义

| 枚举值 | 显示名称 | 说明 |
|--------|----------|------|
| PUBLIC_WELFARE | 志愿公益 | 志愿服务、公益活动 |
| COMPANY | 企业实习 | 企业实习、校招、职业体验 |
| RESEARCH | 科研竞赛 | 科研项目、学科竞赛 |
| ONLINE | 线上实践 | 线上兼职、远程项目 |
| CULTURE | 文体活动 | 文化、体育、艺术活动 |
| CAMPUS | 校内活动 | 社团、学生会、校内讲座 |
| SKILL | 技能提升 | 培训、考证、自学项目 |

### 4.2 枚举新增方法

```java
// 根据中文名查找
public static EventCategory fromDisplayName(String displayName);

// 根据code查找
public static EventCategory fromCode(String code);
```

---

## 5. application.yml 配置项

### 5.1 微信配置（必须）

```yaml
wechat:
  appid: ${WECHAT_APPID:wx1234567890abcdef}      # 小程序appid
  secret: ${WECHAT_SECRET:your-secret-here}       # 小程序secret
  template-id: ${WECHAT_TEMPLATE_ID:}             # 订阅消息模板ID
```

### 5.2 JWT 配置

```yaml
app:
  jwt:
    secret: ${JWT_SECRET:your-jwt-secret-key-at-least-32-chars-long!!}
    expiration: 604800  # 7天，单位秒
```

### 5.3 Redis 配置（用于缓存 access_token）

```yaml
spring:
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}
```

### 5.4 数据库配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:getyourself}?useSSL=false&serverTimezone=Asia/Shanghai
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:}

  jpa:
    hibernate:
      ddl-auto: validate  # 生产环境建议validate，开发可用update
    show-sql: false
```

---

## 6. pom.xml 依赖

### 6.1 必须新增的依赖

```xml
<!-- Redis（用于缓存access_token） -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

### 6.2 已有依赖（确认包含）

```xml
<!-- Spring Boot Starter Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Spring Boot Starter Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- MySQL Driver -->
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>

<!-- Flyway -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-mysql</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

---

## 7. 简化版 AI 服务设计建议

### 7.1 设计目标

用单次 LLM 调用替代多 Agent 架构，降低复杂度和成本。

### 7.2 推荐实现方案

```java
@Service
public class AiRecommendService {

    private final RestTemplate restTemplate;

    @Value("${ai.api.url}")
    private String aiApiUrl;

    @Value("${ai.api.key}")
    private String aiApiKey;

    public AiRecommendResponse recommendEvents(String userNeed, List<Event> allEvents) {
        // 1. 构建 prompt
        String prompt = buildPrompt(userNeed, allEvents);

        // 2. 单次 LLM 调用
        String aiResponse = callLlm(prompt);

        // 3. 解析返回结果
        return parseResponse(aiResponse);
    }

    private String buildPrompt(String userNeed, List<Event> events) {
        return """
            你是一个大学生实践机会推荐助手。
            根据用户的需求，从以下事件中推荐最匹配的几个。

            用户需求：%s

            可选事件列表：
            %s

            请返回JSON格式：
            {
              "message": "推荐理由说明",
              "recommendations": [
                {
                  "eventId": 1,
                  "title": "事件标题",
                  "reason": "推荐理由"
                }
              ]
            }
            """.formatted(userNeed, formatEvents(events));
    }
}
```

### 7.3 国内大模型 API 选择

| 服务商 | 模型 | API 特点 |
|--------|------|----------|
| 阿里云 | 通义千问 | 兼容 OpenAI 格式，价格便宜 |
| 百度 | 文心一言 | 中文理解好 |
| 讯飞 | 星火 | 教育场景优化 |
| 智谱 | GLM-4 | 开源可选 |

### 7.4 Prompt 设计要点

1. **明确角色**：指定为"大学生实践机会推荐助手"
2. **结构化输入**：将事件列表格式化为易读的文本
3. **约束输出**：要求返回 JSON 格式，便于解析
4. **上下文注入**：可加入用户学校、专业等信息提升推荐质量

### 7.5 成本控制

- 使用较便宜的模型（如 qwen-turbo）
- 限制事件列表长度（只传相关分类）
- 缓存相似请求的结果
- 设置 token 上限

---

## 8. 数据库变更

### 8.1 Flyway 迁移文件

`V20__add_wechat_user_fields.sql` 包含：

1. **users 表新增字段**
   - openid (VARCHAR 64, UNIQUE)
   - unionid (VARCHAR 64)
   - phone (VARCHAR 20)
   - nickname (VARCHAR 60)
   - avatar_url (VARCHAR 500)
   - school (VARCHAR 120)
   - major (VARCHAR 120)

2. **事件分类种子数据更新**
   - 7 个国内场景分类

3. **种子事件数据**
   - 14 条国内场景事件（每个分类 2 条）

### 8.2 执行顺序

```bash
# Flyway 会自动执行迁移，也可以手动触发
mvn flyway:migrate
```

---

## 9. 部署注意事项

### 9.1 环境变量

```bash
# 必须设置
WECHAT_APPID=wx1234567890abcdef
WECHAT_SECRET=your-wechat-secret
JWT_SECRET=your-jwt-secret-at-least-32-chars

# 可选
WECHAT_TEMPLATE_ID=your-template-id
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
DB_NAME=getyourself
DB_USERNAME=root
DB_PASSWORD=
```

### 9.2 微信小程序后台配置

1. 在微信公众平台配置服务器域名
2. 下载 HTTPS 证书
3. 配置订阅消息模板

---

## 10. 测试建议

### 10.1 单元测试

- WechatService 的 code2Session、getAccessToken 方法
- WechatAuthController 的登录、绑定、更新接口

### 10.2 集成测试

- 使用微信开发者工具的测试号进行端到端测试
- 验证 JWT token 生成和验证流程

### 10.3 Mock 测试

```java
@MockBean
private WechatService wechatService;

@Test
void testWechatLogin() {
    when(wechatService.code2Session(anyString()))
        .thenReturn(new Code2SessionResult("openid123", "sessionkey", null));
    // ...
}
```

---

## 11. 后续优化方向

1. **access_token 多实例同步**：使用 Redis 分布式锁避免并发刷新
2. **日志增强**：添加微信接口调用的监控和告警
3. **错误重试**：对微信接口调用添加重试机制
4. **限流**：对登录接口添加限流保护
