# 🚀 YAPI MCP PRO - 专业级YApi接口管理工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)

一个功能强大的 Model Context Protocol (MCP) 服务器，专为 YApi 接口管理平台设计。支持在 Cursor、Claude Desktop 等 AI 编辑器中直接操作 YApi，提供完整的接口生命周期管理功能。

## 📋 目录

- [✨ 核心特性](#-核心特性)
- [🎯 支持的AI编辑器](#-支持的ai编辑器)
- [🚀 快速开始](#-快速开始)
- [🔧 配置指南](#-配置指南)
- [📚 MCP工具详解](#-mcp工具详解)
- [💡 使用示例](#-使用示例)
- [🛠️ 项目管理](#️-项目管理)
- [🔍 故障排除](#-故障排除)
- [📖 高级用法](#-高级用法)
- [🤝 贡献指南](#-贡献指南)

## ✨ 核心特性

### 🎯 全面的接口管理
- **接口CRUD**: 创建、读取、更新、删除接口
- **智能搜索**: 多维度搜索接口（名称、路径、项目）
- **批量操作**: 支持接口复制、批量导入导出
- **实时同步**: 与YApi服务器实时同步数据

### 🏗️ 项目与分类管理
- **项目管理**: 创建、更新项目信息
- **分类管理**: 完整的接口分类生命周期管理
- **权限控制**: 基于YApi权限系统的安全访问

### 👥 用户与团队协作
- **用户信息**: 获取当前用户详细信息
- **团队管理**: 查看用户所属分组和权限

### 🧪 测试与质量保证
- **测试集合**: 管理接口测试用例集合
- **数据导入导出**: 支持Swagger、JSON等格式

### ⚡ 性能与体验
- **智能缓存**: 多层缓存机制，提升响应速度
- **实时通信**: SSE支持，实时数据更新
- **双重认证**: Cookie和Token两种认证方式
- **详细日志**: 完整的操作日志和错误追踪

## 🎯 支持的AI编辑器

| 编辑器 | 支持状态 | 配置方式 |
|--------|----------|----------|
| **Cursor** | ✅ 完全支持 | MCP配置 |
| **Claude Desktop** | ✅ 完全支持 | MCP配置 |
| **VS Code** | 🔄 开发中 | 插件形式 |
| **其他支持MCP的工具** | ✅ 理论支持 | 标准MCP协议 |

## 🚀 快速开始

### 1. 环境要求

- **Node.js**: >= 16.0.0
- **npm/pnpm**: 最新版本
- **YApi服务器**: 可访问的YApi实例

### 2. 安装部署

```bash
# 克隆项目
git clone git@github.com:guocong-bincai/YAPI_MCP_PRO.git
cd YAPI_MCP_PRO

# 安装依赖
npm install
# 或使用 pnpm (推荐)
pnpm install

# 构建项目
npm run build
```

### 3. 快速配置

```bash
# 复制配置模板
cp .env.example .env

# 编辑配置文件
vim .env
```

### 4. 启动服务

```bash
# 使用项目管理脚本（推荐）
./start-mcp.sh start

# 或手动启动
npm run dev
```

## 🔧 配置指南

### 认证方式选择

#### 🍪 Cookie认证（推荐）

**优势**: 自动发现所有项目，配置简单，权限完整

**获取步骤**:
1. 浏览器登录YApi
2. 打开开发者工具 (F12)
3. 网络面板中复制任意请求的Cookie
4. 配置到 `.env` 文件

```env
# Cookie认证配置
YAPI_BASE_URL=http://your-yapi-server.com
YAPI_TOKEN=_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; _yapi_uid=1413
```

#### 🔑 Token认证

**优势**: 长期有效，安全性高，适合生产环境

**获取步骤**:
1. YApi项目 → 设置 → Token配置
2. 复制项目Token和项目ID
3. 按格式配置多个项目

```env
# Token认证配置
YAPI_BASE_URL=http://your-yapi-server.com
YAPI_TOKEN=654:b988d9c0ac6ffc500085,123:another_token_here
```

### 完整配置参数

```env
# === 基础配置 ===
YAPI_BASE_URL=http://your-yapi-server.com    # YApi服务器地址
PORT=3388                                     # MCP服务端口

# === 认证配置 ===
YAPI_TOKEN=your_auth_info                     # 认证信息（Cookie或Token）

# === 性能配置 ===
YAPI_CACHE_TTL=10                            # 缓存时间（分钟）
YAPI_LOG_LEVEL=info                          # 日志级别

# === 可选配置 ===
YAPI_GROUP_ID=1557                           # 默认分组ID（创建项目时使用）
```

### Cursor配置

**配置文件位置**: 
- macOS: `~/Library/Application Support/Cursor/User/settings.json`
- Windows: `%APPDATA%\Cursor\User\settings.json`
- Linux: `~/.config/Cursor/User/settings.json`

```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "url": "http://localhost:3388/sse"
    }
  }
}
```

## 📚 MCP工具详解

YAPI MCP PRO 提供 **19个专业工具**，涵盖YApi的完整功能生态：

### 🔧 基础接口管理 (5个工具)

#### 1. `yapi_get_api_desc` - 获取接口详细信息
**功能**: 获取指定接口的完整定义信息
**参数**:
- `projectId` (string): 项目ID
- `apiId` (string): 接口ID

**返回信息**:
- 接口基本信息（名称、路径、方法）
- 请求参数（URL参数、查询参数、请求头、请求体）
- 响应信息（响应类型、响应内容）
- 接口文档和描述

#### 2. `yapi_save_api` - 新增或更新接口
**功能**: 创建新接口或更新现有接口
**参数**:
- `projectId` (string): 项目ID
- `catid` (string): 分类ID
- `title` (string): 接口标题
- `path` (string): 接口路径
- `method` (string): 请求方法
- `id` (string, 可选): 接口ID（更新时必填）
- `desc` (string, 可选): 接口描述
- `req_*` (可选): 各种请求参数配置
- `res_*` (可选): 响应配置

#### 3. `yapi_search_apis` - 搜索接口
**功能**: 多维度搜索接口
**参数**:
- `nameKeyword` (string, 可选): 接口名称关键字
- `pathKeyword` (string, 可选): 接口路径关键字
- `projectKeyword` (string, 可选): 项目关键字
- `limit` (number, 可选): 返回结果数量限制

**搜索能力**:
- 支持模糊匹配
- 跨项目搜索
- 智能排序和去重

#### 4. `yapi_delete_interface` - 删除接口
**功能**: 删除指定接口
**参数**:
- `interfaceId` (string): 接口ID
- `projectId` (string): 项目ID

#### 5. `yapi_copy_interface` - 复制接口
**功能**: 复制接口到指定分类
**参数**:
- `interfaceId` (string): 源接口ID
- `projectId` (string): 项目ID
- `catId` (string, 可选): 目标分类ID

### 📊 项目管理 (3个工具)

#### 6. `yapi_list_projects` - 列出项目
**功能**: 获取所有可访问的项目列表
**返回信息**:
- 项目ID和名称
- 项目描述
- 基础路径
- 所属分组信息

#### 7. `yapi_create_project` - 创建项目
**功能**: 创建新的YApi项目
**参数**:
- `name` (string): 项目名称
- `basepath` (string): 基础路径
- `group_id` (number): 所属分组ID
- `desc` (string, 可选): 项目描述
- `color` (string, 可选): 项目颜色
- `icon` (string, 可选): 项目图标

#### 8. `yapi_update_project` - 更新项目
**功能**: 更新项目信息
**参数**:
- `id` (number): 项目ID
- `name` (string, 可选): 项目名称
- `basepath` (string, 可选): 基础路径
- `desc` (string, 可选): 项目描述
- `color` (string, 可选): 项目颜色
- `icon` (string, 可选): 项目图标

### 📁 分类管理 (4个工具)

#### 9. `yapi_get_categories` - 获取分类列表
**功能**: 获取项目下的所有接口分类
**参数**:
- `projectId` (string): 项目ID

**返回信息**:
- 分类基本信息
- 每个分类下的接口列表
- 分类创建和更新时间

#### 10. `yapi_create_category` - 创建分类
**功能**: 在项目中创建新的接口分类
**参数**:
- `name` (string): 分类名称
- `project_id` (number): 项目ID
- `desc` (string, 可选): 分类描述

#### 11. `yapi_update_category` - 更新分类
**功能**: 更新分类信息
**参数**:
- `catId` (string): 分类ID
- `name` (string): 分类名称
- `desc` (string, 可选): 分类描述

#### 12. `yapi_delete_category` - 删除分类
**功能**: 删除指定分类
**参数**:
- `catId` (string): 分类ID

### 👤 用户管理 (2个工具)

#### 13. `yapi_get_user_info` - 获取用户信息
**功能**: 获取当前登录用户的详细信息
**返回信息**:
- 用户ID和用户名
- 邮箱地址
- 用户角色和权限
- 账户创建和更新时间

#### 14. `yapi_get_user_groups` - 获取用户分组
**功能**: 获取用户所属的分组列表
**返回信息**:
- 分组ID和名称
- 分组描述
- 成员数量
- 分组创建时间

### 🧪 测试集合 (2个工具)

#### 15. `yapi_get_test_collections` - 获取测试集合
**功能**: 获取项目的测试集合列表
**参数**:
- `projectId` (string): 项目ID

**返回信息**:
- 测试集合基本信息
- 创建和更新时间
- 集合描述

#### 16. `yapi_create_test_collection` - 创建测试集合
**功能**: 创建新的测试集合
**参数**:
- `name` (string): 集合名称
- `project_id` (number): 项目ID
- `desc` (string, 可选): 集合描述

### 📥📤 数据导入导出 (2个工具)

#### 17. `yapi_import_swagger` - 导入Swagger数据
**功能**: 将Swagger文档导入到YApi项目
**参数**:
- `projectId` (string): 目标项目ID
- `catId` (string): 目标分类ID
- `swaggerData` (string): Swagger JSON数据
- `merge` (string, 可选): 合并模式

**支持的合并模式**:
- `normal`: 普通模式
- `good`: 智能合并
- `merge`: 完全覆盖

#### 18. `yapi_export_project` - 导出项目数据
**功能**: 导出项目数据为指定格式
**参数**:
- `projectId` (string): 项目ID
- `type` (string, 可选): 导出格式

**支持的导出格式**:
- `json`: JSON格式
- `markdown`: Markdown文档
- `swagger`: Swagger格式

### 🔄 其他功能 (1个工具)

#### 19. `yapi_run_interface` - 运行接口测试
**功能**: 执行接口测试请求
**参数**:
- `interface_id` (string): 接口ID
- `project_id` (string): 项目ID
- `env_id` (string, 可选): 环境ID
- `domain` (string, 可选): 测试域名
- `headers` (array, 可选): 自定义请求头
- `params` (object, 可选): 请求参数
- `body` (object, 可选): 请求体

## 💡 使用示例

### 🔍 接口搜索与管理

```
# 搜索登录相关接口
请搜索包含"登录"的接口

# 获取特定接口详情
请获取项目654中接口ID为123的详细信息

# 创建新接口
请在项目654的"用户管理"分类中创建一个用户注册接口：
- 路径：/api/user/register
- 方法：POST
- 描述：用户注册接口
```

### 🏗️ 项目初始化

```
# 创建新项目
请创建一个名为"电商系统"的项目，基础路径为"/api"

# 为项目创建分类结构
请为项目654创建以下分类：
1. 用户管理
2. 商品管理  
3. 订单管理
4. 支付管理
```

### 📊 批量操作

```
# 批量创建接口
请为用户模块创建以下接口，都放在项目654的用户管理分类中：
1. GET /api/user/profile - 获取用户信息
2. PUT /api/user/profile - 更新用户信息
3. DELETE /api/user/account - 删除账户

# 导入Swagger文档
请将以下Swagger数据导入到项目654的API分类中：
[粘贴Swagger JSON]
```

### 🧪 测试与验证

```
# 创建测试集合
请为项目654创建一个名为"用户模块测试"的测试集合

# 运行接口测试
请测试项目654中接口ID为123的接口，使用测试环境
```

## 🛠️ 项目管理

### 服务管理脚本

项目提供了便捷的管理脚本 `start-mcp.sh`：

```bash
# 启动服务
./start-mcp.sh start

# 检查状态
./start-mcp.sh status

# 停止服务
./start-mcp.sh stop

# 重启服务
./start-mcp.sh restart

# 查看日志
./start-mcp.sh logs

# 查看实时日志
./start-mcp.sh logs -f
```

### 日志管理

```bash
# 查看错误日志
grep "ERROR" yapi-mcp.log

# 查看特定时间的日志
grep "2024-01-01" yapi-mcp.log

# 清理日志
> yapi-mcp.log
```

### 缓存管理

```bash
# 查看缓存目录
ls -la .yapi-cache/

# 清理缓存
rm -rf .yapi-cache/*

# 重新构建缓存
./start-mcp.sh restart
```

## 🔍 故障排除

### 常见问题

#### 🍪 Cookie认证问题

**问题**: "请登录..." 错误
```bash
# 解决方案
1. 重新登录YApi获取新Cookie
2. 检查Cookie格式是否完整
3. 确认YApi服务器地址正确
```

**问题**: "未配置项目ID，无法加载项目信息"
```bash
# 解决方案
1. 确保Cookie包含 _yapi_token 和 _yapi_uid
2. 检查Cookie是否被截断
3. 重新复制完整的Cookie字符串
```

#### 🔑 Token认证问题

**问题**: "未配置项目ID xxx 的token"
```bash
# 解决方案
1. 检查 .env 中 YAPI_TOKEN 格式
2. 确认项目ID和Token匹配
3. 验证Token是否有效
```

#### 🌐 网络连接问题

**问题**: "与YApi服务器通信失败"
```bash
# 诊断步骤
1. ping your-yapi-server.com
2. curl -I http://your-yapi-server.com
3. 检查防火墙设置
4. 确认YApi服务器状态
```

#### 🔧 服务启动问题

**问题**: 端口被占用
```bash
# 查找占用进程
lsof -i :3388

# 修改端口
echo "PORT=3389" >> .env

# 重启服务
./start-mcp.sh restart
```

### 调试模式

```bash
# 启用调试日志
echo "YAPI_LOG_LEVEL=debug" >> .env

# 重启服务
./start-mcp.sh restart

# 查看详细日志
./start-mcp.sh logs -f
```

### 性能优化

```bash
# 调整缓存时间
echo "YAPI_CACHE_TTL=30" >> .env

# 监控内存使用
ps aux | grep node

# 清理无用缓存
find .yapi-cache -name "*.json" -mtime +7 -delete
```

## 📖 高级用法

### 自定义工具开发

```typescript
// 扩展新的MCP工具
this.server.tool(
  "yapi_custom_tool",
  "自定义工具描述",
  {
    param1: z.string().describe("参数描述")
  },
  async ({ param1 }) => {
    // 工具实现逻辑
    const result = await this.yapiService.customMethod(param1);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);
```

### 批量数据处理

```typescript
// 批量导入接口
const interfaces = [
  { title: "接口1", path: "/api/test1", method: "GET" },
  { title: "接口2", path: "/api/test2", method: "POST" }
];

for (const interfaceData of interfaces) {
  await yapiService.saveInterface({
    ...interfaceData,
    project_id: "654",
    catid: "123"
  });
}
```

### 集成CI/CD

```yaml
# GitHub Actions 示例
name: YApi Sync
on:
  push:
    branches: [main]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Sync to YApi
        run: |
          npm run build
          node scripts/sync-to-yapi.js
        env:
          YAPI_BASE_URL: ${{ secrets.YAPI_BASE_URL }}
          YAPI_TOKEN: ${{ secrets.YAPI_TOKEN }}
```

## 🤝 贡献指南

### 开发环境设置

```bash
# 克隆项目
git clone git@github.com:guocong-bincai/YAPI_MCP_PRO.git
cd YAPI_MCP_PRO

# 安装依赖
pnpm install

# 启动开发模式
pnpm run dev

# 运行测试
pnpm test

# 代码格式化
pnpm run format

# 类型检查
pnpm run type-check
```

### 提交规范

```bash
# 功能开发
git commit -m "feat: 添加新的MCP工具"

# 问题修复
git commit -m "fix: 修复Cookie认证问题"

# 文档更新
git commit -m "docs: 更新使用指南"

# 性能优化
git commit -m "perf: 优化缓存机制"
```

### 代码规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试覆盖核心功能
- 添加详细的 JSDoc 注释

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙋‍♂️ 支持与反馈

### 获取帮助

1. **文档优先**: 查看本README和相关文档
2. **日志分析**: 检查 `yapi-mcp.log` 文件
3. **社区支持**: 提交GitHub Issue
4. **商业支持**: 联系项目维护者

### 问题报告

提交Issue时请包含：
- 详细的错误描述
- 完整的错误日志
- 环境信息（Node.js版本、操作系统等）
- 复现步骤
- 配置文件（隐藏敏感信息）

### 功能建议

欢迎提交功能建议和改进意见：
- 描述具体的使用场景
- 说明期望的功能行为
- 提供相关的参考资料

---

## 🎉 快速开始模板

```bash
# 一键启动
git clone git@github.com:guocong-bincai/YAPI_MCP_PRO.git
cd YAPI_MCP_PRO
cp .env.example .env
# 编辑 .env 配置你的YApi信息
pnpm install
pnpm run build
./start-mcp.sh start

# 配置Cursor
# 在 settings.json 中添加：
# "mcpServers": {
#   "yapi-mcp-pro": {
#     "url": "http://localhost:3388/sse"
#   }
# }

# 开始使用
# 在Cursor中输入：请列出所有YApi项目
```

**🚀 现在你已经拥有了最强大的YApi AI助手！**

