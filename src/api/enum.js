export const UserState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const RoleState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const RoleType = {
  SYSTEM: '系统内置',
  CUSTOM: '自定义'
}

export const PermissionState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const GroupState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
  CONNECT: 'CONNECT',
  TRACE: 'TRACE'
}

export const RunningState = {
  WAITING: '待运行',
  RUNNING: '运行中',
  ITERATING: '迭代中',
  COMPLETED: '已完成',
  INTERRUPTED: '已中断',
  ERROR: '异常'
}

export const TestplanState = {
  INITIAL: '待开始',
  TESTING: '测试中',
  COMPLETED: '已完成'
}

export const TestPhase = {
  INITIAL: '等待测试',
  DEBUG: '调试中',
  SMOKE_TESTING: '冒烟测试',
  SYSTEM_TESTING: '系统测试',
  REGRESSION_TESTING: '回归测试',
  ACCEPTANCE_TESTING: '验收测试',
  COMPLETED: '测试结束'
}

export const DatabaseType = {
  ORACLE: 'Oracle',
  MYSQL: 'MySQL',
  POSTGRESQL: 'PostgreSQL',
  Microsoft_SQL_SERVER: 'Microsoft SQL Server'
}

export const WorkspaceScope = {
  PRIVATE: '个人',
  PROTECTED: '团队',
  PUBLIC: '公共'
}

export const MatchMethod = {
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE'
}

export const MatchType = {
  ALL: '所有',
  IN: '包含',
  NOTIN: '不包含',
  STARTWITH: '开始于',
  ENDWITH: '结束于',
  PATTERN: '正则'
}

export const RestrictionState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const RobotState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const RobotType = {
  WECOM: '企业微信',
  DINGTALK: '钉钉'
}

export const JobState = {
  NORMAL: '正常',
  PAUSED: '已暂停',
  CLOSED: '已关闭'
}

export const JobType = {
  TESTPLAN: '测试计划',
  COLLECTION: '测试集合',
  WORKER: '测试用例'
}

export const TriggerType = {
  DATE: '固定时间',
  INTERVAL: '固定间隔',
  CRON: 'CRON'
}

export const TaskOperationType = {
  ADD: '添加作业',
  MODIFY: '修改作业',
  EXECUTE: '执行作业',
  PAUSE: '暂停作业',
  RESUME: '恢复作业',
  CLOSE: '关闭作业'
}

export const ElementType = {
  COLLECTION: '测试集合',
  CONFIG: '配置器',
  WORKER: '工作者',
  CONTROLLER: '逻辑控制器',
  SAMPLER: '取样器',
  TIMER: '时间控制器',
  PREV_PROCESSOR: '前置处理器',
  POST_PROCESSOR: '后置处理器',
  ASSERTION: '断言器',
  LISTENER: '监听器'
}

export const ElementClass = {
  // collection
  TestCollection: '测试集合',
  SnippetCollection: '片段集合',
  // worker
  TestWorker: '测试用例',
  SetupWorker: '前置用例',
  SetupDebuger: '前置调试器',
  TearDownWorker: '后置用例',
  TearDownDebuger: '后置调试分器',
  // sampler
  HTTPSampler: 'HTTP取样器',
  PythonSampler: 'Python取样器',
  SnippetSampler: '片段取样器',
  SQLSampler: 'SQL取样器',
  // config
  HTTPHeaderManager: 'HTTP-Header配置器',
  HTTPCookieManager: 'HTTP-Cookie配置器',
  HTTPSessionManager: 'HTTP-Session配置器',
  VariableDataset: '变量配置器',
  DatabaseEngine: '数据库配置器',
  // controller
  IfController: 'IF控制器',
  LoopController: '循环控制器',
  WhileController: 'WHILE控制器',
  RetryController: '重试控制器',
  ForeachController: '遍历控制器',
  TransactionController: '事务控制器',
  // prev:
  PythonPrevProcessor: 'Python前置处理器',
  SleepPrevProcessor: '固定定时器',
  // post
  PythonPostProcessor: 'Python后置处理器',
  JsonPathPostProcessor: 'Json提取器',
  SleepPostProcessor: '固定定时器',
  // assertion
  PythonAssertion: 'Python断言',
  JsonPathAssertion: 'Json断言'
}

export const ApplicationState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}
