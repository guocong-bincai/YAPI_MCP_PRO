# 🚀 Yapi MCP 快速参考

## 📋 服务器管理
```bash
./start-mcp.sh start    # 启动服务器
./start-mcp.sh status   # 检查状态  
./start-mcp.sh stop     # 停止服务器
./start-mcp.sh restart  # 重启服务器
./start-mcp.sh logs     # 查看日志
```

## 🎯 常用 AI 命令

### 📊 项目管理
```
请列出所有可用的YApi项目
请获取项目654的接口分类列表
请获取项目654的成员列表
请获取项目654的操作日志
请创建新项目：名称"测试项目"，基础路径"/api"，分组ID 1557
请更新项目654的描述为"这是一个测试项目"
```

### 👤 用户管理
```
请获取当前用户信息
请获取我所属的分组列表
```

### 📁 分类管理
```
请在项目654中创建分类"用户管理"
请更新分类4514的名称为"用户模块"
请删除分类4515
```

### 🔍 接口管理
```
请搜索包含"登录"的接口
请搜索路径包含"/api/user"的接口
请获取接口ID为123的详细信息
请删除接口ID为456
请复制接口123到分类4514
```

### ✏️ 创建接口
```
请在YApi中创建接口：
- 项目ID：654
- 分类ID：4514
- 名称：用户登录
- 方法：POST
- 路径：/api/user/login
- 描述：用户登录接口
```

### 🔄 更新接口
```
请更新接口ID为123的信息：
- 修改描述：新的接口描述
- 添加参数：token（字符串，访问令牌）
```

### 🧪 测试集合
```
请获取项目654的测试集合列表
请创建测试集合"用户模块测试"，项目ID 654
```

### 📥📤 数据导入导出
```
请导入以下Swagger数据到项目654的分类4514：
[Swagger JSON数据]

请导出项目654的数据为JSON格式
请导出项目654的数据为Swagger格式
```

## 🎨 实用模板

### 基于代码生成
```
分析以下代码并在YApi中创建接口文档：

[粘贴您的代码]

请创建到项目654的相应分类中。
```

### 批量创建
```
为用户模块创建以下接口，都放在项目654中：
1. GET /api/user/profile - 获取用户信息
2. PUT /api/user/profile - 更新用户信息
3. DELETE /api/user/account - 删除账户
```

### 项目初始化
```
请为新项目"电商系统"创建完整的分类结构：
1. 用户管理
2. 商品管理
3. 订单管理
4. 支付管理
```

## 📋 完整工具列表

### 🔧 基础接口管理
- `yapi_get_api_desc` - 获取接口详细信息
- `yapi_save_api` - 新增或更新接口
- `yapi_search_apis` - 搜索接口
- `yapi_delete_interface` - 删除接口
- `yapi_copy_interface` - 复制接口

### 📊 项目管理
- `yapi_list_projects` - 列出项目
- `yapi_create_project` - 创建项目
- `yapi_update_project` - 更新项目
<!-- 注意：YApi开放API不支持项目成员和日志功能，已移除相关工具 -->

### 📁 分类管理
- `yapi_get_categories` - 获取分类列表
- `yapi_create_category` - 创建分类
- `yapi_update_category` - 更新分类
- `yapi_delete_category` - 删除分类

### 👤 用户管理
- `yapi_get_user_info` - 获取用户信息
- `yapi_get_user_groups` - 获取用户分组

### 🧪 测试集合
- `yapi_get_test_collections` - 获取测试集合
- `yapi_create_test_collection` - 创建测试集合

### 📥📤 数据导入导出
- `yapi_import_swagger` - 导入Swagger数据
- `yapi_export_project` - 导出项目数据

## ⚠️ 重要提示
- 明确指定项目ID和分类ID
- Cookie 可能过期，需重新获取
- 大量操作时注意频率限制

## 🔧 故障处理
- 黄灯：重启 Cursor
- 连接失败：检查服务器状态
- 权限错误：检查 Cookie 有效性

---
📍 **配置文件位置**: `~/Library/Application Support/Cursor/User/settings.json`
🌐 **SSE端点**: `http://localhost:3388/sse` 