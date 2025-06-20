import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { YapiMcpServer } from "./server";
import { getServerConfig } from "./config";

// 导出 YApi 服务相关类型和工具
export * from "./services/yapi/types";
export * from "./services/yapi/api";
export * from "./services/yapi/cache";
export * from "./services/yapi/logger";

export async function startServer(): Promise<void> {
  const config = getServerConfig();
  
  // Check if we're running in stdio mode (e.g., via CLI or Smithery)
  const isStdioMode = process.env.NODE_ENV === "cli" || 
                      process.argv.includes("--stdio") ||
                      process.env.NODE_ENV === "production";

  // Check if running in Smithery environment (no logging to stdout)
  const isSmitheryMode = process.env.SMITHERY_MODE === "true" || 
                         process.env.NODE_ENV === "production";

  // 创建 YapiMcpServer 实例，使用配置中的所有参数
  // 在 Smithery 模式下启用延迟初始化
  const server = new YapiMcpServer(
    config.yapiBaseUrl, 
    config.yapiToken, 
    config.yapiLogLevel, 
    config.yapiCacheTTL,
    config.yapiEnableCache,
    isSmitheryMode // 延迟初始化标志
  );

  if (isStdioMode) {
    // Smithery模式下不输出日志到stdout
    if (!isSmitheryMode) {
      console.error("Initializing Yapi MCP Server in stdio mode...");
    }
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    console.error(`Initializing Yapi MCP Server in HTTP mode on port ${config.port}...`);
    await server.startHttpServer(config.port);
  }

  // 只在非Smithery模式下显示工具列表
  if (!isSmitheryMode) {
    console.error("\n可用工具:");
    console.error("=== 基础接口管理 ===");
    console.error("- yapi_get_api_desc: 获取YApi接口详细信息");
    console.error("- yapi_save_api: 新增或更新YApi接口");
    console.error("- yapi_search_apis: 搜索YApi接口");
    console.error("- yapi_delete_interface: 删除YApi接口");
    console.error("- yapi_copy_interface: 复制YApi接口");
    
    console.error("\n=== 项目管理 ===");
    console.error("- yapi_list_projects: 列出YApi的项目ID和项目名称");
    console.error("- yapi_create_project: 创建新的YApi项目");
    console.error("- yapi_update_project: 更新YApi项目信息");
    // 注意：YApi开放API不支持项目成员和日志功能，已移除相关工具
    
    console.error("\n=== 分类管理 ===");
    console.error("- yapi_get_categories: 获取YApi项目下的接口分类列表");
    console.error("- yapi_create_category: 创建新的接口分类");
    console.error("- yapi_update_category: 更新接口分类信息");
    console.error("- yapi_delete_category: 删除接口分类");
    
    console.error("\n=== 用户管理 ===");
    console.error("- yapi_get_user_info: 获取当前登录用户信息");
    console.error("- yapi_get_user_groups: 获取用户所属分组列表");
    
    console.error("\n=== 测试集合 ===");
    console.error("- yapi_get_test_collections: 获取项目测试集合列表");
    console.error("- yapi_create_test_collection: 创建测试集合");
    
    console.error("\n=== 数据导入导出 ===");
    console.error("- yapi_import_swagger: 导入Swagger数据");
    console.error("- yapi_export_project: 导出项目数据");
  }
}

// If this file is being run directly, start the server
if (require.main === module) {
  startServer().catch((error) => {
    // 使用 stderr 输出错误，避免污染 stdout
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
