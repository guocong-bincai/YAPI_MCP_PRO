import { config } from "dotenv";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

// Load environment variables from .env file
config();

export interface ServerConfig {
  yapiBaseUrl: string;
  yapiToken: string;
  port: number;
  yapiCacheTTL: number; // 缓存时效，单位为分钟
  yapiLogLevel: string; // 日志级别：debug, info, warn, error
  yapiEnableCache: boolean; // 新增：是否启用缓存
  configSources: {
    yapiBaseUrl: "cli" | "env" | "default";
    yapiToken: "cli" | "env" | "default";
    port: "cli" | "env" | "default";
    yapiCacheTTL: "cli" | "env" | "default";
    yapiLogLevel: "cli" | "env" | "default";
    yapiEnableCache: "cli" | "env" | "default"; // 新增
  };
}

function maskApiKey(key: string): string {
  if (key.length <= 4) return "****";
  return `****${key.slice(-4)}`;
}

interface CliArgs {
  "yapi-base-url"?: string;
  "yapi-token"?: string;
  port?: number;
  "yapi-cache-ttl"?: number;
  "yapi-log-level"?: string;
  "yapi-enable-cache"?: boolean;
}

export function getServerConfig(): ServerConfig {
  // Parse command line arguments
  const argv = yargs(hideBin(process.argv))
    .options({
      "yapi-base-url": {
        type: "string",
        description: "YApi服务器基础URL",
      },
      "yapi-token": {
        type: "string",
        description: "YApi服务器授权Token",
      },
      port: {
        type: "number",
        description: "Port to run the server on",
      },
      "yapi-cache-ttl": {
        type: "number",
        description: "YApi缓存有效期（分钟），默认10分钟",
      },
      "yapi-log-level": {
        type: "string",
        description: "YApi日志级别 (debug, info, warn, error)",
        choices: ["debug", "info", "warn", "error"],
      },
      "yapi-enable-cache": {
        type: "boolean",
        description: "是否启用YApi缓存",
      },
    })
    .help()
    .parseSync() as CliArgs;

  const config: ServerConfig = {
    yapiBaseUrl: "http://localhost:3000",
    yapiToken: "",
    port: 3333,
    yapiCacheTTL: 10, // 默认缓存10分钟
    yapiLogLevel: "info", // 默认日志级别
    yapiEnableCache: true, // 默认启用缓存
    configSources: {
      yapiBaseUrl: "default",
      yapiToken: "default",
      port: "default",
      yapiCacheTTL: "default",
      yapiLogLevel: "default",
      yapiEnableCache: "default", // 新增
    },
  };


  // Handle YAPI_BASE_URL
  if (argv["yapi-base-url"]) {
    config.yapiBaseUrl = argv["yapi-base-url"];
    config.configSources.yapiBaseUrl = "cli";
  } else if (process.env.YAPI_BASE_URL) {
    config.yapiBaseUrl = process.env.YAPI_BASE_URL;
    config.configSources.yapiBaseUrl = "env";
  }

  // Handle YAPI_TOKEN
  if (argv["yapi-token"]) {
    config.yapiToken = argv["yapi-token"];
    config.configSources.yapiToken = "cli";
  } else if (process.env.YAPI_TOKEN) {
    config.yapiToken = process.env.YAPI_TOKEN;
    config.configSources.yapiToken = "env";
  }

  // Handle PORT
  if (argv.port) {
    config.port = argv.port;
    config.configSources.port = "cli";
  } else if (process.env.PORT) {
    config.port = parseInt(process.env.PORT, 10);
    config.configSources.port = "env";
  }

  // Handle YAPI_CACHE_TTL
  if (argv["yapi-cache-ttl"]) {
    config.yapiCacheTTL = argv["yapi-cache-ttl"];
    config.configSources.yapiCacheTTL = "cli";
  } else if (process.env.YAPI_CACHE_TTL) {
    const cacheTTL = parseInt(process.env.YAPI_CACHE_TTL, 10);
    if (!isNaN(cacheTTL)) {
      config.yapiCacheTTL = cacheTTL;
      config.configSources.yapiCacheTTL = "env";
    }
  }

  // Handle YAPI_LOG_LEVEL
  if (argv["yapi-log-level"]) {
    config.yapiLogLevel = argv["yapi-log-level"];
    config.configSources.yapiLogLevel = "cli";
  } else if (process.env.YAPI_LOG_LEVEL) {
    const validLevels = ["debug", "info", "warn", "error"];
    const logLevel = process.env.YAPI_LOG_LEVEL.toLowerCase();
    if (validLevels.includes(logLevel)) {
      config.yapiLogLevel = logLevel;
      config.configSources.yapiLogLevel = "env";
    }
  }

  // Handle YAPI_ENABLE_CACHE
  if (argv["yapi-enable-cache"] !== undefined) {
    config.yapiEnableCache = argv["yapi-enable-cache"];
    config.configSources.yapiEnableCache = "cli";
  } else if (process.env.YAPI_ENABLE_CACHE !== undefined) {
    const enableCache = process.env.YAPI_ENABLE_CACHE.toLowerCase();
    if (enableCache === "false" || enableCache === "0") {
      config.yapiEnableCache = false;
      config.configSources.yapiEnableCache = "env";
    } else if (enableCache === "true" || enableCache === "1") {
      config.yapiEnableCache = true;
      config.configSources.yapiEnableCache = "env";
    }
  }

  // Log configuration sources
  console.log("\nConfiguration:");
  console.log(
    `- YAPI_BASE_URL: ${config.yapiBaseUrl} (source: ${config.configSources.yapiBaseUrl})`,
  );
  console.log(
    `- YAPI_TOKEN: ${config.yapiToken ? maskApiKey(config.yapiToken) : "未配置"} (source: ${config.configSources.yapiToken})`,
  );
  console.log(`- PORT: ${config.port} (source: ${config.configSources.port})`);
  console.log(`- YAPI_CACHE_TTL: ${config.yapiCacheTTL} 分钟 (source: ${config.configSources.yapiCacheTTL})`);
  console.log(`- YAPI_LOG_LEVEL: ${config.yapiLogLevel} (source: ${config.configSources.yapiLogLevel})`);
  console.log(`- YAPI_ENABLE_CACHE: ${config.yapiEnableCache} (source: ${config.configSources.yapiEnableCache})`);
  console.log(); // Empty line for better readability

  return config;
}
