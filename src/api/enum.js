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

export const HttpMethodColor = {
  GET: 'success',
  POST: 'primary',
  PUT: 'warning',
  DELETE: 'danger'
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

export const NoticeEvent = {
  TESTPLAN_EXECUTION_COMPLETED: '测试计划执行完成'
}

export const NoticeChannel = {
  WECOM: '企业微信',
  DINGTALK: '钉钉',
  FEISHU: '飞书'
}

export const NoticeBotState = {
  ENABLE: '启用',
  DISABLE: '禁用'
}

export const NoticeBotType = {
  WECOM: '企业微信',
  DINGTALK: '钉钉',
  FEISHU: '飞书'
}

export const JobState = {
  PENDING: '待开始',
  RUNNING: '运行中',
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
  CRON: 'CRONTAB'
}

export const JobEvent = {
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
  // worker
  TestWorker: '测试用例',
  SetupWorker: '前置用例',
  TeardownWorker: '后置用例',
  // snippet
  TestSnippet: '测试片段',
  // sampler
  SQLSampler: '数据库请求',
  HTTPSampler: 'HTTP请求',
  PythonSampler: 'Python请求',
  SnippetSampler: '片段请求',
  // config
  HTTPHeaderManager: 'HTTP-Header配置器',
  HTTPCookieManager: 'HTTP-Cookie配置器',
  HTTPSessionManager: 'HTTP-Session配置器',
  VariableDataset: '变量配置器',
  DatabaseEngine: '数据库配置器',
  HTTPHeaderTemplate: 'HTTP请求头模板',
  // controller
  IfController: 'IF分支',
  LoopController: 'Loop循环',
  WhileController: 'While循环',
  ForeachController: 'Foreach循环',
  RetryController: '重试循环',
  TransactionController: '事务',
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

export const PropertyDefinition = {
  // TestElement
  TestElement__name: '元素名称',
  TestElement__desc: '元素描述',

  // TestCollection
  TestCollection__serialize_workers: '顺序执行用例',
  TestCollection__delay: '延迟执行时间',
  TestCollection__running_strategy: '运行策略',

  // TestSnippet

  // TestWorker
  TestWorker__on_sample_error: '错误时动作',
  TestWorker__number_of_threads: '并发数',
  TestWorker__start_interval: '线程启动间隔时间',
  TestWorker__main_controller: '主控制器',

  // SetupWorker
  SetupWorker__on_sample_error: '错误时动作',
  SetupWorker__number_of_threads: '并发数',
  SetupWorker__start_interval: '线程启动间隔时间',
  SetupWorker__main_controller: '主控制器',

  // TeardownWorker
  TeardownWorker__on_sample_error: '错误时动作',
  TeardownWorker__number_of_threads: '并发数',
  TeardownWorker__start_interval: '线程启动间隔时间',
  TeardownWorker__main_controller: '主控制器',

  // IfController
  IfController__condition: 'if条件',

  // LoopController
  LoopController__loops: '循环次数',
  LoopController__continue_forever: '永远',

  // WhileController
  WhileController__condition: 'while条件',
  WhileController__max_loop_count: 'while最大循环数',
  WhileController__timeout: 'while超时时间',
  WhileController__delay: 'while延迟时间',

  // RetryController
  RetryController__retries: '重试次数',
  RetryController__intervals: '重试间隔时间',
  RetryController__flag_prefix: '重试标识前缀',

  // ForeachController
  ForeachController__target: '遍历项目',
  ForeachController__iter: '遍历对象',
  ForeachController__type: '遍历对象类型',
  ForeachController__delay: '遍历延迟时间',

  // TransactionController

  // HTTPSampler
  HTTPSampler__url: '请求地址',
  HTTPSampler__method: '请求方法',
  HTTPSampler__data: 'Body数据',
  HTTPSampler__encoding: '请求编码',
  HTTPSampler__connect_timeout: '连接超时时间',
  HTTPSampler__response_timeout: '响应超时时间',
  HTTPSampler__follow_redirects: '跟随重定向',
  HTTPSampler__running_strategy: '运行策略',

  // PythonSampler
  PythonSampler__script: 'Python脚本',

  // SQLSampler
  SQLSampler__statement: 'SQL语句',
  SQLSampler__limit: '结果数量限制',
  SQLSampler__result_name: '存储变量名称',
  SQLSampler__query_timeout: '查询超时时间',

  // SnippetSampler

  // SleepPrevProcessor
  SleepPrevProcessor__delay: '等待时间',

  // PythonPrevProcessor
  PythonPrevProcessor__script: 'Python脚本',

  // SleepPostProcessor
  SleepPostProcessor__delay: '等待时间',

  // PythonPostProcessor
  PythonPostProcessor__script: 'Python脚本',

  // JsonPathPostProcessor
  JsonPathPostProcessor__jsonpath: 'JsonPath表达式',
  JsonPathPostProcessor__variable_name: '变量名称',
  JsonPathPostProcessor__variable_scope: '变量作用域',
  JsonPathPostProcessor__list_random: '列表随机',
  JsonPathPostProcessor__default_value: '变量默认值',

  // PythonAssertion
  PythonAssertion__script: 'Python脚本',

  // JsonPathAssertion
  JsonPathAssertion__jsonpath: 'JsonPath表达式',
  JsonPathAssertion__expected_value: '期望值',
  JsonPathAssertion__operator: '判断操作符'
}

export const AttributeDefinition = {
  // TestWorkspace
  running_strategy: '运行策略',

  // TestCollection
  TestCollection__exclude_workspace: '排除空间组件',

  // TestSnippet
  TestSnippet__parameters: '片段参数',
  TestSnippet__use_http_session: '使用会话',

  // TestWorker
  Worker__use_http_session: '使用会话',
  Worker__clear_http_session_each_iteration: '迭代时刷新会话',

  // HTTPSampler
  HTTPSampler__header_templates: '请求头模板',
  HTTPSampler__headers: '请求头',
  HTTPSampler__querys: '查询参数',
  HTTPSampler__forms: '表单参数',
  HTTPSampler__files: '文件参数',

  // SQLSampler
  SQLSampler__engine_no: '数据库引擎',

  // SnippetSampler
  SnippetSampler__snippet_no: '测试片段',
  SnippetSampler__arguments: '片段参数',
  SnippetSampler__use_default: '使用默认值'
}
