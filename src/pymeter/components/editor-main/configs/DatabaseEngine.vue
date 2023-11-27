<template>
  <div class="pymeter-component-container" tabindex="-1">
    <el-form
      ref="elformRef"
      label-width="120px"
      label-position="right"
      inline-message
      :model="elementData"
      :rules="elementRules"
    >
      <!-- 名称 -->
      <el-form-item label="数据库名称：" prop="elementName">
        <el-input v-model="elementData.elementName" placeholder="元素名称" clearable />
      </el-form-item>

      <!-- 备注 -->
      <el-form-item label="数据库备注：" prop="elementDesc">
        <el-input v-model="elementData.elementDesc" placeholder="元素备注" clearable />
      </el-form-item>

      <!-- 数据库类型 -->
      <el-form-item label="数据库类型：" prop="elementAttrs.DatabaseEngine__database_type">
        <el-select v-model="elementData.elementAttrs.DatabaseEngine__database_type" style="width: 100%">
          <el-option label="Oracle" value="ORACLE" />
          <el-option label="MySQL" value="MYSQL" />
          <el-option label="PostgreSQL" value="POSTGRESQL" />
          <el-option label="Microsoft SQL Server" value="Microsoft_SQL_SERVER" />
        </el-select>
      </el-form-item>

      <!-- 数据库地址 -->
      <el-form-item label="主机：" prop="elementProps.DatabaseEngine__host">
        <el-input v-model="elementData.elementProps.DatabaseEngine__host" placeholder="地址" clearable />
      </el-form-item>

      <!-- 数据库端口 -->
      <el-form-item label="端口：" prop="elementProps.DatabaseEngine__port">
        <el-input v-model="elementData.elementProps.DatabaseEngine__port" placeholder="端口" clearable />
      </el-form-item>

      <!-- 库名 -->
      <el-form-item label="库名：" prop="elementProps.DatabaseEngine__database">
        <el-input v-model="elementData.elementProps.DatabaseEngine__database" placeholder="库名" clearable />
      </el-form-item>

      <!-- 用户名称 -->
      <el-form-item label="用户名称：" prop="elementProps.DatabaseEngine__username">
        <el-input v-model="elementData.elementProps.DatabaseEngine__username" placeholder="用户名称" clearable />
      </el-form-item>

      <!-- 用户密码 -->
      <el-form-item label="用户密码：" prop="elementProps.DatabaseEngine__password">
        <el-input v-model="elementData.elementProps.DatabaseEngine__password" placeholder="用户密码" clearable />
      </el-form-item>

      <!-- 变量名称 -->
      <el-form-item label="变量名称：" prop="elementProps.DatabaseEngine__variable_name">
        <el-input
          v-model="elementData.elementProps.DatabaseEngine__variable_name"
          placeholder="数据库变量名称"
          clearable
        />
      </el-form-item>

      <!-- 连接参数 -->
      <el-form-item label="连接参数：" prop="elementProps.DatabaseEngine__querys">
        <el-input v-model="elementData.elementProps.DatabaseEngine__querys" placeholder="连接参数" clearable />
      </el-form-item>

      <!-- 超时时间 -->
      <el-form-item label="超时时间：" prop="elementProps.DatabaseEngine__connect_timeout">
        <el-input
          v-model="elementData.elementProps.DatabaseEngine__connect_timeout"
          placeholder="连接超时时间，默认=10000"
          clearable
        >
          <template #append>ms</template>
        </el-input>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <template v-if="creation || unsaved">
      <SaveButton :tips="shortcutKeyName" @click="save()" />
    </template>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import SaveButton from '@/pymeter/components/editor-main/common/SaveButton.vue'
import EditorEmits from '@/pymeter/composables/editor.emits'
import EditorProps from '@/pymeter/composables/editor.props'
import useEditor from '@/pymeter/composables/useEditor'
import useElement from '@/pymeter/composables/useElement'
import { usePyMeterStore } from '@/store/pymeter'
import { usePyMeterDB } from '@/store/pymeter-db'
import { useWorkspaceStore } from '@/store/workspace'
import { toHashCode } from '@/utils/object-util'
import { ElMessage } from 'element-plus'
import { debounce, isEmpty } from 'lodash-es'

const emit = defineEmits(EditorEmits)
const props = defineProps(EditorProps)
const pymeterStore = usePyMeterStore()
const workspaceStore = useWorkspaceStore()
const { assignElement, assignMetadata } = useElement()
const { unsaved, metadata, creation, localkey, shortcutKeyName, updateTabName } = useEditor()
const offlineDB = usePyMeterDB().offlineDB
const elementData = ref({
  elementNo: props.metadata.sn,
  elementName: '数据库配置器',
  elementDesc: '',
  elementType: 'CONFIG',
  elementClass: 'DatabaseEngine',
  elementAttrs: {
    DatabaseEngine__database_type: ''
  },
  elementProps: {
    DatabaseEngine__host: '',
    DatabaseEngine__port: '',
    DatabaseEngine__querys: '',
    DatabaseEngine__database: '',
    DatabaseEngine__username: '',
    DatabaseEngine__password: '',
    DatabaseEngine__variable_name: '',
    DatabaseEngine__connect_timeout: ''
  }
})
const elementRules = reactive({
  elementName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
  'elementAttrs.DatabaseEngine__database_type': [{ required: true, message: '数据库类型不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__host': [{ required: true, message: '主机不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__port': [{ required: true, message: '端口不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__username': [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__password': [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__database': [{ required: true, message: '库名不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__variable_name': [{ required: true, message: '变量名称不能为空', trigger: 'blur' }]
})
const databaseType = computed({
  get: () => elementData.value.elementAttrs.DatabaseEngine__database_type,
  set: (val) => (elementData.value.elementAttrs.DatabaseEngine__database_type = val)
})
const elformRef = ref()

watch(
  () => databaseType.value,
  (val) => {
    if (val === 'ORACLE') {
      elementData.value.elementProps.DatabaseEngine__port = '1521'
      return
    }
    if (val === 'MYSQL') {
      elementData.value.elementProps.DatabaseEngine__port = '3306'
      return
    }
    if (val === 'POSTGRESQL') {
      elementData.value.elementProps.DatabaseEngine__port = '5432'
      return
    }
    if (val === 'Microsoft_SQL_SERVER') {
      elementData.value.elementProps.DatabaseEngine__port = '1433'
      return
    }
  }
)

watch(
  elementData,
  debounce((localdata) => {
    // 如果前后端数据一致则代表数据未更改
    if (metadata.value.hashcode === toHashCode(localdata)) {
      // 数据一致则表示数据未变更
      unsaved.value = false
      // 数据未变更，移除离线数据
      offlineDB.removeItem(localkey.value)
      return
    }
    // 标记数据未保存
    unsaved.value = true
    // 存储离线数据
    offlineDB.setItem(localkey.value, JSON.parse(JSON.stringify({ data: localdata, meta: metadata.value })))
  }, 250),
  { deep: true, flush: 'sync' }
)

onMounted(async () => {
  // 优先查询离线数据
  if (unsaved.value) {
    queryOfflineData()
    return
  }
  // 新增模式计算HashCode并存储
  if (creation.value) {
    metadata.value.hashcode = toHashCode(elementData.value)
    return
  }
  // 最后才查询后端数据
  queryBackendData()
})

/**
 * 查询离线数据
 */
const queryOfflineData = async () => {
  const offline = await offlineDB.getItem(localkey.value)
  assignElement(elementData.value, offline.data)
  assignMetadata(metadata.value, offline.meta)
}

/**
 * 查询后端数据
 */
const queryBackendData = async () => {
  const response = await ElementService.queryElementInfo({ elementNo: elementData.value.elementNo })
  assignElement(elementData.value, response.result)
  assignMetadata(metadata.value, { hashcode: toHashCode(elementData.value) })
}

/**
 * 修改元素
 */
const modifyElement = async () => {
  // 修改元素
  await ElementService.modifyElement(elementData.value)
}

/**
 * 创建元素
 */
const createElement = async () => {
  // 工作空间非空校验
  if (isEmpty(workspaceStore.workspaceNo)) {
    ElMessage({ message: '请先选择工作空间', type: 'error', duration: 2 * 1000 })
    return
  }
  // 新增元素
  const response = await ElementService.createElement(elementData.value)
  // 提取元素编号
  const elementNo = response.result.elementNo
  // 移除离线数据
  offlineDB.removeItem(props.editorNo)
  // 更新Tab序列号
  metadata.value.sn = elementNo
  // 更新元素编号
  elementData.value.elementNo = elementNo
}

/**
 * 提交数据
 */
const save = async () => {
  // 表单校验
  const error = await elformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (error) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // 保存元素
  creation.value ? await createElement() : await modifyElement()
  // 标记数据已保存
  unsaved.value = false
  // 更新HashCode
  metadata.value.hashcode = toHashCode(elementData.value)
  // 移除离线数据
  offlineDB.removeItem(localkey.value)
  // 重新查询数据库列表
  pymeterStore.queryDatabaseEngineAll()
  // 更新 tab 标题
  updateTabName(elementData.value.elementName)
  // 成功提示
  ElMessage({ message: '保存成功', type: 'info', duration: 2 * 1000 })
}

defineExpose({
  save
})
</script>

<style lang="scss" scoped></style>
