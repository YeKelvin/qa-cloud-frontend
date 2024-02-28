<template>
  <div>
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
          <el-option label="Microsoft SQL Server" value="MICROSOFT_SQL_SERVER" />
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

    <div v-if="creation || edited" class="flexbox-center">
      <el-button type="danger" :icon="Check" @click="save()">保 存</el-button>
      <el-button type="info" :icon="Close" @click="goback()">取 消</el-button>
    </div>
  </div>
</template>

<script setup>
import * as ElementService from '@/api/script/element'
import { Check, Close } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { isEmpty, debounce } from 'lodash-es'
import { toHashCode } from '@/utils/object-util'
import { useWorkspaceStore } from '@/store/workspace'

const route = useRoute()
const router = useRouter()
const workspaceStore = useWorkspaceStore()

const edited = ref(false)
const creation = computed(() => isEmpty(route.query.databaseNo))
const hashcode = ref()
const elformRef = ref()
const elementData = ref({
  elementNo: route.query.databaseNo,
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
const elementRules = {
  elementName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
  'elementAttrs.DatabaseEngine__database_type': [{ required: true, message: '数据库类型不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__host': [{ required: true, message: '主机不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__port': [{ required: true, message: '端口不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__username': [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__password': [{ required: true, message: '用户密码不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__database': [{ required: true, message: '库名不能为空', trigger: 'blur' }],
  'elementProps.DatabaseEngine__variable_name': [{ required: true, message: '变量名称不能为空', trigger: 'blur' }]
}
const databaseType = computed({
  get: () => elementData.value.elementAttrs.DatabaseEngine__database_type,
  set: (val) => (elementData.value.elementAttrs.DatabaseEngine__database_type = val)
})

onMounted(async () => {
  if (creation.value) return
  query()
})

watch(
  () => workspaceStore.workspaceNo,
  () => goback()
)

watch(
  elementData,
  debounce(() => {
    edited.value = hashcode.value !== toHashCode(elementData.value)
  }, 250),
  { deep: true, flush: 'sync' }
)

watch(
  () => databaseType.value,
  (val) => {
    if (!['', '1521', '3306', '5432', '1433'].includes(elementData.value.elementProps.DatabaseEngine__port)) return
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
    if (val === 'MICROSOFT_SQL_SERVER') {
      elementData.value.elementProps.DatabaseEngine__port = '1433'
      return
    }
  }
)

/**
 * 查询
 */
const query = () => {
  ElementService.queryElementInfo({ elementNo: elementData.value.elementNo }).then((response) => {
    elementData.value = response.data
    hashcode.value = toHashCode(elementData.value)
  })
}

/**
 * 返回
 */
const goback = () => {
  router.replace({ query: { item: 'database-connection-manager' } })
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
  await ElementService.createElement(elementData.value)
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
  // 成功提示
  ElMessage({ message: '保存成功', type: 'info', duration: 2 * 1000 })
  // 返回列表页
  goback()
}
</script>

<style lang="scss" scoped></style>
