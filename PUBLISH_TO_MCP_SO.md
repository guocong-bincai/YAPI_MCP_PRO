# 📋 YApi MCP Pro - 提交到 mcp.so

## 🎯 项目信息

**项目名称**: YApi MCP Pro  
**NPM包名**: `yapi-mcp-pro`  
**GitHub仓库**: https://github.com/guocong-bincai/YAPI_MCP_PRO  
**类型**: 第三方社区MCP服务器  

## 📝 项目描述

YApi MCP Pro是一个功能强大的Model Context Protocol (MCP)服务器，专为YApi接口管理平台设计。它支持在Cursor、Claude Desktop等AI编辑器中直接操作YApi，提供完整的接口生命周期管理功能。

### 🌟 核心特性

- **全面的接口管理**: 创建、读取、更新、删除接口
- **智能搜索**: 多维度搜索接口（名称、路径、项目）
- **项目与分类管理**: 完整的接口分类生命周期管理
- **用户与团队协作**: 获取当前用户详细信息和团队管理
- **测试与质量保证**: 管理接口测试用例集合
- **性能优化**: 智能缓存机制，提升响应速度
- **双重认证**: 支持Cookie和Token两种认证方式

### 🎯 支持的AI编辑器

- ✅ **Cursor** - 完全支持
- ✅ **Claude Desktop** - 完全支持
- ✅ 其他支持MCP的AI工具

### 📦 安装方式

```bash
# NPM 安装
npx -y yapi-mcp-pro

# 或者从源码构建
git clone https://github.com/guocong-bincai/YAPI_MCP_PRO.git
cd YAPI_MCP_PRO
npm install
npm run build
```

### ⚙️ 配置示例

```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "_yapi_token=您的token; _yapi_uid=您的用户ID",
        "NODE_ENV": "cli"
      }
    }
  }
}
```

### 🔧 主要工具

- `yapi_list_projects` - 列出所有YApi项目
- `yapi_get_categories` - 获取项目分类列表
- `yapi_search_apis` - 搜索接口
- `yapi_get_api_desc` - 获取接口详情
- `yapi_save_api` - 创建/更新接口
- `yapi_get_user_info` - 获取用户信息
- `yapi_create_project` - 创建项目
- `yapi_import_swagger` - 导入Swagger文档

### 📚 资源

- [详细文档](https://github.com/guocong-bincai/YAPI_MCP_PRO/blob/main/README.md)
- [使用指南](https://github.com/guocong-bincai/YAPI_MCP_PRO/blob/main/USAGE-GUIDE.md)
- [NPM页面](https://www.npmjs.com/package/yapi-mcp-pro)

---

## 🚀 提交到 mcp.so 的步骤

### 方法1: 在GitHub Issue中提交

1. 访问 https://github.com/chatmcp/mcpso/issues/1
2. 在评论中提交以下信息：

```markdown
**YApi MCP Pro** - 专业级YApi接口管理工具

🔗 **GitHub**: https://github.com/guocong-bincai/YAPI_MCP_PRO
📦 **NPM**: https://www.npmjs.com/package/yapi-mcp-pro
📋 **描述**: 功能强大的Model Context Protocol服务器，专为YApi接口管理平台设计，支持完整的接口生命周期管理

**主要特性**:
- 全面的接口管理 (CRUD)
- 智能搜索和过滤
- 项目与分类管理
- 用户和团队协作
- 测试集合管理
- 性能优化和缓存

**安装**: `npx -y yapi-mcp-pro`
**支持**: Cursor, Claude Desktop
```

### 方法2: 联系维护者

如果GitHub Issue方式不可用，可以通过以下方式联系：
- Twitter: 搜索 @idoubi (mcp.so维护者)
- 或通过其他MCP社区渠道

### 提交后的跟进

1. 关注Issue状态更新
2. 如有问题及时回复维护者的询问
3. 等待审核通过并上线到mcp.so

---

**注意**: 提交前确保：
- ✅ NPM包已发布且可正常安装
- ✅ GitHub仓库公开且文档完善
- ✅ README包含清晰的安装和使用说明
- ✅ 项目符合MCP规范 