# YApi MCP Pro 故障排查指南

## 🚨 快速排查清单

### ✅ 基础检查项

| 检查项 | 正常状态 | 异常处理 |
|--------|----------|----------|
| **YApi服务可访问** | `curl -I {YAPI_URL}` 返回200 | 检查YApi服务状态、网络连接 |
| **Token有效性** | 能正常访问YApi接口 | 重新获取Token或检查权限 |
| **NPM包版本** | `npx yapi-mcp-pro --version` 有输出 | 清缓存重装: `npm cache clean --force` |
| **环境变量** | `YAPI_BASE_URL`和`YAPI_TOKEN`已设置 | 检查环境变量或配置文件 |

### 🔍 分步排查流程

#### 1. 配置文件对比
**让正常工作的同事分享配置**：
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-domain.com",
        "YAPI_TOKEN": "your-token-here"
      }
    }
  }
}
```

#### 2. 逐步测试连接

**步骤1: 验证YApi连接**
```bash
# 测试基础连接
curl -I "http://your-yapi-domain.com"

# 测试API接口
curl -H "Authorization: token your-token" \
     "http://your-yapi-domain.com/api/user/status"
```

**步骤2: 测试MCP服务器**
```bash
# 直接运行MCP服务器
export YAPI_BASE_URL="http://your-yapi-domain.com"
export YAPI_TOKEN="your-token"
npx yapi-mcp-pro

# 应该看到类似输出：
# YApi MCP Server started successfully
# Connected to YApi: http://your-yapi-domain.com
```

**步骤3: 验证Cursor连接**
1. 重启Cursor
2. 检查MCP设置页面
3. 观察状态灯变化

#### 3. 常见错误诊断

| 错误现象 | 可能原因 | 解决方案 |
|----------|----------|----------|
| 🔴 红灯一直亮 | MCP服务器启动失败 | 检查环境变量、NPM包安装 |
| 🟡 黄灯闪烁 | 连接超时 | 检查网络、防火墙设置 |
| ⚫ 无状态显示 | 配置文件格式错误 | 检查JSON语法、重新配置 |
| 🔄 反复重连 | Token过期或无效 | 重新获取YApi Token |

#### 4. 环境差异排查

**网络环境**：
```bash
# 检查代理设置
echo $HTTP_PROXY
echo $HTTPS_PROXY

# 测试无代理连接
unset HTTP_PROXY HTTPS_PROXY
curl "http://your-yapi-domain.com"
```

**系统环境**：
```bash
# 检查Node.js版本
node --version  # 建议 >= 16.0.0

# 检查NPM版本
npm --version

# 检查系统架构
uname -a
```

#### 5. 高级调试方法

**启用调试模式**：
```bash
# 详细日志输出
DEBUG=yapi-mcp:* npx yapi-mcp-pro

# Cursor开发者工具
# Cmd/Ctrl + Shift + I -> Console标签页
```

**网络抓包分析**：
```bash
# macOS/Linux
sudo tcpdump -i any host your-yapi-domain.com

# Windows (需要Wireshark)
```

### 🛠️ 快速修复方案

#### 方案1: 重置配置
```bash
# 1. 备份当前配置
cp ~/Library/Application\ Support/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json backup.json

# 2. 删除配置文件重新配置
rm ~/Library/Application\ Support/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/settings/cline_mcp_settings.json

# 3. 重启Cursor重新配置
```

#### 方案2: 使用本地配置文件
创建 `.cursormcp` 配置文件：
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-domain.com",
        "YAPI_TOKEN": "your-token-here"
      }
    }
  }
}
```

#### 方案3: 使用绝对路径
如果NPM全局安装有问题：
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "/usr/local/bin/node",
      "args": ["/usr/local/lib/node_modules/yapi-mcp-pro/dist/index.js"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-domain.com",
        "YAPI_TOKEN": "your-token-here"
      }
    }
  }
}
```

### 📞 获取帮助

如果以上步骤都无法解决问题，请收集以下信息：

1. **系统信息**：操作系统、Node.js版本、Cursor版本
2. **错误日志**：Cursor开发者工具中的错误信息
3. **配置文件**：脱敏后的MCP配置内容
4. **网络测试**：`curl`命令的输出结果

**联系方式**：
- GitHub Issues: https://github.com/guocong-bincai/YAPI_MCP_PRO/issues
- 提供详细的错误信息和环境描述

### 🎯 预防措施

1. **统一配置**：团队使用相同的配置模板
2. **环境检查**：定期验证YApi服务可用性
3. **版本管理**：使用固定版本号而非latest
4. **文档维护**：保持配置文档最新

---

*此故障排查指南涵盖了YApi MCP Pro的常见连接问题，如遇到其他问题请及时反馈。* 