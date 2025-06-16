import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import express, { Request, Response } from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { IncomingMessage, ServerResponse } from "http";
import { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";

import { YApiService } from "./services/yapi/api";
import { ProjectInfoCache } from "./services/yapi/cache";
import { Logger } from "./services/yapi/logger";

export class YapiMcpServer {
  private readonly server: McpServer;
  private readonly yapiService: YApiService;
  private readonly projectInfoCache: ProjectInfoCache;
  private readonly logger: Logger;
  private sseTransport: SSEServerTransport | null = null;
  private readonly isStdioMode: boolean;

  constructor(yapiBaseUrl: string, yapiToken: string, yapiLogLevel: string = "info", yapiCacheTTL: number = 10) {
    this.logger = new Logger("YapiMCP", yapiLogLevel);
    this.yapiService = new YApiService(yapiBaseUrl, yapiToken, yapiLogLevel);
    this.projectInfoCache = new ProjectInfoCache(yapiCacheTTL);
    // 判断是否为stdio模式
    this.isStdioMode = process.env.NODE_ENV === "cli" || process.argv.includes("--stdio");
    
    this.logger.info(`YapiMcpServer初始化，日志级别: ${yapiLogLevel}, 缓存TTL: ${yapiCacheTTL}分钟`);
    
    this.server = new McpServer({
      name: "Yapi MCP Server",
      version: "0.2.1",
    });

    this.registerTools();
    this.initializeCache();
  }

  private async initializeCache(): Promise<void> {
    try {
      // 检查缓存是否过期
      if (this.projectInfoCache.isCacheExpired()) {
        this.logger.info('缓存已过期，将异步更新缓存数据');

        // 异步加载最新的项目信息，不阻塞初始化过程
        this.asyncUpdateCache().catch(error => {
          this.logger.error('异步更新缓存失败:', error);
        });
      } else {
        // 从缓存加载数据
        const cachedProjectInfo = this.projectInfoCache.loadFromCache();

        // 如果缓存中有数据，直接使用
        if (cachedProjectInfo.size > 0) {
          // 将缓存数据设置到服务中
          cachedProjectInfo.forEach((info, id) => {
            this.yapiService.getProjectInfoCache().set(id, info);
          });

          this.logger.info(`已从缓存加载 ${cachedProjectInfo.size} 个项目信息`);
        } else {
          // 缓存为空，异步更新
          this.logger.info('缓存为空，将异步更新缓存数据');
          this.asyncUpdateCache().catch(error => {
            this.logger.error('异步更新缓存失败:', error);
          });
        }
      }
    } catch (error) {
      this.logger.error('加载或检查缓存时出错:', error);

      // 出错时也尝试异步更新缓存
      this.asyncUpdateCache().catch(err => {
        this.logger.error('异步更新缓存失败:', err);
      });
    }
  }

  /**
   * 异步更新缓存数据
   * 该方法会在后台加载最新的项目信息和分类列表，并更新缓存
   */
  private async asyncUpdateCache(): Promise<void> {
    try {
      this.logger.debug('开始异步更新缓存数据');

      // 加载最新的项目信息
      await this.yapiService.loadAllProjectInfo();
      this.logger.debug(`已加载 ${this.yapiService.getProjectInfoCache().size} 个项目信息`);

      // 更新缓存
      this.projectInfoCache.saveToCache(this.yapiService.getProjectInfoCache());

      // 加载所有项目的分类列表
      await this.yapiService.loadAllCategoryLists();
      this.logger.debug('已加载所有项目的分类列表');

      this.logger.info('缓存数据已成功更新');
    } catch (error) {
      this.logger.error('更新缓存数据失败:', error);
      throw error;
    }
  }

  private registerTools(): void {
    // 获取API接口详情
    this.server.tool(
      "yapi_get_api_desc",
      "获取YApi中特定接口的详细信息",
      {
        projectId: z.string().describe("YApi项目ID；如连接/project/28/interface/api/66，则ID为28"),
        apiId: z.string().describe("YApi接口的ID；如连接/project/1/interface/api/66，则ID为66")
      },
      async ({ projectId, apiId }) => {
        try {
          this.logger.info(`获取API接口: ${apiId}, 项目ID: ${projectId}`);
          const apiInterface = await this.yapiService.getApiInterface(projectId, apiId);
          this.logger.info(`成功获取API接口: ${apiInterface.title || apiId}`);

          // 格式化返回数据，使其更易于阅读
          const formattedResponse = {
            基本信息: {
              接口ID: apiInterface._id,
              接口名称: apiInterface.title,
              接口路径: apiInterface.path,
              请求方式: apiInterface.method,
              接口描述: apiInterface.desc
            },
            请求参数: {
              URL参数: apiInterface.req_params,
              查询参数: apiInterface.req_query,
              请求头: apiInterface.req_headers,
              请求体类型: apiInterface.req_body_type,
              表单参数: apiInterface.req_body_form,
              Json参数: apiInterface.req_body_other
            },
            响应信息: {
              响应类型: apiInterface.res_body_type,
              响应内容: apiInterface.res_body
            },
            其他信息: {
              接口文档: apiInterface.markdown
            }
          };

          return {
            content: [{ type: "text", text: JSON.stringify(formattedResponse, null, 2) }],
          };
        } catch (error) {
          this.logger.error(`获取API接口 ${apiId} 时出错:`, error);
          return {
            content: [{ type: "text", text: `获取API接口出错: ${error}` }],
          };
        }
      }
    );

    // 保存API接口
    this.server.tool(
      "yapi_save_api",
      "新增或更新YApi中的接口信息",
      {
        projectId: z.string().describe("YApi项目ID"),
        catid: z.string().describe("接口分类ID，新增接口时必填"),
        id: z.string().optional().describe("接口ID，更新时必填，新增时不需要"),
        title: z.string().describe("接口标题"),
        path: z.string().describe("接口路径，如：/api/user"),
        method: z.string().describe("请求方法，如：GET, POST, PUT, DELETE等"),
        status: z.string().optional().describe("接口状态，done代表完成，undone代表未完成"),
        tag: z.string().optional().describe("接口标签列表"),
        req_params: z.string().optional().describe("路径参数，JSON格式数组，如：[{\"name\":\"id\",\"desc\":\"用户ID\"}]"),
        req_query: z.string().optional().describe("查询参数，JSON格式数组，如：[{\"name\":\"page\",\"desc\":\"页码\",\"required\":\"1\"}]"),
        req_headers: z.string().optional().describe("请求头参数，JSON格式数组，如：[{\"name\":\"Content-Type\",\"value\":\"application/json\"}]"),
        req_body_type: z.string().optional().describe("请求体类型，如：form, json, file, raw"),
        req_body_form: z.string().optional().describe("表单请求体，JSON格式数组"),
        req_body_other: z.string().optional().describe("其他请求体（通常是JSON格式）"),
        req_body_is_json_schema: z.boolean().optional().describe("是否开启JSON Schema，默认false"),
        res_body_type: z.string().optional().describe("返回数据类型，如：json, raw"),
        res_body: z.string().optional().describe("返回数据，如果res_body_is_json_schema为true则用json schema格式"),
        res_body_is_json_schema: z.boolean().optional().describe("返回数据是否为JSON Schema，默认false"),
        switch_notice: z.boolean().optional().describe("开启接口运行通知，默认true"),
        api_opened: z.boolean().optional().describe("开启API文档页面，默认true"),
        desc: z.string().optional().describe("接口描述"),
        markdown: z.string().optional().describe("markdown格式的接口描述")
      },
      async ({
        projectId,
        catid,
        id,
        title,
        path,
        method,
        status,
        tag,
        req_params,
        req_query,
        req_headers,
        req_body_type,
        req_body_form,
        req_body_other,
        req_body_is_json_schema,
        res_body_type,
        res_body,
        res_body_is_json_schema,
        switch_notice,
        api_opened,
        desc,
        markdown
      }) => {
        try {
          // 准备接口参数
          const params = {
            project_id: projectId,
            catid,
            title,
            path,
            method,
            status: status || 'undone',
            tag: tag ? JSON.parse(tag) : [],
            desc: desc || "",
            markdown: markdown || ""
          } as any;

          // 有ID则是更新，否则是新增
          if (id) {
            params.id = id;
          }

          // 处理可选参数，将字符串JSON转为对象
          if (req_params) {
            try {
              params.req_params = JSON.parse(req_params);
            } catch (e) {
              return {
                content: [{ type: "text", text: `路径参数JSON解析错误: ${e}` }],
              };
            }
          }

          if (req_query) {
            try {
              params.req_query = JSON.parse(req_query);
            } catch (e) {
              return {
                content: [{ type: "text", text: `查询参数JSON解析错误: ${e}` }],
              };
            }
          }

          if (req_headers) {
            try {
              params.req_headers = JSON.parse(req_headers);
            } catch (e) {
              return {
                content: [{ type: "text", text: `请求头参数JSON解析错误: ${e}` }],
              };
            }
          }

          if (req_body_type) {
            params.req_body_type = req_body_type;
          }

          if (req_body_form) {
            try {
              params.req_body_form = JSON.parse(req_body_form);
            } catch (e) {
              return {
                content: [{ type: "text", text: `表单请求体JSON解析错误: ${e}` }],
              };
            }
          }

          if (req_body_other) {
            params.req_body_other = req_body_other;
          }

          if (req_body_is_json_schema !== undefined) {
            params.req_body_is_json_schema = req_body_is_json_schema;
          }

          if (res_body_type) {
            params.res_body_type = res_body_type;
          }

          if (res_body) {
            params.res_body = res_body;
          }

          if (res_body_is_json_schema !== undefined) {
            params.res_body_is_json_schema = res_body_is_json_schema;
          }

          if (switch_notice !== undefined) {
            params.switch_notice = switch_notice;
          }

          if (api_opened !== undefined) {
            params.api_opened = api_opened;
          }

          // 调用API保存接口
          const response = await this.yapiService.saveInterface(params);

          // 返回保存结果
          const resultApiId = response.data._id;
          return {
            content: [{ 
              type: "text", 
              text: `接口${id ? '更新' : '新增'}成功！\n接口ID: ${resultApiId}\n接口名称: ${title}\n请求方法: ${method}\n接口路径: ${path}` 
            }],
          };
        } catch (error) {
          this.logger.error(`保存API接口时出错:`, error);
          return {
            content: [{ type: "text", text: `保存API接口出错: ${error}` }],
          };
        }
      }
    );

    // 搜索API接口
    this.server.tool(
      "yapi_search_apis",
      "搜索YApi中的接口",
      {
        projectKeyword: z.string().optional().describe("项目关键字，用于过滤项目"),
        nameKeyword: z.string().optional().describe("接口名称关键字"),
        pathKeyword: z.string().optional().describe("接口路径关键字"),
        limit: z.number().optional().describe("返回结果数量限制，默认20")
      },
      async ({ projectKeyword, nameKeyword, pathKeyword, limit }) => {
        try {
          const searchOptions = {
            projectKeyword,
            nameKeyword: nameKeyword ? nameKeyword.split(/[\s,]+/) : undefined,
            pathKeyword: pathKeyword ? pathKeyword.split(/[\s,]+/) : undefined,
            limit: limit || 20
          };

          this.logger.info(`搜索API接口: ${JSON.stringify(searchOptions)}`);
          const searchResults = await this.yapiService.searchApis(searchOptions);

          // 按项目分组整理结果
          const apisByProject: Record<string, {
            projectName: string,
            apis: Array<{
              id: string,
              title: string,
              path: string,
              method: string,
              catName: string,
              createTime: string,
              updateTime: string
            }>
          }> = {};

          // 格式化搜索结果
          searchResults.list.forEach(api => {
            const projectId = String(api.project_id);
            const projectName = api.project_name || `未知项目(${projectId})`;

            if (!apisByProject[projectId]) {
              apisByProject[projectId] = {
                projectName,
                apis: []
              };
            }

            apisByProject[projectId].apis.push({
              id: api._id,
              title: api.title,
              path: api.path,
              method: api.method,
              catName: api.cat_name || '未知分类',
              createTime: new Date(api.add_time).toLocaleString(),
              updateTime: new Date(api.up_time).toLocaleString()
            });
          });

          // 构建响应内容
          let responseContent = `共找到 ${searchResults.total} 个符合条件的接口（已限制显示 ${searchResults.list.length} 个）\n\n`;

          // 添加搜索条件说明
          responseContent += "搜索条件:\n";
          if (projectKeyword) responseContent += `- 项目关键字: ${projectKeyword}\n`;
          if (nameKeyword) responseContent += `- 接口名称关键字: ${nameKeyword}\n`;
          if (pathKeyword) responseContent += `- API路径关键字: ${pathKeyword}\n\n`;

          // 按项目分组展示结果
          Object.values(apisByProject).forEach(projectGroup => {
            responseContent += `## 项目: ${projectGroup.projectName} (${projectGroup.apis.length}个接口)\n\n`;

            if (projectGroup.apis.length <= 10) {
              // 少量接口，展示详细信息
              projectGroup.apis.forEach(api => {
                responseContent += `### ${api.title} (${api.method} ${api.path})\n\n`;
                responseContent += `- 接口ID: ${api.id}\n`;
                responseContent += `- 所属分类: ${api.catName}\n`;
                responseContent += `- 更新时间: ${api.updateTime}\n\n`;
              });
            } else {
              // 大量接口，展示简洁表格
              responseContent += "| 接口ID | 接口名称 | 请求方式 | 接口路径 | 所属分类 |\n";
              responseContent += "| ------ | -------- | -------- | -------- | -------- |\n";

              projectGroup.apis.forEach(api => {
                responseContent += `| ${api.id} | ${api.title} | ${api.method} | ${api.path} | ${api.catName} |\n`;
              });

              responseContent += "\n";
            }
          });

          // 添加使用提示
          responseContent += "\n提示: 可以使用 `get_api_desc` 工具获取接口的详细信息，例如: `get_api_desc projectId=228 apiId=8570`";

          return {
            content: [{ type: "text", text: responseContent }],
          };
        } catch (error) {
          this.logger.error(`搜索接口时出错:`, error);
          let errorMsg = "搜索接口时发生错误";

          if (error instanceof Error) {
            errorMsg += `: ${error.message}`;
          } else if (typeof error === 'object' && error !== null) {
            errorMsg += `: ${JSON.stringify(error)}`;
          }

          return {
            content: [{ type: "text", text: errorMsg }],
          };
        }
      }
    );

    // 列出项目
    this.server.tool(
      "yapi_list_projects",
      "列出YApi的项目ID(projectId)和项目名称",
      {},
      async () => {
        try {
          // 获取项目信息缓存
          const projectInfoCache = this.yapiService.getProjectInfoCache();

          if (projectInfoCache.size === 0) {
            return {
              content: [{ type: "text", text: "没有找到任何项目信息，请检查配置的token是否正确" }],
            };
          }

          // 构建项目信息列表
          const projectsList = Array.from(projectInfoCache.entries()).map(([id, info]) => ({
            项目ID: id,
            项目名称: info.name,
            项目描述: info.desc || '无描述',
            基础路径: info.basepath || '/',
            项目分组ID: info.group_id
          }));

          return {
            content: [{
              type: "text",
              text: `已配置 ${projectInfoCache.size} 个YApi项目:\n\n${JSON.stringify(projectsList, null, 2)}`
            }],
          };
        } catch (error) {
          this.logger.error(`获取项目信息列表时出错:`, error);
          return {
            content: [{ type: "text", text: `获取项目信息列表出错: ${error}` }],
          };
        }
      }
    );

    // 获取分类
    this.server.tool(
      "yapi_get_categories",
      "获取YApi项目下的接口分类列表，以及每个分类下的接口信息",
      {
        projectId: z.string().describe("YApi项目ID")
      },
      async ({ projectId }) => {
        try {
          // 获取项目信息
          const projectInfo = this.yapiService.getProjectInfoCache().get(projectId);
          if (!projectInfo) {
            return {
              content: [{ type: "text", text: `未找到项目ID为 ${projectId} 的项目信息，请确认项目ID正确` }],
            };
          }

          // 获取项目下的分类列表
          const categoryList = this.yapiService.getCategoryListCache().get(projectId);

          if (!categoryList || categoryList.length === 0) {
            return {
              content: [{ type: "text", text: `项目 "${projectInfo.name}" (ID: ${projectId}) 下没有找到任何接口分类` }],
            };
          }

          // 构建包含接口列表的分类信息
          const categoriesWithApisPromises = categoryList.map(async (cat) => {
            // 获取分类下的接口列表
            try {
              const apis = await this.yapiService.getCategoryApis(projectId, cat._id);

              // 将接口信息简化为所需字段
              const simplifiedApis = apis?.map(api => ({
                接口ID: api._id,
                接口名称: api.title,
                接口路径: api.path,
                请求方法: api.method
              })) || [];

              return {
                分类ID: cat._id,
                分类名称: cat.name,
                分类描述: cat.desc || '无描述',
                创建时间: new Date(cat.add_time).toLocaleString(),
                更新时间: new Date(cat.up_time).toLocaleString(),
                接口列表: simplifiedApis
              };
            } catch (error) {
              this.logger.error(`获取分类 ${cat._id} 下的接口列表失败:`, error);
              // 发生错误时仍然返回分类信息，但不包含接口列表
              return {
                分类ID: cat._id,
                分类名称: cat.name,
                分类描述: cat.desc || '无描述',
                创建时间: new Date(cat.add_time).toLocaleString(),
                更新时间: new Date(cat.up_time).toLocaleString(),
                接口列表: [],
                错误: `获取接口列表失败: ${error}`
              };
            }
          });

          // 等待所有分类的接口列表加载完成
          const categoriesWithApis = await Promise.all(categoriesWithApisPromises);

          return {
            content: [{
              type: "text",
              text: `项目 "${projectInfo.name}" (ID: ${projectId}) 下共有 ${categoryList.length} 个接口分类:\n\n${JSON.stringify(categoriesWithApis, null, 2)}`
            }],
          };
        } catch (error) {
          this.logger.error(`获取接口分类列表时出错:`, error);
          return {
            content: [{ type: "text", text: `获取接口分类列表出错: ${error}` }],
          };
        }
      }
    );

    // ==================== 用户管理相关工具 ====================

    // 获取当前用户信息
    this.server.tool(
      "yapi_get_user_info",
      "获取当前登录用户的信息",
      {},
      async () => {
        try {
          const userInfo = await this.yapiService.getCurrentUserInfo();
          
          const formattedUserInfo = {
            用户ID: userInfo._id,
            用户名: userInfo.username,
            邮箱: userInfo.email,
            角色: userInfo.role,
            类型: userInfo.type,
            创建时间: new Date(userInfo.add_time).toLocaleString(),
            更新时间: new Date(userInfo.up_time).toLocaleString()
          };

          return {
            content: [{
              type: "text",
              text: `当前用户信息:\n\n${JSON.stringify(formattedUserInfo, null, 2)}`
            }],
          };
        } catch (error) {
          this.logger.error('获取用户信息失败:', error);
          return {
            content: [{ type: "text", text: `获取用户信息失败: ${error}` }],
          };
        }
      }
    );

    // 获取用户分组列表
    this.server.tool(
      "yapi_get_user_groups",
      "获取当前用户所属的分组列表",
      {},
      async () => {
        try {
          const groups = await this.yapiService.getUserGroups();
          
          const formattedGroups = groups.map(group => ({
            分组ID: group._id,
            分组名称: group.group_name,
            分组描述: group.group_desc,
            成员数量: group.members?.length || 0,
            创建时间: new Date(group.add_time).toLocaleString(),
            更新时间: new Date(group.up_time).toLocaleString()
          }));

          return {
            content: [{
              type: "text",
              text: `用户分组列表 (共${groups.length}个分组):\n\n${JSON.stringify(formattedGroups, null, 2)}`
            }],
          };
        } catch (error) {
          this.logger.error('获取用户分组列表失败:', error);
          return {
            content: [{ type: "text", text: `获取用户分组列表失败: ${error}` }],
          };
        }
      }
    );

    // ==================== 项目管理相关工具 ====================

    // 创建项目
    this.server.tool(
      "yapi_create_project",
      "创建新的YApi项目",
      {
        name: z.string().describe("项目名称"),
        basepath: z.string().describe("项目基础路径，如：/api"),
        group_id: z.number().describe("所属分组ID"),
        desc: z.string().optional().describe("项目描述"),
        project_type: z.string().optional().describe("项目类型"),
        color: z.string().optional().describe("项目颜色"),
        icon: z.string().optional().describe("项目图标")
      },
      async ({ name, basepath, group_id, desc, project_type, color, icon }) => {
        try {
          const params = {
            name,
            basepath,
            group_id,
            desc: desc || "",
            project_type: project_type || "private",
            color: color || "#f56a00",
            icon: icon || "code"
          };

          const result = await this.yapiService.createProject(params);
          
          return {
            content: [{
              type: "text",
              text: `项目创建成功！\n项目ID: ${result._id}\n项目名称: ${name}\n基础路径: ${basepath}\n所属分组: ${group_id}`
            }],
          };
        } catch (error) {
          this.logger.error('创建项目失败:', error);
          return {
            content: [{ type: "text", text: `创建项目失败: ${error}` }],
          };
        }
      }
    );

    // 更新项目
    this.server.tool(
      "yapi_update_project",
      "更新YApi项目信息",
      {
        id: z.number().describe("项目ID"),
        name: z.string().optional().describe("项目名称"),
        basepath: z.string().optional().describe("项目基础路径"),
        desc: z.string().optional().describe("项目描述"),
        color: z.string().optional().describe("项目颜色"),
        icon: z.string().optional().describe("项目图标")
      },
      async ({ id, name, basepath, desc, color, icon }) => {
        try {
          const params: any = { id };
          if (name) params.name = name;
          if (basepath) params.basepath = basepath;
          if (desc) params.desc = desc;
          if (color) params.color = color;
          if (icon) params.icon = icon;

          await this.yapiService.updateProject(params);
          
          return {
            content: [{
              type: "text",
              text: `项目更新成功！\n项目ID: ${id}\n已更新的字段: ${Object.keys(params).filter(k => k !== 'id').join(', ')}`
            }],
          };
        } catch (error) {
          this.logger.error('更新项目失败:', error);
          return {
            content: [{ type: "text", text: `更新项目失败: ${error}` }],
          };
        }
      }
    );

    // 注意：YApi开放API不支持获取项目成员功能，已移除该工具

    // 注意：YApi开放API不支持获取项目日志功能，已移除该工具

    // ==================== 分类管理相关工具 ====================

    // 创建分类
    this.server.tool(
      "yapi_create_category",
      "在YApi项目中创建新的接口分类",
      {
        name: z.string().describe("分类名称"),
        project_id: z.number().describe("项目ID"),
        desc: z.string().optional().describe("分类描述")
      },
      async ({ name, project_id, desc }) => {
        try {
          const params = {
            name,
            project_id,
            desc: desc || ""
          };

          const result = await this.yapiService.createCategory(params);
          
          return {
            content: [{
              type: "text",
              text: `分类创建成功！\n分类ID: ${result._id}\n分类名称: ${name}\n所属项目: ${project_id}`
            }],
          };
        } catch (error) {
          this.logger.error('创建分类失败:', error);
          return {
            content: [{ type: "text", text: `创建分类失败: ${error}` }],
          };
        }
      }
    );

    // 更新分类
    this.server.tool(
      "yapi_update_category",
      "更新YApi接口分类信息",
      {
        catId: z.string().describe("分类ID"),
        name: z.string().describe("分类名称"),
        desc: z.string().optional().describe("分类描述")
      },
      async ({ catId, name, desc }) => {
        try {
          await this.yapiService.updateCategory(catId, name, desc);
          
          return {
            content: [{
              type: "text",
              text: `分类更新成功！\n分类ID: ${catId}\n分类名称: ${name}`
            }],
          };
        } catch (error) {
          this.logger.error(`更新分类失败, catId=${catId}:`, error);
          return {
            content: [{ type: "text", text: `更新分类失败: ${error}` }],
          };
        }
      }
    );

    // 删除分类
    this.server.tool(
      "yapi_delete_category",
      "删除YApi接口分类",
      {
        catId: z.string().describe("分类ID")
      },
      async ({ catId }) => {
        try {
          await this.yapiService.deleteCategory(catId);
          
          return {
            content: [{
              type: "text",
              text: `分类删除成功！分类ID: ${catId}`
            }],
          };
        } catch (error) {
          this.logger.error(`删除分类失败, catId=${catId}:`, error);
          return {
            content: [{ type: "text", text: `删除分类失败: ${error}` }],
          };
        }
      }
    );

    // ==================== 接口管理扩展工具 ====================

    // 删除接口
    this.server.tool(
      "yapi_delete_interface",
      "删除YApi接口",
      {
        interfaceId: z.string().describe("接口ID"),
        projectId: z.string().describe("项目ID")
      },
      async ({ interfaceId, projectId }) => {
        try {
          await this.yapiService.deleteInterface(interfaceId, projectId);
          
          return {
            content: [{
              type: "text",
              text: `接口删除成功！接口ID: ${interfaceId}`
            }],
          };
        } catch (error) {
          this.logger.error(`删除接口失败, interfaceId=${interfaceId}:`, error);
          return {
            content: [{ type: "text", text: `删除接口失败: ${error}` }],
          };
        }
      }
    );

    // 复制接口
    this.server.tool(
      "yapi_copy_interface",
      "复制YApi接口到指定分类",
      {
        interfaceId: z.string().describe("要复制的接口ID"),
        projectId: z.string().describe("项目ID"),
        catId: z.string().optional().describe("目标分类ID，不指定则复制到原分类")
      },
      async ({ interfaceId, projectId, catId }) => {
        try {
          const result = await this.yapiService.copyInterface(interfaceId, projectId, catId);
          
          return {
            content: [{
              type: "text",
              text: `接口复制成功！\n原接口ID: ${interfaceId}\n新接口ID: ${result._id}\n目标分类: ${catId || '原分类'}`
            }],
          };
        } catch (error) {
          this.logger.error(`复制接口失败, interfaceId=${interfaceId}:`, error);
          return {
            content: [{ type: "text", text: `复制接口失败: ${error}` }],
          };
        }
      }
    );

    // ==================== 测试集合相关工具 ====================

    // 获取测试集合列表
    this.server.tool(
      "yapi_get_test_collections",
      "获取YApi项目的测试集合列表",
      {
        projectId: z.string().describe("项目ID")
      },
      async ({ projectId }) => {
        try {
          const collections = await this.yapiService.getTestCollections(projectId);
          
          const formattedCollections = collections.map(col => ({
            集合ID: col._id,
            集合名称: col.name,
            集合描述: col.desc,
            创建时间: new Date(col.add_time).toLocaleString(),
            更新时间: new Date(col.up_time).toLocaleString()
          }));

          return {
            content: [{
              type: "text",
              text: `项目 ${projectId} 测试集合列表 (共${collections.length}个):\n\n${JSON.stringify(formattedCollections, null, 2)}`
            }],
          };
        } catch (error) {
          this.logger.error(`获取测试集合列表失败, projectId=${projectId}:`, error);
          return {
            content: [{ type: "text", text: `获取测试集合列表失败: ${error}` }],
          };
        }
      }
    );

    // 创建测试集合
    this.server.tool(
      "yapi_create_test_collection",
      "创建YApi测试集合",
      {
        name: z.string().describe("测试集合名称"),
        project_id: z.number().describe("项目ID"),
        desc: z.string().optional().describe("测试集合描述")
      },
      async ({ name, project_id, desc }) => {
        try {
          const params = {
            name,
            project_id,
            desc: desc || ""
          };

          const result = await this.yapiService.createTestCollection(params);
          
          return {
            content: [{
              type: "text",
              text: `测试集合创建成功！\n集合ID: ${result._id}\n集合名称: ${name}\n所属项目: ${project_id}`
            }],
          };
        } catch (error) {
          this.logger.error('创建测试集合失败:', error);
          return {
            content: [{ type: "text", text: `创建测试集合失败: ${error}` }],
          };
        }
      }
    );

    // ==================== 数据导入导出工具 ====================

    // 导入Swagger数据
    this.server.tool(
      "yapi_import_swagger",
      "导入Swagger数据到YApi项目",
      {
        projectId: z.string().describe("项目ID"),
        catId: z.string().describe("目标分类ID"),
        swaggerData: z.string().describe("Swagger JSON数据"),
        merge: z.string().optional().describe("合并模式：normal(普通), good(智能合并), merge(完全覆盖)")
      },
      async ({ projectId, catId, swaggerData, merge }) => {
        try {
          let parsedData;
          try {
            parsedData = JSON.parse(swaggerData);
          } catch (e) {
            return {
              content: [{ type: "text", text: `Swagger数据JSON格式错误: ${e}` }],
            };
          }

          const result = await this.yapiService.importSwagger(projectId, catId, parsedData, merge);
          
          return {
            content: [{
              type: "text",
              text: `Swagger数据导入成功！\n项目ID: ${projectId}\n分类ID: ${catId}\n导入接口数量: ${result.count || '未知'}`
            }],
          };
        } catch (error) {
          this.logger.error(`导入Swagger数据失败, projectId=${projectId}:`, error);
          return {
            content: [{ type: "text", text: `导入Swagger数据失败: ${error}` }],
          };
        }
      }
    );

    // 导出项目数据
    this.server.tool(
      "yapi_export_project",
      "导出YApi项目数据",
      {
        projectId: z.string().describe("项目ID"),
        type: z.string().optional().describe("导出格式：json, markdown, swagger")
      },
      async ({ projectId, type }) => {
        try {
          const result = await this.yapiService.exportProject(projectId, type || 'json');
          
          return {
            content: [{
              type: "text",
              text: `项目数据导出成功！\n项目ID: ${projectId}\n导出格式: ${type || 'json'}\n\n导出数据:\n${JSON.stringify(result, null, 2)}`
            }],
          };
        } catch (error) {
          this.logger.error(`导出项目数据失败, projectId=${projectId}:`, error);
          return {
            content: [{ type: "text", text: `导出项目数据失败: ${error}` }],
          };
        }
      }
    );
  }

  async connect(transport: Transport): Promise<void> {
    this.logger.info("连接到传输层...");
    await this.server.connect(transport);
    this.logger.info("服务器已连接，准备处理请求");
  }

  async startHttpServer(port: number): Promise<void> {
    const app = express();

    app.get("/sse", async (req: Request, res: Response) => {
      this.logger.info("建立新的SSE连接");
      this.sseTransport = new SSEServerTransport(
        "/messages",
        res as unknown as ServerResponse<IncomingMessage>,
      );
      await this.server.connect(this.sseTransport);
    });

    app.post("/messages", async (req: Request, res: Response) => {
      if (!this.sseTransport) {
        // Express types 可能与实际使用不匹配，直接使用
        // @ts-ignore
        res.sendStatus(400);
        return;
      }
      await this.sseTransport.handlePostMessage(
        req as unknown as IncomingMessage,
        res as unknown as ServerResponse<IncomingMessage>,
      );
    });

    app.listen(port, () => {
      this.logger.info(`HTTP服务器监听端口 ${port}`);
      this.logger.info(`SSE端点: http://localhost:${port}/sse`);
      this.logger.info(`消息端点: http://localhost:${port}/messages`);
    });
  }
}
