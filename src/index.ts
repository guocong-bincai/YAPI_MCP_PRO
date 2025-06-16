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
  
  // 创建 YapiMcpServer 实例，使用配置中的所有参数
  const server = new YapiMcpServer(
    config.yapiBaseUrl, 
    config.yapiToken, 
    config.yapiLogLevel, 
    config.yapiCacheTTL
  );

  // Check if we're running in stdio mode (e.g., via CLI)
  const isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");

  if (isStdioMode) {
    console.log("Initializing Yapi MCP Server in stdio mode...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
  } else {
    console.log(`Initializing Yapi MCP Server in HTTP mode on port ${config.port}...`);
    await server.startHttpServer(config.port);
  }

  console.log("\n可用工具:");
  console.log("=== 基础接口管理 ===");
  console.log("- yapi_get_api_desc: 获取YApi接口详细信息");
  console.log("- yapi_save_api: 新增或更新YApi接口");
  console.log("- yapi_search_apis: 搜索YApi接口");
  console.log("- yapi_delete_interface: 删除YApi接口");
  console.log("- yapi_copy_interface: 复制YApi接口");
  
  console.log("\n=== 项目管理 ===");
  console.log("- yapi_list_projects: 列出YApi的项目ID和项目名称");
  console.log("- yapi_create_project: 创建新的YApi项目");
  console.log("- yapi_update_project: 更新YApi项目信息");
  // 注意：YApi开放API不支持项目成员和日志功能，已移除相关工具
  
  console.log("\n=== 分类管理 ===");
  console.log("- yapi_get_categories: 获取YApi项目下的接口分类列表");
  console.log("- yapi_create_category: 创建新的接口分类");
  console.log("- yapi_update_category: 更新接口分类信息");
  console.log("- yapi_delete_category: 删除接口分类");
  
  console.log("\n=== 用户管理 ===");
  console.log("- yapi_get_user_info: 获取当前登录用户信息");
  console.log("- yapi_get_user_groups: 获取用户所属分组列表");
  
  console.log("\n=== 测试集合 ===");
  console.log("- yapi_get_test_collections: 获取项目测试集合列表");
  console.log("- yapi_create_test_collection: 创建测试集合");
  
  console.log("\n=== 数据导入导出 ===");
  console.log("- yapi_import_swagger: 导入Swagger数据");
  console.log("- yapi_export_project: 导出项目数据");
}

// If this file is being run directly, start the server
if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
