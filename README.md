# 🚀 YAPI MCP PRO - 专业级YApi接口管理工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue.svg)](https://www.typescriptlang.org/)

一个功能强大的 Model Context Protocol (MCP) 服务器，专为 YApi 接口管理平台设计。支持在 Cursor、Claude Desktop 等 AI 编辑器中直接操作 YApi，提供完整的接口生命周期管理功能。

## 🚨 常见问题快速解决

### ⚠️ 重要：NPM缓存问题（必看！）

**如果您遇到连接问题，首先检查这个：**

```bash
# 1. 检查版本命令是否正常
npx yapi-mcp-pro --version

# 2. 如果上面命令没有正常输出版本号，执行清缓存：
npm cache clean --force

# 3. 然后重新测试
npx yapi-mcp-pro --version
```

**🔍 判断标准**：
- ✅ **正常**：显示版本号如 `0.2.1`
- ❌ **异常**：显示错误信息、找不到命令、或者卡住不动

> 💡 **为什么会出现这个问题？**
> NPM缓存可能损坏或过期，导致无法正确下载或运行包。清理缓存可以解决大部分连接问题。

### 🔧 快速故障排查清单

| 检查项 | 正常状态 | 异常处理 |
|--------|----------|----------|
| **🔥 NPM包版本** | `npx yapi-mcp-pro --version` 有输出 | **必须执行**: `npm cache clean --force` |
| **YApi服务可访问** | `curl -I {YAPI_URL}` 返回200 | 检查YApi服务状态、网络连接 |
| **Token有效性** | 能正常访问YApi接口 | 重新获取Token或检查权限 |
| **环境变量** | `YAPI_BASE_URL`和`YAPI_TOKEN`已设置 | 检查环境变量或配置文件 |

### 🚦 Cursor状态灯说明

| 状态 | 含义 | 解决方案 |
|------|------|----------|
| 🟢 **绿灯** | 连接正常 | 可以正常使用 |
| 🔴 **红灯** | 连接失败 | 1. 先执行 `npm cache clean --force`<br>2. 检查配置文件<br>3. 验证YApi连接 |
| 🟡 **黄灯** | 连接超时 | 检查网络、防火墙设置 |
| ⚫ **无显示** | 配置错误 | 检查JSON语法、重新配置 |

### 💊 一键修复脚本

如果遇到问题，复制以下命令一键修复：

```bash
# 清理NPM缓存并重新安装
npm cache clean --force && npx clear-npx-cache 2>/dev/null || true

# 验证安装
npx yapi-mcp-pro --version

# 测试YApi连接（替换为您的实际地址）
curl -I "http://your-yapi-server.com"
```

---

<div align="center">

### 🚀 想要立即开始？

**只需要2样东西：**
1. 📍 您的YApi服务器地址
2. 🍪 浏览器中的Cookie

**⏱️ 配置时间：不到5分钟**

[👉 点击这里开始配置](#-5分钟快速开始)

</div>

## ⚡ 5分钟快速开始

> 🎯 **推荐方式**：使用NPM包的stdio模式，无需本地构建，开箱即用！
> 
> 📦 **自动更新**：使用 `npx -y yapi-mcp-pro` 确保总是使用最新版本
> 
> 🔒 **安全便捷**：Cookie认证自动发现所有项目，配置简单

### 🚀 完全新手？3步搞定！

**如果您是第一次接触，按这个顺序：**

1. **📥 安装Node.js** → [点击查看详细安装指南](#-nodejs-完整安装指南新手必看)
2. **🔧 配置Cursor** → [继续下面的配置步骤](#🔧-第二步配置cursor)  
3. **🎉 开始使用** → [测试连接和使用](#🚀-第三步开始使用)

> 💡 **已经有Node.js？** 直接从第2步开始！

### 🎯 第一步：获取YApi认证信息

#### 1. 获取YApi服务器地址
从浏览器地址栏复制您的YApi服务器地址，例如：`http://your-yapi-server.com`

#### 2. 获取Cookie认证信息（推荐方式）

1. **登录YApi**: 在浏览器中正常登录您的YApi系统
2. **打开开发者工具**: 按 `F12` 或右键选择"检查"
3. **切换到Network面板**: 点击"Network"（网络）标签
4. **触发网络请求**: 在YApi页面中随便点击一个功能（如刷新页面）
5. **查看请求详情**: 点击任意一个网络请求（如下图红框所示）
6. **找到Cookie字段**: 在右侧面板中找到"Request Headers"
7. **复制Cookie值**: 找到"Cookie"字段，复制完整的Cookie值（如下图红框所示）

![Cookie获取示例](images/cookie-example.png)

> 💡 **重要提示**：
> - Cookie必须包含 `_yapi_token` 和 `_yapi_uid` 两个关键字段
> - 完整格式如：`_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; _yapi_uid=1413; 其他cookie值`
> - 请复制完整的Cookie字符串，不要遗漏任何部分

**🔍 Cookie内容示例**：
```
_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...(您的完整token); _yapi_uid=您的用户ID; keep-alive
```

### 🔧 第二步：配置Cursor

#### 方式一：项目级配置（推荐）

**步骤**：
1. 在您的项目根目录创建 `.cursor` 文件夹（如果不存在）
2. 在 `.cursor` 文件夹中创建 `mcp.json` 文件
3. 复制以下配置内容到文件中：

**💻 终端快速创建**：
```bash
# 创建目录和文件
mkdir -p .cursor
touch .cursor/mcp.json

# 然后编辑文件内容
```

```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "_yapi_token=您的真实token; _yapi_uid=您的用户ID",
        "NODE_ENV": "cli"
      }
    }
  }
}
```

**📝 配置示例**（请替换为您的真实信息）：
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "_yapi_token=您的真实token值; _yapi_uid=您的用户ID",
        "NODE_ENV": "cli"
      }
    }
  }
}
```

#### 方式二：全局配置

编辑Cursor全局配置文件：
- **macOS**: `~/Library/Application Support/Cursor/User/settings.json`
- **Windows**: `%APPDATA%\Cursor\User\settings.json`
- **Linux**: `~/.config/Cursor/User/settings.json`

添加相同的配置内容。

### 🚀 第三步：开始使用

1. **重启Cursor** - 让MCP配置生效
2. **测试连接** - 在Cursor中输入以下命令测试：

```
请获取我的YApi用户信息
请列出所有YApi项目
请搜索用户相关的接口
```

3. **开始管理API** - 现在您可以通过AI助手管理YApi接口了！

### 🆘 快速问题解决

#### ❓ 提示"与YApi服务器通信失败"？
- 检查 `YAPI_BASE_URL` 是否正确
- 确保网络能访问YApi服务器
- 验证YApi服务器是否正常运行

#### ❓ 提示"请登录"或"认证失败"？
- 重新获取Cookie，确保包含 `_yapi_token` 和 `_yapi_uid`
- 检查Cookie是否完整，没有被截断
- 确认YApi登录状态是否有效

#### ❓ Cursor中看不到MCP工具？
- 确认已重启Cursor
- 检查配置文件路径和格式是否正确
- 查看Cursor的MCP连接状态

#### ❓ 需要更多帮助？
- 查看 [详细配置指南](#-详细配置指南)
- 查看 [故障排除](#-故障排除) 章节
- 提交 [GitHub Issue](https://github.com/guocong-bincai/YAPI_MCP_PRO/issues)

---

## 🔧 环境要求与兼容性检查

### 📋 最低系统要求

在开始配置之前，请确保您的系统满足以下要求：

| 要求项 | 最低版本 | 推荐版本 | 验证命令 |
|--------|----------|----------|----------|
| **Node.js** | 16.0.0+ | 18.0.0+ | `node --version` |
| **npm** | 7.0.0+ | 9.0.0+ | `npm --version` |
| **网络访问** | - | - | 能访问YApi服务器和NPM Registry |

### 🚀 Node.js 完整安装指南（新手必看）

> 💡 **如果您已经安装了Node.js，可以跳过此部分**
> 
> 检查是否已安装：在终端/命令提示符中输入 `node --version`
> - 如果显示版本号（如 `v18.17.0`），说明已安装
> - 如果提示 "command not found" 或类似错误，需要安装

#### 🎯 方式一：官方安装器（推荐新手）

**第一步：访问官网下载**

1. 打开浏览器，访问 **[https://nodejs.org/](https://nodejs.org/)**
2. 页面会自动识别您的操作系统
3. 点击绿色的 **"Download Node.js (LTS)"** 按钮

![Node.js官网下载](https://nodejs.org/static/images/logo.svg)

**第二步：根据您的操作系统选择**

| 操作系统 | 下载文件 | 安装方式 |
|----------|----------|----------|
| **Windows** | `node-v18.x.x-x64.msi` | 双击运行，按向导安装 |
| **macOS** | `node-v18.x.x.pkg` | 双击运行，按向导安装 |
| **Linux** | `node-v18.x.x-linux-x64.tar.xz` | 解压或使用包管理器 |

**第三步：安装过程**

**🪟 Windows 用户：**
1. 双击下载的 `.msi` 文件
2. 点击 "Next" 接受许可协议
3. 选择安装路径（建议使用默认路径）
4. **重要：确保勾选 "Add to PATH" 选项**
5. 点击 "Install" 开始安装
6. 安装完成后重启命令提示符

**🍎 macOS 用户：**
1. 双击下载的 `.pkg` 文件
2. 按照安装向导提示操作
3. 输入管理员密码（如果需要）
4. 安装完成后重启终端

**🐧 Linux 用户：**
```bash
# 下载并解压（以Ubuntu为例）
wget https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz
tar -xf node-v18.17.0-linux-x64.tar.xz

# 移动到系统目录
sudo mv node-v18.17.0-linux-x64 /opt/nodejs

# 创建软链接
sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm
sudo ln -s /opt/nodejs/bin/npx /usr/local/bin/npx
```

#### ⚡ 方式二：包管理器安装（适合有经验用户）

**🪟 Windows (使用 Chocolatey):**
```powershell
# 首先安装Chocolatey (如果没有)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# 安装Node.js
choco install nodejs

# 验证安装
node --version
npm --version
```

**🍎 macOS (使用 Homebrew):**
```bash
# 首先安装Homebrew (如果没有)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装Node.js
brew install node

# 验证安装
node --version
npm --version
```

**🐧 Linux (使用包管理器):**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL (使用dnf)
sudo dnf install nodejs npm

# CentOS/RHEL (使用yum)
sudo yum install nodejs npm

# Arch Linux
sudo pacman -S nodejs npm

# 验证安装
node --version
npm --version
```

#### 🔍 安装验证

**安装完成后，请执行以下命令验证：**

```bash
# 检查Node.js版本（应显示 v16.0.0 或更高版本）
node --version

# 检查npm版本（应显示 7.0.0 或更高版本）
npm --version

# 检查npx是否可用
npx --version

# 测试npm连接（可选）
npm ping
```

**✅ 成功安装的标志：**
- `node --version` 显示版本号（如：`v18.17.0`）
- `npm --version` 显示版本号（如：`9.6.7`）
- `npx --version` 显示版本号（如：`9.6.7`）

#### ⚠️ 常见安装问题

**❌ "node: command not found"**
- **Windows**: 重启命令提示符，或检查环境变量PATH
- **macOS/Linux**: 重启终端，或手动添加到PATH：
  ```bash
  echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bashrc
  source ~/.bashrc
  ```

**❌ 版本过低**
```bash
# 更新到最新版本
npm install -g npm@latest

# 或重新下载安装最新版Node.js
```

**❌ 权限问题**
```bash
# macOS/Linux: 修复npm权限
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**❌ 网络问题（中国用户）**
```bash
# 切换到国内镜像源
npm config set registry https://registry.npmmirror.com

# 验证镜像源
npm config get registry
```

#### 🎉 安装成功后的建议配置

```bash
# 设置npm全局安装目录（避免权限问题）
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# 添加到环境变量（macOS/Linux）
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.profile
source ~/.profile

# Windows用户需要手动添加 %USERPROFILE%\.npm-global 到PATH环境变量
```

#### 🚀 验证YApi MCP Pro可用性

**安装Node.js后，立即测试我们的工具：**

```bash
# 测试YApi MCP Pro是否可以正常运行
npx -y yapi-mcp-pro --help

# 如果看到帮助信息，说明环境配置成功！
```

**看到类似输出表示成功：**
```
选项：
  --version            显示版本号
  --yapi-base-url      YApi服务器基础URL
  --yapi-token         YApi服务器授权Token
  --help               显示帮助信息
```

### 🔍 环境检查脚本

**一键检查所有环境要求**：

```bash
# Windows (PowerShell)
echo "=== YApi MCP Pro 环境检查 ===" && echo "Node.js版本:" && node --version && echo "NPM版本:" && npm --version && echo "网络连通性:" && npm ping

# macOS/Linux
echo "=== YApi MCP Pro 环境检查 ===" && echo "Node.js版本:" && node --version && echo "NPM版本:" && npm --version && echo "测试NPM连接:" && npm ping

# 检查NPX可用性
npx --version
```

### ⚠️ 常见环境问题

#### ❌ "node: command not found"
**问题**: 系统未安装Node.js
**解决方案**:
- 访问 [nodejs.org](https://nodejs.org/) 下载安装最新LTS版本
- 或使用包管理器：
  ```bash
  # macOS (使用Homebrew)
  brew install node
  
  # Ubuntu/Debian
  sudo apt update && sudo apt install nodejs npm
  
  # Windows (使用Chocolatey)
  choco install nodejs
  ```

#### ❌ "npx: command not found"
**问题**: NPX未正确安装
**解决方案**:
```bash
# 重新安装NPM (NPX包含在NPM中)
npm install -g npm@latest

# 或单独安装NPX
npm install -g npx
```

#### ❌ "EACCES: permission denied"
**问题**: 权限不足
**解决方案**:
```bash
# macOS/Linux: 修复NPM权限
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# 或配置NPM使用不同目录
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### ❌ 网络连接问题
**问题**: 无法下载NPM包
**解决方案**:
```bash
# 检查NPM Registry连接
npm config get registry

# 切换到国内镜像（如果在中国）
npm config set registry https://registry.npmmirror.com

# 测试网络连接
curl -I https://registry.npmjs.org
```

### 🌍 不同平台的详细配置

#### 🍎 macOS 配置指南

**第一步：安装依赖**
```bash
# 安装Node.js (推荐使用Homebrew)
brew install node

# 验证安装
node --version && npm --version
```

**第二步：配置Cursor**
```bash
# 创建配置目录
mkdir -p ~/.config/Cursor/User

# 编辑配置文件
code ~/.config/Cursor/User/settings.json
# 或使用任意文本编辑器
```

**第三步：添加MCP配置**
在 `settings.json` 中添加：
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "您的完整Cookie字符串",
        "NODE_ENV": "cli"
      }
    }
  }
}
```

#### 🪟 Windows 配置指南

**第一步：安装依赖**
```powershell
# 使用官方安装器
# 访问 https://nodejs.org/ 下载Windows安装包

# 或使用Chocolatey
choco install nodejs

# 验证安装
node --version; npm --version
```

**第二步：配置Cursor**
```powershell
# 打开配置目录
explorer %APPDATA%\Cursor\User\

# 编辑settings.json文件
# 如果文件不存在，创建它
```

**第三步：添加MCP配置**
创建或编辑 `%APPDATA%\Cursor\User\settings.json`：
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "您的完整Cookie字符串",
        "NODE_ENV": "cli"
      }
    }
  }
}
```

#### 🐧 Linux 配置指南

**第一步：安装依赖**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL/Fedora
sudo dnf install nodejs npm  # Fedora
sudo yum install nodejs npm  # CentOS/RHEL

# Arch Linux
sudo pacman -S nodejs npm

# 验证安装
node --version && npm --version
```

**第二步：配置Cursor**
```bash
# 创建配置目录
mkdir -p ~/.config/Cursor/User

# 编辑配置文件
nano ~/.config/Cursor/User/settings.json
# 或使用您喜欢的编辑器
```

**第三步：添加MCP配置**
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "您的完整Cookie字符串",
        "NODE_ENV": "cli"
      }
    }
  }
}
```

### 🧪 配置验证

**完成配置后，使用以下步骤验证**：

1. **测试MCP服务器可执行性**：
```bash
# 在任意目录运行
npx -y yapi-mcp-pro --help
```

2. **检查Cursor配置**：
   - 重启Cursor
   - 打开任意项目
   - 在聊天中输入："请获取我的YApi用户信息"

3. **验证连接状态**：
   - 成功：返回用户信息
   - 失败：检查错误信息并参考 [故障排除](#-故障排除) 章节

### 📊 配置成功指标

✅ **成功配置的标志**：
- `npx -y yapi-mcp-pro --help` 能正常显示帮助信息
- Cursor重启后在MCP连接状态中显示 `yapi-mcp-pro`
- AI助手能正常响应YApi相关请求
- 能成功获取用户信息和项目列表

---

## 📋 目录

- [⚡ 5分钟快速开始](#-5分钟快速开始) - **推荐先看这里**
- [✨ 核心特性](#-核心特性)
- [🎯 支持的AI编辑器](#-支持的ai编辑器)
- [🔧 详细配置指南](#-详细配置指南)
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

## 🔧 详细配置指南

### 1. 环境要求

- **Node.js**: >= 16.0.0
- **npm/pnpm**: 最新版本
- **YApi服务器**: 可访问的YApi实例

### 2. 安装部署

#### 方式一：npm安装（推荐）

```bash
# 全局安装
npm install -g yapi-mcp

# 或使用pnpm
pnpm add -g yapi-mcp
```

#### 方式二：源码安装

```bash
# 克隆项目
git clone https://github.com/your-username/yapi-mcp.git
cd yapi-mcp

# 安装依赖
npm install
# 或使用 pnpm (推荐)
pnpm install

# 构建项目
npm run build
```

### 3. 快速配置

#### 📁 配置文件说明

项目的所有敏感信息都集中在 `.env` 文件中，这个文件**不会**被提交到Git，确保您的隐私安全。

```bash
# 1. 复制配置模板
cp .env.example .env

# 2. 编辑配置文件（选择您喜欢的编辑器）
vim .env
# 或者
nano .env
# 或者
code .env
```

💡 **提示**: `.env.example` 文件包含了**超详细的配置指南**，包括：
- 🍪 Cookie认证的分步骤获取方法（推荐）
- 🔑 Token认证的完整操作流程
- 📋 真实格式的配置示例
- ✅ 配置验证和测试方法

**强烈建议先阅读 `.env.example` 文件中的详细说明！**

#### 🔐 必填配置项

打开 `.env` 文件，您需要填写以下**必填项**：

```env
# === 必填项 ===
YAPI_BASE_URL=http://your-yapi-server.com    # 替换为您的YApi服务器地址
YAPI_TOKEN=your_auth_token                   # 替换为您的认证信息（见下方获取方法）

# === 可选项（有默认值）===
PORT=3388                                    # MCP服务端口，默认3388
YAPI_CACHE_TTL=10                           # 缓存时间（分钟），默认10分钟
YAPI_LOG_LEVEL=info                         # 日志级别，默认info
```

#### 🎯 获取认证信息的两种方式

##### 方式一：Cookie认证（推荐）⭐
**优势**: 自动发现所有有权限的项目，配置简单

**步骤**:
1. 打开浏览器，登录您的YApi系统
2. 按 `F12` 打开开发者工具
3. 切换到 `Network`（网络）面板
4. 在YApi页面中随便点击一个功能（如刷新页面）
5. 在网络请求中找到任意一个请求，点击查看详情
6. 找到 `Request Headers` 中的 `Cookie` 字段
7. 复制整个Cookie值

```env
# Cookie认证示例（复制您自己的Cookie）
YAPI_TOKEN=_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; _yapi_uid=1234; other_cookies=values
```

##### 方式二：Token认证
**优势**: 长期有效，更安全

**步骤**:
1. 登录YApi，进入您要管理的项目
2. 点击项目 `设置` → `Token配置`
3. 复制项目Token和项目ID
4. 按格式配置多个项目（如有需要）

```env
# Token认证示例
# 格式：项目ID:项目Token,项目ID:项目Token
YAPI_TOKEN=PROJECT_ID_1:your_project_token_1,PROJECT_ID_2:your_project_token_2

# 单个项目示例
YAPI_TOKEN=PROJECT_ID:your_project_token
```

#### 📋 完整配置示例

```env
# ================================
# YAPI MCP PRO 配置文件
# ================================
# ⚠️ 重要：此文件包含敏感信息，不要提交到Git仓库！

# === 基础配置（必填）===
YAPI_BASE_URL=http://yapi.yourcompany.com
YAPI_TOKEN=_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; _yapi_uid=1234

# === 服务配置（可选）===
PORT=3388
YAPI_CACHE_TTL=10
YAPI_LOG_LEVEL=info

# === 高级配置（可选）===
# YAPI_GROUP_ID=YOUR_GROUP_ID      # 默认分组ID（创建项目时使用）
# YAPI_ENABLE_CACHE=true          # 是否启用缓存，默认true
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
YAPI_TOKEN=_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; _yapi_uid=YOUR_USER_ID
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
YAPI_TOKEN=PROJECT_ID:YOUR_PROJECT_TOKEN,ANOTHER_PROJECT_ID:ANOTHER_TOKEN
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
YAPI_GROUP_ID=YOUR_GROUP_ID                  # 默认分组ID（创建项目时使用）
```

### 🔗 AI编辑器MCP配置

YAPI MCP PRO 支持多种MCP连接方式，满足不同使用场景的需求。

#### 🎯 Cursor配置

##### 配置文件位置
- **项目级配置**（推荐）: `.cursor/mcp.json`
- **全局配置**: 
  - macOS: `~/Library/Application Support/Cursor/User/settings.json`
  - Windows: `%APPDATA%\Cursor\User\settings.json`
  - Linux: `~/.config/Cursor/User/settings.json`

##### 🚀 方式一：NPM包模式（推荐）⭐

**优势**: 
- ✅ 自动下载最新版本，无需本地构建
- ✅ 配置简单，开箱即用
- ✅ 支持多项目，配置灵活
- ✅ 自动依赖管理

**项目级配置** `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; _yapi_uid=YOUR_USER_ID",
        "NODE_ENV": "cli",
        "YAPI_LOG_LEVEL": "info",
        "YAPI_CACHE_TTL": "10"
      }
    }
  }
}
```

**全局配置** `settings.json`:
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "your_cookie_or_token_here",
        "NODE_ENV": "cli"
      }
    }
  }
}
```

##### 🔧 方式二：本地服务器模式（HTTP/SSE）

**优势**:
- ✅ 性能更好，减少启动时间
- ✅ 支持实时数据推送
- ✅ 便于调试和开发
- ✅ 支持多客户端共享

**步骤**:
1. 启动本地MCP服务器
```bash
# 启动服务
./start-mcp.sh start

# 检查状态
./start-mcp.sh status
```

2. 配置Cursor连接
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "url": "http://localhost:3388/sse"
    }
  }
}
```

##### 🛠️ 方式三：本地构建模式

**适用场景**: 需要自定义修改源码

```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "node",
      "args": ["/path/to/yapi-mcp/dist/index.js"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "your_token"
      }
    }
  }
}
```

#### 🖥️ Claude Desktop配置

编辑 `claude_desktop_config.json`:

##### NPM包模式（推荐）
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "your_cookie_or_token",
        "NODE_ENV": "cli"
      }
    }
  }
}
```

##### 本地构建模式
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "node",
      "args": ["/path/to/yapi-mcp/dist/index.js"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "your_token"
      }
    }
  }
}
```

#### 🔄 其他MCP客户端

任何支持MCP协议的工具都可以连接，只需按照对应工具的MCP配置格式进行配置。

#### 📊 配置方式对比

| 配置方式 | 优势 | 缺点 | 适用场景 |
|----------|------|------|----------|
| **NPM包模式** | 🟢 配置简单<br/>🟢 自动更新<br/>🟢 无需构建 | 🔴 首次启动稍慢 | 🎯 **推荐**，适合大多数用户 |
| **HTTP/SSE模式** | 🟢 性能最佳<br/>🟢 支持实时推送<br/>🟢 多客户端共享 | 🔴 需要启动服务<br/>🔴 占用端口 | 🎯 重度使用，多项目协作 |
| **本地构建模式** | 🟢 完全控制<br/>🟢 可自定义修改 | 🔴 需要构建<br/>🔴 维护成本高 | 🎯 开发者，需要定制功能 |

#### ⚙️ 环境变量配置详解

| 环境变量 | 说明 | 默认值 | 示例 |
|----------|------|--------|------|
| `YAPI_BASE_URL` | YApi服务器地址 | 无 | `http://yapi.example.com` |
| `YAPI_TOKEN` | 认证Token或Cookie | 无 | `_yapi_token=xxx; _yapi_uid=123` |
| `NODE_ENV` | 运行环境 | `production` | `cli`, `development` |
| `YAPI_LOG_LEVEL` | 日志级别 | `info` | `debug`, `warn`, `error` |
| `YAPI_CACHE_TTL` | 缓存时效（分钟） | `10` | `30` |
| `YAPI_ENABLE_CACHE` | 是否启用缓存 | `true` | `false` |

#### 🔧 配置验证

配置完成后，在AI编辑器中测试连接：

```
# 测试连接
请获取我的YApi用户信息

# 测试项目列表
请列出所有YApi项目

# 测试接口搜索
请搜索用户相关的接口
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
请获取项目YOUR_PROJECT_ID中接口ID为123的详细信息

# 创建新接口
请在项目YOUR_PROJECT_ID的"用户管理"分类中创建一个用户注册接口：
- 路径：/api/user/register
- 方法：POST
- 描述：用户注册接口
```

### 🏗️ 项目初始化

```
# 创建新项目
请创建一个名为"电商系统"的项目，基础路径为"/api"

# 为项目创建分类结构
请为项目YOUR_PROJECT_ID创建以下分类：
1. 用户管理
2. 商品管理  
3. 订单管理
4. 支付管理
```

### 📊 批量操作

```
# 批量创建接口
请为用户模块创建以下接口，都放在项目YOUR_PROJECT_ID的用户管理分类中：
1. GET /api/user/profile - 获取用户信息
2. PUT /api/user/profile - 更新用户信息
3. DELETE /api/user/account - 删除账户

# 导入Swagger文档
请将以下Swagger数据导入到项目YOUR_PROJECT_ID的API分类中：
[粘贴Swagger JSON]
```

### 🧪 测试与验证

```
# 创建测试集合
请为项目YOUR_PROJECT_ID创建一个名为"用户模块测试"的测试集合

# 运行接口测试
请测试项目YOUR_PROJECT_ID中接口ID为123的接口，使用测试环境
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
    project_id: "YOUR_PROJECT_ID",
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

### 📦 一键部署（开盒即用）

```bash
# 1. 克隆项目
git clone git@github.com:guocong-bincai/YAPI_MCP_PRO.git
cd YAPI_MCP_PRO

# 2. 安装依赖
pnpm install
# 或者使用 npm
npm install

# 3. 创建配置文件
cp .env.example .env
```

### ⚙️ 配置YApi连接信息

📖 **重要**: 在编辑 `.env` 文件之前，请先查看 `.env.example` 文件，它包含了**完整的配置指南**和获取方法！

编辑 `.env` 文件，填写您的YApi信息：

```bash
# 首先查看详细配置指南
cat .env.example

# 然后使用任意编辑器打开配置文件
code .env        # VS Code
vim .env         # Vim
nano .env        # Nano
```

**最小配置示例**：
```env
# 必填项
YAPI_BASE_URL=http://your-yapi-server.com
YAPI_TOKEN=your_cookie_or_token

# 可选项（推荐保持默认）
PORT=3388
YAPI_CACHE_TTL=10
YAPI_LOG_LEVEL=info
```

### 🔑 获取认证信息（二选一）

#### 方法一：Cookie认证（推荐）
1. 浏览器登录YApi
2. 按 `F12` → `Network` 面板
3. 操作任意功能，点击网络请求
4. 复制 `Request Headers` 中的 `Cookie`
5. 粘贴到 `YAPI_TOKEN=` 后面

#### 方法二：Token认证
1. YApi项目 → 设置 → Token配置
2. 复制项目ID和Token
3. 格式：`YAPI_TOKEN=项目ID:Token`

### 🚀 启动服务

```bash
# 构建项目
pnpm run build

# 启动MCP服务
./start-mcp.sh start

# 检查状态
./start-mcp.sh status
```

### 🔗 配置AI编辑器

#### 🎯 Cursor配置（多种方式）

##### 配置文件位置
- **项目级配置**（推荐）: `.cursor/mcp.json`
- **全局配置**: `~/.cursor/mcp.json`

##### 🚀 方式一：NPM包模式（推荐）⭐

**优势**: 自动下载最新版本，无需本地构建，配置简单

**项目级配置** `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "_yapi_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; _yapi_uid=YOUR_USER_ID",
        "NODE_ENV": "cli",
        "YAPI_LOG_LEVEL": "info",
        "YAPI_CACHE_TTL": "10"
      }
    }
  }
}
```

##### 🔧 方式二：本地服务器模式（HTTP/SSE）

**优势**: 性能更好，支持实时推送，多客户端共享

**步骤**:
1. 启动本地MCP服务器
```bash
./start-mcp.sh start
```

2. 配置Cursor连接
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "url": "http://localhost:3388/sse"
    }
  }
}
```

##### 🛠️ 方式三：本地构建模式

**适用场景**: 需要自定义修改源码

```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "node",
      "args": ["/path/to/YAPI_MCP_PRO/dist/index.js"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "your_token"
      }
    }
  }
}
```

#### 🖥️ Claude Desktop配置

##### NPM包模式（推荐）
编辑 `claude_desktop_config.json`：
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "npx",
      "args": ["-y", "yapi-mcp-pro"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "your_cookie_or_token",
        "NODE_ENV": "cli"
      }
    }
  }
}
```

##### 本地构建模式
```json
{
  "mcpServers": {
    "yapi-mcp-pro": {
      "command": "node",
      "args": ["/path/to/YAPI_MCP_PRO/dist/index.js"],
      "env": {
        "YAPI_BASE_URL": "http://your-yapi-server.com",
        "YAPI_TOKEN": "your_token"
      }
    }
  }
}
```

#### 📊 配置方式对比

| 配置方式 | 优势 | 缺点 | 适用场景 |
|----------|------|------|----------|
| **NPM包模式** | 🟢 配置简单<br/>🟢 自动更新<br/>🟢 无需构建 | 🔴 首次启动稍慢 | 🎯 **推荐**，适合大多数用户 |
| **HTTP/SSE模式** | 🟢 性能最佳<br/>🟢 支持实时推送<br/>🟢 多客户端共享 | 🔴 需要启动服务<br/>🔴 占用端口 | 🎯 重度使用，多项目协作 |
| **本地构建模式** | 🟢 完全控制<br/>🟢 可自定义修改 | 🔴 需要构建<br/>🔴 维护成本高 | 🎯 开发者，需要定制功能 |

### ✅ 验证安装

在AI编辑器中输入以下任意命令测试：

```
请列出所有YApi项目
请搜索用户相关的接口
请帮我创建一个新的接口分类
```

### 🎯 配置检查清单

- [ ] 已克隆项目并安装依赖
- [ ] **已仔细阅读 `.env.example` 文件的详细配置指南** 📋
- [ ] 已创建 `.env` 文件 (`cp .env.example .env`)
- [ ] 已配置 `YAPI_BASE_URL`（YApi服务器地址）
- [ ] 已配置 `YAPI_TOKEN`（Cookie或Token，按 `.env.example` 指南获取）
- [ ] 已构建项目 (`pnpm run build`)
- [ ] 已启动服务 (`./start-mcp.sh start`)
- [ ] 已配置AI编辑器的MCP连接
- [ ] 已测试基本功能

### 🔒 安全提醒

⚠️ **重要安全事项**：

1. **`.env` 文件包含敏感信息**，绝对不要提交到Git仓库
2. **定期更换Token**，尤其是在多人协作的项目中
3. **不要在代码中硬编码**任何Token或密钥
4. **使用完毕后及时停止服务**：`./start-mcp.sh stop`

✅ **项目已配置安全防护**：
- `.gitignore` 已忽略所有敏感文件
- 代码中使用环境变量，无硬编码敏感信息
- 支持Token掩码显示，保护日志安全

### 🆘 常见问题

**Q: 提示"与YApi服务器通信失败"？**
A: 检查 `YAPI_BASE_URL` 是否正确，确保网络能访问YApi服务器

**Q: 提示"请登录"或"未配置token"？**
A: 重新获取Cookie或Token，确保格式正确

**Q: 端口3388被占用？**
A: 修改 `.env` 中的 `PORT=3389`，然后重启服务

**Q: 如何确保我的Token安全？**
A: 
- 使用Cookie认证（自动过期）
- 定期更换Token
- 不要截图或分享包含Token的配置
- 项目配置的.gitignore已保护敏感文件

**🚀 现在你已经拥有了最强大且安全的YApi AI助手！**

| 环境变量 | 说明 | 默认值 | 示例 |
|----------|------|--------|------|
| `YAPI_BASE_URL` | YApi服务器地址 | 无 | `http://yapi.example.com` |
| `YAPI_TOKEN` | 认证Token或Cookie | 无 | Token: `projectId:token` 或 Cookie: `_yapi_token=xxx; _yapi_uid=123` |
| `PORT` | MCP服务器端口 | `3388` | `3000` |
| `YAPI_CACHE_TTL` | 缓存时效（分钟） | `10` | `30` |
| `YAPI_LOG_LEVEL` | 日志级别 | `info` | `debug`, `info`, `warn`, `error` |
| `YAPI_ENABLE_CACHE` | 是否启用缓存 | `true` | `false` 禁用缓存，`true` 启用缓存 |

## ✨ 功能特性

### 🔗 多种MCP连接方式
- **📦 NPM包模式**: 使用 `npx yapi-mcp-pro` 自动下载最新版本（推荐）
- **🌐 HTTP/SSE模式**: 本地服务器模式，支持实时数据推送
- **🛠️ 本地构建模式**: 支持源码自定义修改和调试

### 🔐 灵活的认证机制
- **🍪 Cookie认证**: 自动发现所有有权限的项目，配置简单
- **🔑 Token认证**: 项目级Token认证，长期有效，更安全
- **👥 多项目支持**: 同时管理多个YApi项目

### 📋 完整的接口生命周期管理
- **接口CRUD**: 创建、读取、更新、删除接口
- **🔍 智能搜索**: 多维度搜索接口（名称、路径、项目）
- **📁 分类管理**: 完整的接口分类生命周期管理
- **🧪 测试集合**: 管理和运行接口测试用例

### 🚀 高性能与智能缓存
- **⚡ 智能缓存**: 多层缓存机制，提升响应速度
- **🔄 实时同步**: 与YApi服务器实时同步数据
- **🎯 灵活缓存控制**: 支持强制刷新和完全禁用缓存
- **📊 性能监控**: 详细的操作日志和性能统计

### 🛠️ 开发者友好
- **📄 数据导入导出**: 支持Swagger导入和多格式导出
- **🔧 环境变量配置**: 灵活的配置管理
- **🐛 详细日志**: 完整的操作日志和错误追踪
- **🎨 TypeScript支持**: 完整的类型定义和智能提示

---

## 🎊 总结

### ✅ **YAPI MCP PRO 现在支持多种连接方式**

| 连接方式 | 特点 | 适用场景 |
|----------|------|----------|
| **📦 NPM包模式** | 🚀 开箱即用，自动更新 | 🎯 **推荐给所有用户** |
| **🌐 HTTP/SSE模式** | ⚡ 高性能，实时推送 | 🎯 重度使用，多项目协作 |
| **🛠️ 本地构建模式** | 🔧 完全控制，可定制 | 🎯 开发者，需要自定义功能 |

### 🚀 **快速开始推荐路径**

1. **新用户** → 选择 **NPM包模式**，配置简单，开箱即用
2. **重度用户** → 选择 **HTTP/SSE模式**，性能最佳，支持实时推送  
3. **开发者** → 选择 **本地构建模式**，可以自定义修改源码

### 💡 **配置要点**
- **认证方式**: Cookie认证最简单，Token认证最安全
- **配置级别**: 项目级配置优先，全局配置备用
- **环境变量**: 支持丰富的环境变量配置
- **缓存机制**: 智能缓存提升性能，支持强制刷新

### 🎯 **立即开始**
选择适合您的连接方式，按照对应的配置指南进行设置，几分钟内即可开始使用强大的YApi AI助手！

### 🔗 **相关链接**
- 📦 [NPM包地址](https://www.npmjs.com/package/yapi-mcp-pro)
- 📚 [详细配置指南](CURSOR-MCP-SETUP.md)
- 🐛 [问题反馈](https://github.com/guocong-bincai/YAPI_MCP_PRO/issues)
- 💬 [功能建议](https://github.com/guocong-bincai/YAPI_MCP_PRO/discussions)

---

**🎉 享受您的YApi AI助手之旅！**

