# Yapi MCP Server

一个用于集成 YApi 接口管理平台的 Model Context Protocol (MCP) 服务器，支持在 Cursor、Claude Desktop 等 AI 编辑器中直接操作 YApi 接口。

## ✨ 功能特性

- 🔍 **搜索接口**: 支持按项目、接口名称、路径等多种方式搜索
- 📖 **获取接口详情**: 获取完整的接口定义、参数、返回值等信息  
- ✏️ **新增/更新接口**: 直接在 AI 编辑器中创建或修改接口
- 📋 **项目管理**: 获取项目列表、分类列表等信息
- 🔐 **双重认证**: 支持 Cookie 和 Token 两种认证方式
- ⚡ **缓存机制**: 智能缓存提升响应速度

## 🚀 快速开始

### 1. 安装依赖

```bash
# 克隆项目
git clone https://github.com/lzsheng/Yapi-MCP.git
cd Yapi-MCP

# 安装依赖
npm install
# 或使用 pnpm
pnpm install
```

### 2. 配置认证方式

项目支持两种认证方式，请根据您的 YApi 服务器配置选择合适的方式：

#### 方式一：Cookie 认证（推荐）

Cookie 认证方式更加灵活，可以自动发现用户的所有项目。

**获取 Cookie 的步骤：**

1. **登录 YApi**: 在浏览器中访问您的 YApi 服务器并登录
2. **打开开发者工具**: 按 `F12` 或右键选择"检查"
3. **访问网络面板**: 点击 "Network" (网络) 选项卡
4. **触发请求**: 在 YApi 网站上进行任意操作（如刷新页面、点击项目等）
5. **复制 Cookie**: 
   - 在网络面板中选择任意一个请求
   - 在请求详情中找到 "Request Headers"
   - 复制 `Cookie:` 后面的完整内容

**配置示例：**

创建 `.env` 文件：

```env
# YApi 服务器配置
YAPI_BASE_URL=http://your-yapi-server.com
PORT=3388

# Cookie 认证（复制浏览器中获取的完整 Cookie）
YAPI_TOKEN=_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; _yapi_uid=1413

# 缓存和日志配置
YAPI_CACHE_TTL=10
YAPI_LOG_LEVEL=info
```

#### 方式二：Token 认证

Token 认证需要手动配置每个项目的 Token，适合明确知道项目 ID 的场景。

**获取 Token 的步骤：**

1. **访问项目设置**: 在 YApi 中进入项目 → 设置 → Token配置
2. **复制项目 Token**: 复制显示的 Token 值
3. **获取项目 ID**: 从项目 URL 中获取，如 `http://yapi.com/project/654/interface/api` 中的 `654`

**配置示例：**

```env
# YApi 服务器配置  
YAPI_BASE_URL=http://your-yapi-server.com
PORT=3388

# Token 认证（格式：projectId:token,projectId:token）
YAPI_TOKEN=654:b988d9c0ac6ffc500085,123:another_token_here

# 或单个项目
YAPI_TOKEN=654:b988d9c0ac6ffc500085

# 缓存和日志配置
YAPI_CACHE_TTL=10
YAPI_LOG_LEVEL=info
```

### 3. 启动服务

```bash
# 开发模式
npm run dev
# 或
pnpm run dev

# 生产模式
npm run build
npm start
```

服务启动后会显示：

```
可用工具:
- yapi_get_api_desc: 获取YApi接口信息
- yapi_save_api: 新增或更新YApi接口  
- yapi_search_apis: 搜索YApi接口
- yapi_list_projects: 列出YApi的项目ID和项目名称
- yapi_get_categories: 获取YApi项目下的接口分类列表

[INFO][YapiMCP] HTTP服务器监听端口 3388
[INFO][YapiMCP] SSE端点: http://localhost:3388/sse
```

## 🔧 在 Cursor 中配置

在 Cursor 的设置文件中添加 MCP 服务器配置：

**文件位置**: `~/Library/Application Support/Cursor/User/settings.json` (macOS)

```json
{
  "mcpServers": {
    "yapi-mcp": {  
      "url": "http://localhost:3388/sse"
    }
  }
}
```

配置完成后重启 Cursor，即可在 AI 对话中使用 YApi 功能。

## 📚 使用示例

### 搜索接口

```
请帮我搜索包含"登录"的接口
```

### 获取接口详情

```
请获取接口ID为123的详细信息
```

### 创建新接口

```
请帮我创建一个用户注册的接口，路径是/api/user/register，方法是POST
```

### 获取项目列表

```
请列出所有可用的项目
```

## ⚙️ 配置参数

| 参数 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `YAPI_BASE_URL` | YApi 服务器地址 | 必填 | `http://yapi.company.com` |
| `YAPI_TOKEN` | 认证信息 | 必填 | 见上方认证方式说明 |
| `PORT` | 服务端口 | `3388` | `3388` |
| `YAPI_CACHE_TTL` | 缓存时间(分钟) | `10` | `30` |
| `YAPI_LOG_LEVEL` | 日志级别 | `info` | `debug` / `warn` / `error` |

## 🔍 认证方式对比

| 特性 | Cookie 认证 | Token 认证 |
|------|-------------|------------|
| **配置难度** | 简单 | 中等 |
| **项目发现** | 自动发现所有项目 | 需手动配置项目ID |
| **权限范围** | 用户所有权限 | 项目级权限 |
| **有效期** | 会话有效期 | 长期有效 |
| **安全性** | 中等 | 高 |
| **适用场景** | 个人开发、快速体验 | 生产环境、多项目管理 |

## 🛠️ 故障排除

### Cookie 认证问题

**问题**: "请登录..." 错误
- **原因**: Cookie 已过期或无效
- **解决**: 重新登录 YApi 并获取新的 Cookie

**问题**: "未配置项目ID，无法加载项目信息"  
- **原因**: Cookie 格式不正确
- **解决**: 确保复制了完整的 Cookie 内容，包含 `_yapi_token` 和 `_yapi_uid`

### Token 认证问题

**问题**: "未配置项目ID xxx 的token"
- **原因**: 项目ID与Token不匹配
- **解决**: 检查 `.env` 中的 `YAPI_TOKEN` 格式是否正确

### 网络问题

**问题**: "与YApi服务器通信失败"
- **检查**: YApi 服务器地址是否正确
- **检查**: 网络连接是否正常
- **检查**: 防火墙设置

### 端口冲突

**问题**: 端口 3388 被占用
- **解决**: 修改 `.env` 中的 `PORT` 为其他值
- **记住**: 同时更新 Cursor 配置中的端口号

## 📋 API 端点

| 端点 | 说明 |
|------|------|
| `GET /sse` | Server-Sent Events 连接 |
| `POST /messages` | MCP 消息处理 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙋‍♂️ 支持

如遇问题，请：

1. 查看本文档的故障排除部分
2. 检查控制台日志输出
3. 提交 GitHub Issue 并附上：
   - 错误日志
   - 配置文件（隐藏敏感信息）
   - YApi 版本信息

---

**快速配置模板**

```bash
# 复制配置模板
cp .env.example .env

# 编辑配置
vim .env

# 启动服务
pnpm run dev

