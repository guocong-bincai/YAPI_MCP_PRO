import axios, { AxiosError } from "axios";
import { Logger } from "./logger";
import type {
  ApiInterface,
  GetApiResponse,
  ProjectInfo,
  CategoryInfo,
  ApiSearchResultItem,
  ApiSearchResponse,
  GetProjectResponse,
  GetCategoryListResponse,
  SaveApiInterfaceParams,
  SaveApiResponse,
  UserInfo,
  GroupInfo,
  ProjectMember,
  ProjectEnv,
  ProjectLog,
  CreateProjectParams,
  UpdateProjectParams,
  GetProjectEnvsResponse,
  CreateCategoryParams,
  GetMockExpectationsResponse,
  CreateMockExpectationParams,
  GetTestCollectionsResponse,
  CreateTestCollectionParams,
  GetTestCasesResponse,
  TestCase,
  TestCollection,
  MockExpectation,
  GetUserInfoResponse,
  GetGroupListResponse,
  GetInterfaceRunHistoryResponse,
  InterfaceRunHistory,
  RunInterfaceParams,
  CreateTestCaseParams
} from "./types";

export class YApiService {
  private readonly baseUrl: string;
  private readonly tokenMap: Map<string, string>;
  private readonly defaultToken: string;
  private readonly cookie: string; // 新增：Cookie 支持
  private projectInfoCache: Map<string, ProjectInfo> = new Map(); // 缓存项目信息
  private categoryListCache: Map<string, CategoryInfo[]> = new Map(); // 缓存项目分类列表
  private readonly logger: Logger;
  private readonly enableCache: boolean; // 新增：是否启用缓存

  constructor(baseUrl: string, token: string, logLevel: string = "info", enableCache: boolean = true) {
    this.baseUrl = baseUrl;
    this.tokenMap = new Map();
    this.defaultToken = "";
    this.cookie = ""; // 初始化 cookie
    this.logger = new Logger('YApiService', logLevel);
    this.enableCache = enableCache; // 设置是否启用缓存
    
    // 解析token字符串，格式为: "projectId:token,projectId:token,..." 或 Cookie 格式
    if (token) {
      // 检查是否是 Cookie 格式 (包含 _yapi_token)
      if (token.includes('_yapi_token')) {
        this.cookie = token;
        this.logger.info('使用 Cookie 认证模式');
      } else {
        // 原有的 token 格式解析
        const tokenPairs = token.split(',');
        for (const pair of tokenPairs) {
          const [projectId, projectToken] = pair.trim().split(':');
          if (projectId && projectToken) {
            this.tokenMap.set(projectId, projectToken);
          } else if (!projectId.includes(':')) {
            // 如果没有冒号，则作为默认token
            this.defaultToken = pair.trim();
          }
        }
        this.logger.info('使用 Token 参数认证模式');
      }
    }
    
    this.logger.info(`YApiService已初始化，baseUrl=${baseUrl}, enableCache=${enableCache}`);
  }

  /**
   * 获取已配置的项目ID列表
   * 对于Cookie认证，返回空数组，让系统通过其他方式发现项目
   */
  getConfiguredProjectIds(): string[] {
    if (this.cookie) {
      // Cookie 认证模式下，返回空数组，项目将通过动态发现
      return [];
    }
    return Array.from(this.tokenMap.keys());
  }

  /**
   * 检查是否使用Cookie认证
   */
  isCookieAuth(): boolean {
    return !!this.cookie;
  }

  /**
   * 获取用户信息（仅Cookie认证模式）
   */
  async getUserInfo(): Promise<any> {
    if (!this.cookie) {
      throw new Error('仅Cookie认证模式支持获取用户信息');
    }
    
    try {
      const response = await this.request<any>("/api/user/status");
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取用户信息失败");
      }
      return response.data;
    } catch (error) {
      this.logger.error('获取用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户的项目列表（仅Cookie认证模式）
   */
  async getUserProjects(): Promise<Array<{ _id: number; name: string }>> {
    if (!this.cookie) {
      throw new Error('仅Cookie认证模式支持获取用户项目列表');
    }
    
    try {
      // 首先获取用户信息
      const userResponse = await this.request<any>("/api/user/status");
      if (userResponse.errcode !== 0) {
        throw new Error(userResponse.errmsg || "获取用户信息失败");
      }
      
      this.logger.info(`当前用户ID: ${userResponse.data.uid}, 用户名: ${userResponse.data.username}`);
      
      // 方法1：尝试获取用户的组列表
      try {
        const groupListResponse = await this.request<any>("/api/group/list");
        if (groupListResponse.errcode === 0 && groupListResponse.data && Array.isArray(groupListResponse.data)) {
          const projects: Array<{ _id: number; name: string }> = [];
          
          for (const group of groupListResponse.data) {
            this.logger.info(`发现组: ${group.group_name} (ID: ${group._id})`);
            
            // 获取该组下的项目列表
            try {
              const projectListResponse = await this.request<any>("/api/project/list", { group_id: group._id });
              if (projectListResponse.errcode === 0 && projectListResponse.data && projectListResponse.data.list) {
                for (const project of projectListResponse.data.list) {
                  projects.push({
                    _id: project._id,
                    name: project.name
                  });
                  this.logger.info(`发现项目: ${project.name} (ID: ${project._id})`);
                }
              }
            } catch (error) {
              this.logger.debug(`获取组 ${group._id} 的项目列表失败:`, error);
            }
          }
          
          if (projects.length > 0) {
            return projects;
          }
        }
      } catch (error) {
        this.logger.debug('方法1失败，尝试方法2');
      }
      
      // 方法2：尝试使用配置的或固定的group_id
      const configuredGroupId = process.env.YAPI_GROUP_ID;
      const knownGroupIds = configuredGroupId ? [parseInt(configuredGroupId)] : [1557]; // 从用户的网络请求中看到的
      const projects: Array<{ _id: number; name: string }> = [];
      
      for (const groupId of knownGroupIds) {
        try {
          this.logger.info(`尝试获取组 ${groupId} 的项目列表`);
          const projectListResponse = await this.request<any>("/api/project/list", { group_id: groupId });
          if (projectListResponse.errcode === 0 && projectListResponse.data && projectListResponse.data.list) {
            for (const project of projectListResponse.data.list) {
              projects.push({
                _id: project._id,
                name: project.name
              });
              this.logger.info(`发现项目: ${project.name} (ID: ${project._id})`);
            }
          }
        } catch (error) {
          this.logger.debug(`获取组 ${groupId} 的项目列表失败:`, error);
        }
      }
      
      return projects;
    } catch (error) {
      this.logger.error('获取用户项目列表失败:', error);
      // 不抛出错误，返回空数组，让系统继续运行
      return [];
    }
  }

  /**
   * 获取项目信息缓存
   */
  getProjectInfoCache(): Map<string, ProjectInfo> {
    return this.projectInfoCache;
  }

  /**
   * 获取项目分类列表缓存
   */
  getCategoryListCache(): Map<string, CategoryInfo[]> {
    return this.categoryListCache;
  }

  /**
   * 清除项目信息缓存
   * @param projectId 项目ID，如果不指定则清除所有缓存
   */
  clearProjectInfoCache(projectId?: string): void {
    if (projectId) {
      this.projectInfoCache.delete(projectId);
      this.logger.debug(`已清除项目 ${projectId} 的项目信息缓存`);
    } else {
      this.projectInfoCache.clear();
      this.logger.debug('已清除所有项目信息缓存');
    }
  }

  /**
   * 清除分类列表缓存
   * @param projectId 项目ID，如果不指定则清除所有缓存
   */
  clearCategoryListCache(projectId?: string): void {
    if (projectId) {
      this.categoryListCache.delete(projectId);
      this.logger.debug(`已清除项目 ${projectId} 的分类列表缓存`);
    } else {
      this.categoryListCache.clear();
      this.logger.debug('已清除所有分类列表缓存');
    }
  }

  /**
   * 清除所有缓存
   */
  clearAllCache(): void {
    this.clearProjectInfoCache();
    this.clearCategoryListCache();
    this.logger.info('已清除所有缓存');
  }

  /**
   * 根据项目ID获取对应的token
   */
  private getToken(projectId: string): string {
    return this.tokenMap.get(projectId) || this.defaultToken;
  }

  private async request<T>(endpoint: string, params: Record<string, any> = {}, projectId?: string, method: 'GET' | 'POST' = 'GET'): Promise<T> {
    try {
      this.logger.debug(`调用 ${this.baseUrl}${endpoint} 方法: ${method}`);
      
      let response;
      
      // 准备请求配置
      const config: any = {};
      
      // 如果使用 Cookie 认证
      if (this.cookie) {
        config.headers = {
          'Cookie': this.cookie
        };
        this.logger.debug('使用 Cookie 认证');
      } else {
        // 使用项目ID获取对应的token，如果没有提供项目ID则使用默认token
        const token = projectId ? this.getToken(projectId) : this.defaultToken;
        
        if (!token) {
          throw new Error(`未配置项目ID ${projectId} 的token`);
        }
        
        this.logger.debug('使用 Token 参数认证');
      }
      
      if (method === 'GET') {
        if (this.cookie) {
          // Cookie 认证时，参数直接作为查询参数
          response = await axios.get(`${this.baseUrl}${endpoint}`, {
            params: params,
            ...config
          });
        } else {
          // Token 认证时，将 token 添加到查询参数
          const token = projectId ? this.getToken(projectId) : this.defaultToken;
          response = await axios.get(`${this.baseUrl}${endpoint}`, {
            params: {
              ...params,
              token: token
            },
            ...config
          });
        }
      } else {
        if (this.cookie) {
          // Cookie 认证时，参数直接作为请求体
          response = await axios.post(`${this.baseUrl}${endpoint}`, params, config);
        } else {
          // Token 认证时，将 token 添加到请求体
          const token = projectId ? this.getToken(projectId) : this.defaultToken;
          response = await axios.post(`${this.baseUrl}${endpoint}`, {
            ...params,
            token: token
          }, config);
        }
      }

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.errmsg || "未知错误",
        };
      }
      throw new Error("与YApi服务器通信失败");
    }
  }

  /**
   * 获取分类列表
   * @param projectId 项目ID
   * @param forceRefresh 是否强制刷新，跳过缓存
   */
  async getCategoryList(projectId: string, forceRefresh: boolean = false): Promise<CategoryInfo[]> {
    try {
      // 如果启用缓存且不强制刷新，先检查缓存
      if (this.enableCache && !forceRefresh && this.categoryListCache.has(projectId)) {
        this.logger.debug(`从缓存获取项目 ${projectId} 的分类列表`);
        return this.categoryListCache.get(projectId)!;
      }
      
      // 从API获取最新数据
      this.logger.debug(`从API获取项目分类列表，projectId=${projectId}${forceRefresh ? ' (强制刷新)' : ''}`);
      const response = await this.request<GetCategoryListResponse>("/api/interface/getCatMenu", { project_id: projectId }, projectId);
      
      this.logger.debug(`获取分类列表API响应，projectId=${projectId}, errcode=${response.errcode}, errmsg=${response.errmsg || 'none'}`);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取分类列表失败");
      }
      
      // 检查返回的数据
      if (!response.data || !Array.isArray(response.data)) {
        this.logger.warn(`项目 ${projectId} 的分类列表数据格式异常:`, response.data);
        // 如果数据格式异常，设置为空数组
        response.data = [];
      }
      
      // 如果启用缓存，则更新缓存
      if (this.enableCache) {
        this.categoryListCache.set(projectId, response.data);
        this.logger.debug(`项目 ${projectId} 分类列表已缓存，共 ${response.data.length} 个分类`);
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`获取项目分类列表失败, projectId=${projectId}:`, error);
      throw error;
    }
  }

  /**
   * 加载所有项目的分类列表
   */
  async loadAllCategoryLists(): Promise<void> {
    // 获取已缓存的项目ID列表
    const projectIds = Array.from(this.projectInfoCache.keys());
    
    if (projectIds.length === 0) {
      this.logger.info('项目信息未加载，无法加载分类列表');
      return;
    }
    
    this.logger.info(`开始加载 ${projectIds.length} 个项目的分类列表...`);
    
    // 修改为逐个加载，避免一个失败影响全部
    let successCount = 0;
    let failedProjects: string[] = [];
    
    for (const projectId of projectIds) {
      try {
        await this.getCategoryList(projectId);
        successCount++;
        this.logger.debug(`项目 ${projectId} 分类列表加载成功`);
      } catch (error) {
        failedProjects.push(projectId);
        this.logger.warn(`项目 ${projectId} 分类列表加载失败:`, error);
      }
    }
    
    this.logger.info(`分类列表加载完成: 成功 ${successCount} 个项目${failedProjects.length > 0 ? `，失败 ${failedProjects.length} 个项目 [${failedProjects.join(', ')}]` : ''}`);
  }

  /**
   * 获取项目信息
   * @param projectId 项目ID
   * @param forceRefresh 是否强制刷新，跳过缓存
   */
  async getProjectInfo(projectId: string, forceRefresh: boolean = false): Promise<ProjectInfo> {
    try {
      // 如果启用缓存且不强制刷新，先检查缓存
      if (this.enableCache && !forceRefresh && this.projectInfoCache.has(projectId)) {
        this.logger.debug(`从缓存获取项目 ${projectId} 的项目信息`);
        return this.projectInfoCache.get(projectId)!;
      }
      
      // 从API获取最新数据
      this.logger.debug(`从API获取项目信息，projectId=${projectId}${forceRefresh ? ' (强制刷新)' : ''}`);
      const response = await this.request<GetProjectResponse>("/api/project/get", { id: projectId }, projectId);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取项目信息失败");
      }
      
      // 如果启用缓存，则更新缓存
      if (this.enableCache) {
        this.projectInfoCache.set(projectId, response.data);
        this.logger.debug(`项目 ${projectId} 信息已缓存`);
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`获取项目信息失败, projectId=${projectId}:`, error);
      throw error;
    }
  }

  /**
   * 加载所有已配置项目的信息
   */
  async loadAllProjectInfo(): Promise<void> {
    if (this.cookie) {
      // Cookie 认证模式：动态获取用户项目列表
      try {
        this.logger.info('Cookie认证模式：正在获取用户项目列表...');
        const projects = await this.getUserProjects();
        
        if (projects.length === 0) {
          this.logger.info('未能自动发现项目，Cookie认证模式将支持手动指定项目ID的操作');
          return;
        }
        
        this.logger.info(`发现 ${projects.length} 个项目，开始加载项目信息...`);
        
        // 并行加载所有项目的信息
        await Promise.all(projects.map(project => 
          this.getProjectInfo(String(project._id))
        ));
        
        this.logger.info(`已加载 ${this.projectInfoCache.size} 个项目的信息`);
      } catch (error) {
        this.logger.error('Cookie认证模式下加载项目信息失败:', error);
      }
    } else {
      // Token 认证模式：使用配置的项目ID
      const projectIds = this.getConfiguredProjectIds();
      
      if (projectIds.length === 0) {
        this.logger.info('未配置项目ID，无法加载项目信息');
        return;
      }
      
      this.logger.info(`开始加载 ${projectIds.length} 个项目的信息...`);
      
      try {
        // 并行加载所有项目的信息
        await Promise.all(projectIds.map(id => this.getProjectInfo(id)));
        this.logger.info(`已加载 ${this.projectInfoCache.size} 个项目的信息`);
      } catch (error) {
        this.logger.error('加载项目信息失败:', error);
      }
    }
  }

  /**
   * 获取接口详情
   * @param projectId 项目ID
   * @param id 接口ID
   */
  async getApiInterface(projectId: string, id: string): Promise<ApiInterface> {
    try {
      this.logger.debug(`获取接口详情，projectId=${projectId}, apiId=${id}`);
      const response = await this.request<GetApiResponse>("/api/interface/get", { id }, projectId);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取接口详情失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`获取接口详情失败, projectId=${projectId}, apiId=${id}:`, error);
      throw error;
    }
  }

  /**
   * 新增或更新接口
   * @param params 接口参数
   */
  async saveInterface(params: SaveApiInterfaceParams): Promise<SaveApiResponse> {
    try {
      const projectId = params.project_id;
      const isAdd = !params.id;
      
      this.logger.debug(`${isAdd ? '新增' : '更新'}接口, projectId=${projectId}, title=${params.title}`);
      
      // 选择合适的API端点
      const endpoint = isAdd ? "/api/interface/add" : "/api/interface/up";
      
      const response = await this.request<SaveApiResponse>(
        endpoint,
        params,
        projectId,
        'POST'
      );
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || `${isAdd ? '新增' : '更新'}接口失败`);
      }
      
      return response;
    } catch (error) {
      this.logger.error(`${params.id ? '更新' : '新增'}接口失败:`, error);
      throw error;
    }
  }

  /**
   * 搜索接口
   */
  async searchApis(options: {
    projectKeyword?: string; // 项目关键字
    nameKeyword?: string[] | string;    // 接口名称关键字，支持数组或字符串
    pathKeyword?: string[] | string;    // 接口路径关键字，支持数组或字符串
    page?: number;           // 当前页码，默认1
    limit?: number;          // 每页数量，默认20
    maxProjects?: number;    // 最多搜索多少个项目，默认5个
  }): Promise<{
    total: number;
    list: Array<ApiSearchResultItem & { project_name?: string; cat_name?: string }>;
  }> {
    // 提取查询参数
    const {
      projectKeyword,
      nameKeyword,
      pathKeyword,
      page = 1,
      limit = 20,
      maxProjects = 5
    } = options;
    
    // 转换查询关键字为数组
    const nameKeywords = Array.isArray(nameKeyword) ? nameKeyword : nameKeyword ? [nameKeyword] : [];
    const pathKeywords = Array.isArray(pathKeyword) ? pathKeyword : pathKeyword ? [pathKeyword] : [];
    
    this.logger.debug(
      `搜索接口 项目关键字: ${projectKeyword || '无'}, ` +
      `接口名称关键字: ${nameKeywords.join(',')} ` +
      `路径关键字: ${pathKeywords.join(',')}`
    );
    
    try {
      // 1. 获取所有项目信息（或根据关键字过滤）
      await this.loadAllProjectInfo();
      let projects = Array.from(this.projectInfoCache.values());
      
      // 如果指定了项目关键字，过滤项目列表
      if (projectKeyword && projectKeyword.trim().length > 0) {
        const keyword = projectKeyword.trim().toLowerCase();
        projects = projects.filter(project => 
          project.name.toLowerCase().includes(keyword) || 
          project.desc.toLowerCase().includes(keyword) ||
          String(project._id).includes(keyword)
        );
      }
      
      // 限制只搜索前几个匹配的项目
      if (projects.length > maxProjects) {
        this.logger.info(`符合条件的项目过多，只搜索前 ${maxProjects} 个项目`);
        projects = projects.slice(0, maxProjects);
      }
      
      // 如果没有符合条件的项目，返回空结果
      if (projects.length === 0) {
        this.logger.info('没有找到符合条件的项目');
        return { total: 0, list: [] };
      }
      
      this.logger.info(`在 ${projects.length} 个项目中搜索接口...`);
      
      // 2. 在每个项目中搜索接口
      let allResults: ApiSearchResultItem[] = [];
      for (const project of projects) {
        const projectId = String(project._id);
        
        for (const nameKey of nameKeywords.length ? nameKeywords : [""]) {
          for (const pathKey of pathKeywords.length ? pathKeywords : [""]) {
            // 准备查询参数
            const queryParams: Record<string, string> = {};
            if (nameKey) queryParams.keyword = nameKey;
            if (pathKey) queryParams.path = pathKey;
            
            // 执行搜索
            const projectResults = await this.searchWithSingleKeyword(
              projectId, 
              queryParams, 
              page, 
              limit
            );
            
            // 添加项目名称和分类名称
            const resultsWithProjectInfo = await Promise.all(
              projectResults.list.map(async (item) => {
                // 添加项目名称
                const result = { 
                  ...item, 
                  project_name: project.name 
                };
                
                // 尝试添加分类名称
                try {
                  const catId = String(item.catid);
                  if (catId) {
                    // 获取项目的分类列表
                    const categories = await this.getCategoryList(projectId);
                    const category = categories.find(cat => String(cat._id) === catId);
                    if (category) {
                      result.cat_name = category.name;
                    }
                  }
                } catch (error) {
                  // 忽略获取分类名称的错误
                  this.logger.debug(`无法获取分类名称，项目ID=${projectId}, 分类ID=${item.catid}:`, error);
                }
                
                return result;
              })
            );
            
            // 将结果添加到总结果中
            allResults = [...allResults, ...resultsWithProjectInfo];
          }
        }
      }
      
      // 3. 对结果去重
      const deduplicated = this.deduplicateResults(allResults);
      
      // 如果结果太多，截取合适的数量
      const limitedResults = deduplicated.slice(0, limit);
      
      this.logger.info(`共找到 ${deduplicated.length} 个符合条件的接口，显示 ${limitedResults.length} 个`);
      
      return {
        total: deduplicated.length,
        list: limitedResults
      };
    } catch (error) {
      this.logger.error('搜索接口失败:', error);
      throw error;
    }
  }

  /**
   * 使用单个关键字在单个项目中搜索接口
   */
  private async searchWithSingleKeyword(
    projectId: string, 
    queryParams: { keyword?: string; path?: string }, 
    page: number, 
    limit: number
  ): Promise<{ total: number; list: any[] }> {
    try {
      // 构建查询参数
      const params = {
        project_id: projectId,
        page,
        limit,
        ...queryParams
      };
      
      const response = await this.request<ApiSearchResponse>("/api/interface/list", params, projectId);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "搜索接口失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.debug(`在项目 ${projectId} 中使用关键字 ${JSON.stringify(queryParams)} 搜索接口失败:`, error);
      // 搜索失败时返回空结果，而非抛出异常中断整个搜索流程
      return { total: 0, list: [] };
    }
  }

  /**
   * 对搜索结果去重
   */
  private deduplicateResults(results: any[]): any[] {
    // 使用接口ID作为唯一标识符去重
    const seen = new Set<string>();
    return results.filter(item => {
      const id = String(item._id);
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }

  /**
   * 获取分类下的所有接口
   */
  async getCategoryApis(projectId: string, catId: string): Promise<Array<ApiSearchResultItem>> {
    try {
      const params = {
        project_id: projectId,
        catid: catId,
        page: 1,
        limit: 100 // 默认获取100个，如果需要更多可以考虑分页
      };
      
      const response = await this.request<ApiSearchResponse>("/api/interface/list_cat", params, projectId);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取分类接口列表失败");
      }
      
      return response.data.list;
    } catch (error) {
      this.logger.error(`获取分类接口列表失败, projectId=${projectId}, catId=${catId}:`, error);
      throw error;
    }
  }

  // ==================== 用户管理相关 ====================

  /**
   * 获取当前用户信息
   */
  async getCurrentUserInfo(): Promise<UserInfo> {
    try {
      const response = await this.request<GetUserInfoResponse>("/api/user/status");
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取用户信息失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error('获取当前用户信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户分组列表
   */
  async getUserGroups(): Promise<GroupInfo[]> {
    try {
      const response = await this.request<GetGroupListResponse>("/api/group/list");
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取分组列表失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error('获取用户分组列表失败:', error);
      throw error;
    }
  }

  // ==================== 项目管理相关 ====================

  /**
   * 创建新项目
   */
  async createProject(params: CreateProjectParams): Promise<any> {
    try {
      const response = await this.request<any>("/api/project/add", params, undefined, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "创建项目失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error('创建项目失败:', error);
      throw error;
    }
  }

  /**
   * 更新项目信息
   */
  async updateProject(params: UpdateProjectParams): Promise<any> {
    try {
      const response = await this.request<any>("/api/project/up", params, String(params.id), 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "更新项目失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error('更新项目失败:', error);
      throw error;
    }
  }

  /**
   * 删除项目
   */
  async deleteProject(projectId: string): Promise<any> {
    try {
      const response = await this.request<any>("/api/project/del", { id: projectId }, projectId, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "删除项目失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`删除项目失败, projectId=${projectId}:`, error);
      throw error;
    }
  }

  // 注意：YApi开放API不支持获取项目成员功能，已移除该方法

  /**
   * 添加项目成员
   */
  async addProjectMember(projectId: string, uid: number, role: string = 'dev'): Promise<any> {
    try {
      const response = await this.request<any>("/api/project/add_member", {
        id: projectId,
        member_uid: uid,
        role: role
      }, projectId, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "添加项目成员失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`添加项目成员失败, projectId=${projectId}, uid=${uid}:`, error);
      throw error;
    }
  }

  /**
   * 删除项目成员
   */
  async removeProjectMember(projectId: string, uid: number): Promise<any> {
    try {
      const response = await this.request<any>("/api/project/del_member", {
        id: projectId,
        member_uid: uid
      }, projectId, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "删除项目成员失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`删除项目成员失败, projectId=${projectId}, uid=${uid}:`, error);
      throw error;
    }
  }

  /**
   * 获取项目环境配置
   */
  async getProjectEnvs(projectId: string): Promise<ProjectEnv[]> {
    try {
      const response = await this.request<GetProjectEnvsResponse>("/api/project/get_env", { project_id: projectId }, projectId);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取项目环境配置失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`获取项目环境配置失败, projectId=${projectId}:`, error);
      throw error;
    }
  }

  // 注意：YApi开放API不支持获取项目日志功能，已移除该方法

  // ==================== 分类管理相关 ====================

  /**
   * 创建接口分类
   */
  async createCategory(params: CreateCategoryParams): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/add_cat", params, String(params.project_id), 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "创建分类失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error('创建分类失败:', error);
      throw error;
    }
  }

  /**
   * 更新接口分类
   */
  async updateCategory(catId: string, name: string, desc?: string): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/up_cat", {
        catid: catId,
        name: name,
        desc: desc || ""
      }, undefined, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "更新分类失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`更新分类失败, catId=${catId}:`, error);
      throw error;
    }
  }

  /**
   * 删除接口分类
   */
  async deleteCategory(catId: string): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/del_cat", { catid: catId }, undefined, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "删除分类失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`删除分类失败, catId=${catId}:`, error);
      throw error;
    }
  }

  // ==================== 接口管理相关 ====================

  /**
   * 删除接口
   */
  async deleteInterface(interfaceId: string, projectId: string): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/del", { id: interfaceId }, projectId, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "删除接口失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`删除接口失败, interfaceId=${interfaceId}:`, error);
      throw error;
    }
  }

  /**
   * 复制接口
   */
  async copyInterface(interfaceId: string, projectId: string, catId?: string): Promise<any> {
    try {
      const params: any = { id: interfaceId };
      if (catId) {
        params.catid = catId;
      }
      
      const response = await this.request<any>("/api/interface/copy", params, projectId, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "复制接口失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`复制接口失败, interfaceId=${interfaceId}:`, error);
      throw error;
    }
  }

  /**
   * 运行接口测试
   */
  async runInterface(params: RunInterfaceParams): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/run", params, params.project_id, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "运行接口失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`运行接口失败, interfaceId=${params.interface_id}:`, error);
      throw error;
    }
  }

  /**
   * 获取接口运行历史
   */
  async getInterfaceRunHistory(interfaceId: string, projectId: string): Promise<InterfaceRunHistory[]> {
    try {
      const response = await this.request<GetInterfaceRunHistoryResponse>("/api/interface/run_history", {
        interface_id: interfaceId,
        project_id: projectId
      }, projectId);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取接口运行历史失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`获取接口运行历史失败, interfaceId=${interfaceId}:`, error);
      throw error;
    }
  }

  // ==================== 测试集合相关 ====================

  /**
   * 获取项目测试集合列表
   */
  async getTestCollections(projectId: string): Promise<TestCollection[]> {
    try {
      const response = await this.request<GetTestCollectionsResponse>("/api/col/list", { project_id: projectId }, projectId);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取测试集合列表失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`获取测试集合列表失败, projectId=${projectId}:`, error);
      throw error;
    }
  }

  /**
   * 创建测试集合
   */
  async createTestCollection(params: CreateTestCollectionParams): Promise<any> {
    try {
      const response = await this.request<any>("/api/col/add_col", params, String(params.project_id), 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "创建测试集合失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error('创建测试集合失败:', error);
      throw error;
    }
  }

  /**
   * 获取测试集合下的测试用例
   */
  async getTestCases(colId: string): Promise<TestCase[]> {
    try {
      const response = await this.request<GetTestCasesResponse>("/api/col/case_list", { col_id: colId });
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取测试用例列表失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`获取测试用例列表失败, colId=${colId}:`, error);
      throw error;
    }
  }

  /**
   * 创建测试用例
   */
  async createTestCase(params: CreateTestCaseParams): Promise<any> {
    try {
      const response = await this.request<any>("/api/col/add_case", params, String(params.project_id), 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "创建测试用例失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error('创建测试用例失败:', error);
      throw error;
    }
  }

  /**
   * 运行测试集合
   */
  async runTestCollection(colId: string, envId?: string): Promise<any> {
    try {
      const params: any = { col_id: colId };
      if (envId) {
        params.env_id = envId;
      }
      
      const response = await this.request<any>("/api/col/run", params, undefined, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "运行测试集合失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`运行测试集合失败, colId=${colId}:`, error);
      throw error;
    }
  }

  // ==================== Mock期望相关 ====================

  /**
   * 获取接口Mock期望列表
   */
  async getMockExpectations(interfaceId: string, projectId: string): Promise<MockExpectation[]> {
    try {
      const response = await this.request<GetMockExpectationsResponse>("/api/interface/mock/list", {
        interface_id: interfaceId,
        project_id: projectId
      }, projectId);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "获取Mock期望列表失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`获取Mock期望列表失败, interfaceId=${interfaceId}:`, error);
      throw error;
    }
  }

  /**
   * 创建Mock期望
   */
  async createMockExpectation(params: CreateMockExpectationParams): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/mock/add", params, String(params.project_id), 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "创建Mock期望失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error('创建Mock期望失败:', error);
      throw error;
    }
  }

  /**
   * 删除Mock期望
   */
  async deleteMockExpectation(mockId: string, projectId: string): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/mock/del", { id: mockId }, projectId, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "删除Mock期望失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`删除Mock期望失败, mockId=${mockId}:`, error);
      throw error;
    }
  }

  // ==================== 数据导入导出相关 ====================

  /**
   * 导入Swagger数据
   */
  async importSwagger(projectId: string, catId: string, swaggerData: any, merge?: string): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/import_data", {
        type: 'swagger',
        project_id: projectId,
        catid: catId,
        json: swaggerData,
        merge: merge || 'normal'
      }, projectId, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "导入Swagger数据失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`导入Swagger数据失败, projectId=${projectId}:`, error);
      throw error;
    }
  }

  /**
   * 导入Postman数据
   */
  async importPostman(projectId: string, catId: string, postmanData: any): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/import_data", {
        type: 'postman',
        project_id: projectId,
        catid: catId,
        json: postmanData
      }, projectId, 'POST');
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "导入Postman数据失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`导入Postman数据失败, projectId=${projectId}:`, error);
      throw error;
    }
  }

  /**
   * 导出项目数据
   */
  async exportProject(projectId: string, type: string = 'json'): Promise<any> {
    try {
      const response = await this.request<any>("/api/interface/export_data", {
        type: type,
        pid: projectId,
        status: 'all',
        isWiki: false
      }, projectId);
      
      if (response.errcode !== 0) {
        throw new Error(response.errmsg || "导出项目数据失败");
      }
      
      return response.data;
    } catch (error) {
      this.logger.error(`导出项目数据失败, projectId=${projectId}:`, error);
      throw error;
    }
  }
} 