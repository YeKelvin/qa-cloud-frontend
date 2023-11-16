<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-position="right"
      label-width="120px"
      inline-message
      :model="engineInfo"
      :rules="engineFormRules"
    >
      <!-- 名称 -->
      <el-form-item label="数据库名称：" prop="dbName">
        <el-input v-model="engineInfo.dbName" placeholder="数据库名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="数据库备注：" prop="dbDesc">
        <el-input v-model="engineInfo.dbDesc" placeholder="数据库备注" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 数据库类型 -->
      <el-form-item label="数据库类型：" prop="dbType">
        <el-select v-model="engineInfo.dbType" :disabled="queryMode" style="width: 100%">
          <el-option label="Oracle" value="ORACLE" />
          <el-option label="MySQL" value="MYSQL" />
          <el-option label="PostgreSQL" value="POSTGRESQL" />
          <el-option label="Microsoft SQL Server" value="Microsoft_SQL_SERVER" />
        </el-select>
      </el-form-item>

      <!-- 用户名称 -->
      <el-form-item label="用户名称：" prop="username">
        <el-input v-model="engineInfo.username" placeholder="用户名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 用户密码 -->
      <el-form-item label="用户密码：" prop="password">
        <el-input v-model="engineInfo.password" placeholder="用户密码" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 数据库地址 -->
      <el-form-item label="主机：" prop="host">
        <el-input v-model="engineInfo.host" placeholder="数据库地址" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 数据库端口 -->
      <el-form-item label="端口：" prop="port">
        <el-input v-model="engineInfo.port" placeholder="数据库端口" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 连接串query参数 -->
      <el-form-item label="连接参数：" prop="query">
        <el-input v-model="engineInfo.query" placeholder="连接串 query 参数" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 库名 -->
      <el-form-item label="库名：" prop="database">
        <el-input v-model="engineInfo.database" placeholder="库名" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 变量名称 -->
      <el-form-item label="变量名称：" prop="variableName">
        <el-input v-model="engineInfo.variableName" placeholder="变量名称" clearable :readonly="queryMode" />
      </el-form-item>

      <!-- 超时时间 -->
      <el-form-item label="超时时间：" prop="connectTimeout">
        <el-input
          v-model="engineInfo.connectTimeout"
          placeholder="连接超时时间，默认=10000"
          clearable
          :readonly="queryMode"
        >
          <template #append>ms</template>
        </el-input>
      </el-form-item>

      <!-- 操作按钮 -->
      <el-form-item v-if="queryMode">
        <el-button :icon="Edit" type="primary" @click="editNow()">编 辑</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="modifyMode">
        <el-button :icon="Check" type="danger" @click="modifyConfigurator()">保 存</el-button>
        <el-button :icon="Check" @click="modifyConfigurator(true)">保存并关闭</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
      <el-form-item v-else-if="createMode">
        <el-button :icon="Check" type="primary" @click="createConfigurator()">保 存</el-button>
        <el-button :icon="Check" @click="createConfigurator(true)">保存并关闭</el-button>
        <el-button :icon="Close" @click="closeTab()">关 闭</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import * as DatabaseService from '@/api/script/database'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import { usePyMeterStore } from '@/store/pymeter'
import { useWorkspaceStore } from '@/store/workspace'
import { Check, Close, Edit } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isEmpty } from 'lodash-es'

const props = defineProps(EditorProps)
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()

const { queryMode, modifyMode, createMode, functions, editNow, setReadonly, updateTab, closeTab } = useEditor(props)
const elformRef = ref()
const dbNo = ref(props.editorNo)
const engineInfo = ref({
  dbNo: '',
  dbName: '数据库配置器',
  dbDesc: '',
  dbType: '',
  username: '',
  password: '',
  host: '',
  port: '',
  query: '',
  database: '',
  variableName: '',
  connectTimeout: ''
})
const engineFormRules = reactive({
  dbName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
  dbType: [{ required: true, message: '数据库类型不能为空', trigger: 'blur' }],
  username: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
  host: [{ required: true, message: '主机不能为空', trigger: 'blur' }],
  port: [{ required: true, message: '端口不能为空', trigger: 'blur' }],
  database: [{ required: true, message: '库名不能为空', trigger: 'blur' }],
  variableName: [{ required: true, message: '变量名称不能为空', trigger: 'blur' }]
})

watch(
  () => engineInfo.value.dbType,
  (val) => {
    if (val === 'ORACLE') {
      engineInfo.value.port = '1521'
      return
    }
    if (val === 'MYSQL') {
      engineInfo.value.port = '3306'
      return
    }
    if (val === 'POSTGRESQL') {
      engineInfo.value.port = '5432'
      return
    }
    if (val === 'Microsoft_SQL_SERVER') {
      engineInfo.value.port = '1433'
      return
    }
  }
)

onMounted(() => {
  // 查询或更新模式时，先拉取元素信息
  if (createMode.value) return
  DatabaseService.queryDatabaseEngineInfo({ dbNo: dbNo.value }).then((response) => {
    engineInfo.value = response.result
  })
})

/**
 * 更新配置器编号
 */
const updateConfigNo = (val) => {
  dbNo.value = val
  engineInfo.value.dbNo = val
}

/**
 * 修改元素
 */
const modifyConfigurator = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 修改元素
  await DatabaseService.modifyDatabaseEngine({ dbNo: dbNo.value, ...engineInfo.value })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题
    updateTab(engineInfo.value.dbName)
  }
  // 重新查询数据库列表
  pymeterStore.queryDatabaseEngineAll()
  // 成功提示
  ElMessage({ message: '修改元素成功', type: 'info', duration: 2 * 1000 })
  // 需要关闭 tab
  if (close) {
    closeTab()
  }
}

/**
 * 创建元素
 */
const createConfigurator = async () => {
  // 工作空间非空校验
  if (isEmpty(workspaceStore.workspaceNo)) {
    ElMessage({ message: '请先选择工作空间', type: 'error', duration: 2 * 1000 })
    return
  }
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 新增元素
  const response = await DatabaseService.createDatabaseEngine({
    workspaceNo: workspaceStore.workspaceNo,
    ...engineInfo.value
  })
  // 无需关闭 tab
  if (!close) {
    // 设置为只读模式
    setReadonly()
    // 更新 tab 标题和编号
    updateTab(engineInfo.value.dbName, response.result.dbNo)
    // 更新配置器编号
    updateConfigNo(response.result.dbNo)
  }
  // 重新查询数据库列表
  pymeterStore.queryDatabaseEngineAll()
  // 成功提示
  ElMessage({ message: '新增元素成功', type: 'info', duration: 2 * 1000 })
  // 需要关闭 tab
  if (close) {
    closeTab()
  }
}

// 暂存函数，给 useEditor 使用
functions.createFn = createConfigurator
functions.modifyFn = modifyConfigurator
</script>

<style lang="scss" scoped></style>
