# Yapi MCP 使用指南

## 🚀 基本使用流程

### 1. 启动服务器
```bash
# 在 Yapi-MCP 项目目录下
./start-mcp.sh start

# 检查状态
./start-mcp.sh status
```

### 2. 在 Cursor 中使用
- 确保 Cursor 配置了 MCP 服务器
- 重启 Cursor（如果需要）
- 在任何项目中通过 AI 对话使用

---

## 🎯 核心功能使用

### 📋 1. 列出项目和分类

```
请列出所有可用的YApi项目
```

```
请获取项目YOUR_PROJECT_ID的接口分类列表
```

### 🔍 2. 搜索接口

**按名称搜索：**
```
请搜索包含"用户"关键字的接口
```

**按路径搜索：**
```
请搜索路径包含"/api/login"的接口
```

**按项目搜索：**
```
请在"读书视频摘要"项目中搜索接口
```

**组合搜索：**
```
请搜索项目YOUR_PROJECT_ID中路径包含"/user"且名称包含"登录"的接口
```

### 📖 3. 获取接口详情

```
请获取接口ID为123的详细信息
```

```
请获取项目YOUR_PROJECT_ID中接口ID为456的详细信息，包含完整的请求参数和返回格式
```

---

## ✏️ 创建和更新接口

### 🆕 4. 创建新接口

**基本创建：**
```
请在YApi中创建一个新接口：
- 项目ID：YOUR_PROJECT_ID
- 分类ID：YOUR_CATEGORY_ID（登陆页）
- 接口名称：用户登录
- 请求方法：POST
- 接口路径：/api/user/login
- 接口描述：用户登录接口，支持手机号和邮箱登录
```

**完整参数创建：**
```
请在YApi中创建一个用户注册接口：
- 项目：YOUR_PROJECT_NAME（ID：YOUR_PROJECT_ID）
- 分类：登陆页（ID：YOUR_CATEGORY_ID）
- 名称：用户注册
- 方法：POST
- 路径：/api/user/register
- 描述：新用户注册接口
- 请求参数：
  - username: 字符串，用户名，必填
  - email: 字符串，邮箱地址，必填
  - password: 字符串，密码，必填
  - phone: 字符串，手机号，选填
  - code: 字符串，验证码，必填
- 返回数据：
  - code: 数字，状态码（200成功，400失败）
  - message: 字符串，返回消息
  - data: 对象，用户信息
    - userId: 数字，用户ID
    - username: 字符串，用户名
    - email: 字符串，邮箱
```

### 🔄 5. 更新现有接口

```
请更新接口ID为123的信息：
- 修改接口描述：这是一个增强版的用户登录接口，支持多种登录方式
- 添加新的请求参数：
  - loginType: 字符串，登录类型（phone/email/username），必填
  - rememberMe: 布尔值，是否记住登录状态，选填
- 修改返回数据，增加token字段：
  - token: 字符串，访问令牌
```

---

## 🛠️ 高级使用场景

### 6. 基于代码自动生成接口

**分析 Express.js 代码：**
```
分析以下 Express.js 路由代码，并帮我在YApi中创建对应的接口文档：

app.post('/api/book/favorite', async (req, res) => {
  const { bookId, userId } = req.body;
  
  try {
    const result = await addToFavorites(bookId, userId);
    res.json({
      code: 200,
      message: '收藏成功',
      data: {
        favoriteId: result.id,
        bookId: bookId,
        createdAt: new Date()
      }
    });
  } catch (error) {
    res.json({
      code: 500,
      message: '收藏失败',
      data: null
    });
  }
});

请创建到项目YOUR_PROJECT_ID的"收藏页"分类中。
```

**分析 Spring Boot 代码：**
```
分析以下 Spring Boot Controller，在YApi中创建接口：

@RestController
@RequestMapping("/api/video")
public class VideoController {
    
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse> uploadVideo(
        @RequestParam("file") MultipartFile file,
        @RequestParam("title") String title,
        @RequestParam("description") String description) {
        
        // 处理逻辑
        
        return ResponseEntity.ok(new ApiResponse(200, "上传成功", videoInfo));
    }
}

请创建到项目YOUR_PROJECT_ID的"视频播放页"分类中。
```

### 7. 批量创建接口

```
我需要为用户管理模块创建以下接口，都放在项目YOUR_PROJECT_ID的"个人中心页"分类中：

1. GET /api/user/profile - 获取用户信息
   返回：用户基本信息（姓名、邮箱、头像等）

2. PUT /api/user/profile - 更新用户信息
   参数：nickname, avatar, bio
   返回：更新后的用户信息

3. POST /api/user/avatar - 上传头像
   参数：file（文件）
   返回：头像URL

4. POST /api/user/password - 修改密码
   参数：oldPassword, newPassword
   返回：操作结果

5. DELETE /api/user/account - 删除账户
   参数：password（确认密码）
   返回：操作结果

请逐一创建这些接口。
```

### 8. 接口文档维护

**批量更新接口状态：**
```
请将项目YOUR_PROJECT_ID中所有包含"/api/user"路径的接口状态改为"已完成"
```

**接口分类整理：**
```
请获取项目YOUR_PROJECT_ID的所有接口分类，并显示每个分类下有多少个接口
```

---

## 🎨 实际项目集成示例

### 场景1：前端开发时
```
我正在开发一个React登录组件，需要调用登录接口。
请帮我：
1. 搜索现有的登录相关接口
2. 如果没有，创建一个标准的登录接口
3. 提供接口的详细参数说明

项目是"读书视频摘要"。
```

### 场景2：后端开发时
```
我刚写完一个评论模块的后端接口，包含：
- 发表评论 POST /api/comment/create
- 获取评论列表 GET /api/comment/list
- 删除评论 DELETE /api/comment/:id

请帮我在YApi中创建这些接口的文档，参数和返回值我可以详细描述。
```

### 场景3：API Review 时
```
请获取项目YOUR_PROJECT_ID中所有状态为"开发中"的接口列表，我需要检查开发进度。
```

---

## ⚠️ 重要提示和最佳实践

### ✅ 推荐做法

1. **明确指定项目和分类**
   ```
   ❌ 请创建一个登录接口
   ✅ 请在项目YOUR_PROJECT_ID的"登陆页"分类中创建一个登录接口
   ```

2. **提供完整的接口信息**
   ```
   ✅ 包含：名称、方法、路径、参数、返回值、描述
   ```

3. **使用具体的接口ID**
   ```
   ❌ 请更新那个登录接口
   ✅ 请更新接口ID为123的登录接口
   ```

### ⚠️ 注意事项

1. **项目权限**
   - 确保您有目标项目的编辑权限
   - Cookie 可能会过期，需要重新获取

2. **分类ID获取**
   ```
   # 先获取分类列表
   请获取项目YOUR_PROJECT_ID的接口分类列表
   
   # 然后使用具体的分类ID
   请在分类YOUR_CATEGORY_ID中创建接口
   ```

3. **批量操作**
   - 批量创建时建议逐个确认
   - 大量操作时注意API频率限制

---

## 🔧 故障排除

### 常见问题

1. **"请登录"错误**
   - Cookie 已过期，需要重新获取
   - 检查 .env 文件中的 YAPI_TOKEN

2. **找不到项目**
   ```
   # 先检查可用项目
   请列出所有可用的YApi项目
   ```

3. **分类不存在**
   ```
   # 检查项目的分类列表
   请获取项目YOUR_PROJECT_ID的接口分类列表
   ```

4. **MCP 连接问题**
   ```bash
   # 检查服务器状态
   ./start-mcp.sh status
   
   # 重启服务器
   ./start-mcp.sh restart
   ```

### 日志查看
```bash
# 查看实时日志
./start-mcp.sh logs

# 查看最近的日志
tail -50 yapi-mcp.log
```

---

## 🎯 快速开始模板

复制以下模板，替换具体信息即可使用：

```
请在YApi中创建接口：
- 项目：[项目名称或ID]
- 分类：[分类名称或ID]  
- 名称：[接口名称]
- 方法：[GET/POST/PUT/DELETE]
- 路径：[接口路径]
- 描述：[接口描述]
- 请求参数：
  - [参数名]: [类型]，[描述]，[必填/选填]
- 返回数据：
  - [字段名]: [类型]，[描述]
```

---

🎉 **现在您可以在任何 Cursor 项目中使用这些命令来管理 YApi 接口了！** 