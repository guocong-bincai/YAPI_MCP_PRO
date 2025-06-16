/**
 * YApi 接口相关类型定义
 */

// 接口详细信息
export interface ApiInterface {
  _id: string;
  title: string;
  path: string;
  method: string;
  req_params: any[];
  req_body_form: any[];
  req_headers: any[];
  req_query: any[];
  req_body_type: string;
  req_body_other: string;
  res_body_type: string;
  res_body: string;
  desc: string;
  markdown: string;
  // 其他可能的字段...
}

// 保存接口所需参数
export interface SaveApiInterfaceParams {
  id?: string;          // 接口ID，更新时必须，新增时不需要
  catid: string;        // 接口分类ID，新增时必须
  token?: string;       // 项目token，通常不需要手动提供
  method: string;       // 请求方法，如GET, POST, PUT, DELETE等
  path: string;         // 接口路径
  title: string;        // 接口标题
  project_id: string;   // 项目ID
  req_params?: any[];   // 路径参数
  req_headers?: any[];  // 请求头
  req_query?: any[];    // 查询参数
  req_body_type?: string; // 请求体类型，如json, form, file等
  req_body_form?: any[]; // 表单请求体
  req_body_other?: string; // JSON或其他类型请求体
  res_body_type?: string; // 响应体类型，如json, raw
  res_body?: string;     // 响应数据，通常是JSON Schema格式
  desc?: string;         // 接口描述
  markdown?: string;     // markdown格式的接口文档
  switch_notice?: boolean; // 是否开启通知
  api_opened?: boolean;  // 接口是否公开
  tag?: string[];        // 标签
}

// 项目信息
export interface ProjectInfo {
  _id: number | string;  // 项目ID
  name: string;         // 项目名称
  desc: string;         // 项目描述
  group_id: number;     // 分组ID
  uid: number;          // 创建人用户ID
  basepath: string;     // 基础路径
  // 其他字段...
}

// 接口分类信息
export interface CategoryInfo {
  _id: string;          // 分类ID
  name: string;         // 分类名称  
  desc: string;         // 分类描述
  project_id: number | string; // 所属项目ID
  uid: number;          // 创建人ID
  add_time: number;     // 创建时间
  up_time: number;      // 更新时间
  index: number;        // 排序索引
  // 其他字段...
}

// 接口搜索结果项
export interface ApiSearchResultItem {
  _id: string;          // 接口ID
  title: string;        // 接口名称
  path: string;         // 接口路径
  method: string;       // 请求方法
  project_id: number | string; // 所属项目ID
  catid: string;        // 所属分类ID
  add_time: number;     // 创建时间
  up_time: number;      // 更新时间
  project_name?: string; // 项目名称（可能由搜索功能添加）
  cat_name?: string;     // 分类名称（可能由搜索功能添加）
  // 其他字段...
}

// API接口返回类型
export interface ApiResponse<T> {
  errcode: number;
  errmsg: string;
  data: T;
}

// 获取API接口详情返回值
export interface GetApiResponse extends ApiResponse<ApiInterface> {}

// 获取项目信息返回值
export interface GetProjectResponse extends ApiResponse<ProjectInfo> {}

// 获取分类列表返回值
export interface GetCategoryListResponse extends ApiResponse<CategoryInfo[]> {}

// 保存接口返回值
export interface SaveApiResponse extends ApiResponse<{ _id: string; [key: string]: any }> {}

// 接口搜索结果返回值
export interface ApiSearchResponse extends ApiResponse<{
  total: number;      // 总结果数
  count: number;      // 当前页结果数
  list: ApiSearchResultItem[]; // 结果列表
}> {}

// 用户信息
export interface UserInfo {
  _id: number;
  username: string;
  email: string;
  role: string;
  add_time: number;
  up_time: number;
  type: string;
  study: boolean;
}

// 分组信息
export interface GroupInfo {
  _id: number;
  group_name: string;
  group_desc: string;
  owner_uids: number[];
  members: UserInfo[];
  add_time: number;
  up_time: number;
  type: string;
}

// 项目成员信息
export interface ProjectMember {
  _id: number;
  username: string;
  email: string;
  role: string; // owner, dev, guest
}

// 测试集合信息
export interface TestCollection {
  _id: string;
  name: string;
  project_id: number;
  desc: string;
  uid: number;
  add_time: number;
  up_time: number;
}

// 测试用例信息
export interface TestCase {
  _id: string;
  name: string;
  col_id: string;
  project_id: number;
  interface_id: string;
  test_script: string;
  uid: number;
  add_time: number;
  up_time: number;
}

// Mock期望信息
export interface MockExpectation {
  _id: string;
  name: string;
  project_id: number;
  interface_id: string;
  path: string;
  method: string;
  params: any;
  response: any;
  enable: boolean;
  uid: number;
  add_time: number;
  up_time: number;
}

// 项目环境配置
export interface ProjectEnv {
  _id: string;
  name: string;
  domain: string;
  header: Array<{name: string; value: string}>;
  global: Array<{name: string; value: string}>;
  project_id: number;
}

// 接口运行历史
export interface InterfaceRunHistory {
  _id: string;
  interface_id: string;
  project_id: number;
  uid: number;
  test_time: number;
  status: string;
  response_time: number;
  response_data: any;
}

// 项目动态/日志
export interface ProjectLog {
  _id: string;
  content: string;
  type: string; // add, update, delete
  uid: number;
  username: string;
  project_id: number;
  add_time: number;
}

// API响应类型扩展
export interface GetUserInfoResponse {
  errcode: number;
  errmsg: string;
  data: UserInfo;
}

export interface GetGroupListResponse {
  errcode: number;
  errmsg: string;
  data: GroupInfo[];
}

// 注意：YApi开放API不支持获取项目成员功能，已移除相关类型

export interface GetTestCollectionsResponse {
  errcode: number;
  errmsg: string;
  data: TestCollection[];
}

export interface GetTestCasesResponse {
  errcode: number;
  errmsg: string;
  data: TestCase[];
}

export interface GetMockExpectationsResponse {
  errcode: number;
  errmsg: string;
  data: MockExpectation[];
}

export interface GetProjectEnvsResponse {
  errcode: number;
  errmsg: string;
  data: ProjectEnv[];
}

export interface GetInterfaceRunHistoryResponse {
  errcode: number;
  errmsg: string;
  data: InterfaceRunHistory[];
}

// 注意：YApi开放API不支持获取项目日志功能，已移除相关类型

// 创建/更新参数类型
export interface CreateProjectParams {
  name: string;
  basepath: string;
  group_id: number;
  desc?: string;
  project_type?: string;
  color?: string;
  icon?: string;
}

export interface UpdateProjectParams {
  id: number;
  name?: string;
  basepath?: string;
  desc?: string;
  color?: string;
  icon?: string;
  env?: ProjectEnv[];
  pre_script?: string;
  after_script?: string;
}

export interface CreateCategoryParams {
  name: string;
  project_id: number;
  desc?: string;
}

export interface CreateTestCollectionParams {
  name: string;
  project_id: number;
  desc?: string;
}

export interface CreateTestCaseParams {
  name: string;
  col_id: string;
  project_id: number;
  interface_id: string;
  test_script?: string;
}

export interface CreateMockExpectationParams {
  name: string;
  project_id: number;
  interface_id: string;
  path: string;
  method: string;
  params?: any;
  response?: any;
  enable?: boolean;
}

export interface RunInterfaceParams {
  interface_id: string;
  project_id: string;
  env_id?: string;
  domain?: string;
  headers?: Array<{name: string; value: string}>;
  params?: any;
  body?: any;
} 