<template>
  <div class="token-editor-wrapper">
    <div class="token-editor">
      <div class="token-header">
        <p style="font-size: 20px">{{ !tokenNo ? '新增' : '编辑' }}访问令牌</p>
      </div>
      <el-divider />
      <div class="token-body">
        <el-form ref="elformRef" label-width="100px" :model="tokenData" :rules="tokenRules">
          <!-- 令牌名称 -->
          <el-form-item label="令牌名称：" prop="tokenName">
            <el-input v-model="tokenData.tokenName" />
          </el-form-item>
          <!-- 令牌描述 -->
          <el-form-item label="令牌描述：" prop="tokenDesc">
            <el-input v-model="tokenData.tokenDesc" type="textarea" />
          </el-form-item>
          <!-- 有效时间 -->
          <el-form-item v-if="creation || noExpires" label="有效时间：" prop="expireTime">
            <el-select v-model="expiration" style="width: 200px; margin-right: 10px">
              <el-option label="7天" value="7" />
              <el-option label="30天" value="30" />
              <el-option label="60天" value="60" />
              <el-option label="90天" value="90" />
              <el-option label="永久有效" value="FOREVER" />
              <el-option label="自定义日期" value="CUSTOM" />
            </el-select>
            <!-- 自定义失效日期 -->
            <template v-if="expiration === 'CUSTOM'">
              <el-date-picker
                v-model="expireDate"
                placeholder="失效日期"
                :disabled-date="(time) => time.getTime() <= Date.now()"
              />
            </template>
          </el-form-item>
          <!-- 权限列表 -->
          <el-form-item label="令牌权限：" prop="permissions">
            <el-table
              :data="tableData"
              :span-method="spanMethod"
              style="width: 100%"
              border
              stripe
              highlight-current-row
            >
              <el-table-column prop="moduleName" label="模块" width="180" min-width="180" />
              <el-table-column prop="objectName" label="对象" width="180" min-width="180" />
              <el-table-column prop="permissionName" label="权限">
                <template #default="{ row }">
                  <el-checkbox-group v-model="tokenData.permissions">
                    <el-checkbox
                      v-for="permission in row.permissionList"
                      :key="permission.permissionNo"
                      :value="permission.permissionNo"
                    >
                      {{ permission.permissionName }}
                    </el-checkbox>
                  </el-checkbox-group>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="60" min-width="60" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link @click="checkAll(row.permissionList)">全选</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-form>
      </div>
      <div class="token-footer">
        <el-button type="primary" @click="save()">保 存</el-button>
        <el-button @click="goback()">返 回</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="jsx" setup>
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isEmpty } from 'lodash-es'

import * as TokenService from '@/api/opencenter/token'
import * as PermissionService from '@/api/usercenter/permission'

const route = useRoute()
const router = useRouter()

const creation = computed(() => !tokenNo.value)
const elformRef = ref()
const tokenNo = ref(route.query.tokenNo)
const tokenData = ref({
  appNo: route.query.appNo,
  tokenName: '',
  tokenDesc: '',
  expireTime: '',
  permissions: []
})
const tokenRules = {
  tokenName: [{ required: true, message: '令牌名称不能为空', trigger: 'blur' }],
  permissions: [{ required: true, message: '令牌权限不能为空', trigger: 'blur' }]
}
const expiration = ref('')
const expireDate = ref('')
const noExpires = ref(false)

const moduleList = ref([])
const tableData = computed(() => {
  const data = []
  const modules = moduleList.value
  modules.forEach((module) => {
    const objects = module.objectList
    let rowspan = objects.length
    objects.forEach((obj) => {
      data.push({
        rowspan: rowspan,
        moduleName: module.moduleName,
        objectName: obj.objectName,
        permissionList: obj.permissionList
      })
      if (rowspan !== 0) {
        rowspan = 0
      }
    })
  })
  return data
})

watch(expiration, (val) => {
  if (val === 'CUSTOM') return
  if (val === 'FOREVER') {
    tokenData.value.expireTime = ''
    return
  }
  tokenData.value.expireTime = dayjs().add(val, 'day').format('YYYY-MM-DD')
})

watch(expireDate, (val) => (tokenData.value.expireTime = dayjs(val).format('YYYY-MM-DD')))

onMounted(() => {
  queryPermissions()
  if (!tokenNo.value) return
  query()
})

/**
 * 查询令牌
 */
const query = () => {
  TokenService.queryToken({ tokenNo: tokenNo.value }).then((response) => {
    tokenData.value = response.data
    noExpires.value = isEmpty(tokenData.value.expireTime)
  })
}

/**
 * 查询权限列表
 */
const queryPermissions = () => {
  PermissionService.queryPermissionAll({ moduleCodes: ['SCRIPT', 'SCHEDULER'] }).then((response) => {
    const modules = moduleList.value
    const moduleIndexs = {}
    const objectIndexs = {}
    response.data.forEach((item) => {
      if (!(item.moduleCode in moduleIndexs)) {
        modules.push({
          moduleNo: item.moduleNo,
          moduleName: item.moduleName,
          moduleCode: item.moduleCode,
          objectList: []
        })
        moduleIndexs[item.moduleCode] = modules.length - 1
      }
      const module = modules[moduleIndexs[item.moduleCode]]
      const objects = module.objectList
      const objectKey = `${item.moduleCode}_${item.objectCode}`
      if (!(objectKey in objectIndexs)) {
        objects.push({
          objectNo: item.objectNo,
          objectName: item.objectName,
          objectCode: item.objectCode,
          permissionList: []
        })
        objectIndexs[objectKey] = objects.length - 1
      }
      objects[objectIndexs[objectKey]].permissionList.push({
        permissionNo: item.permissionNo,
        permissionName: item.permissionName,
        permissionDesc: item.permissionDesc,
        permissionCode: item.permissionCode
      })
    })
  })
}

const spanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    if (row.rowspan !== 0) {
      return {
        rowspan: row.rowspan,
        colspan: 1
      }
    } else {
      return {
        rowspan: 0,
        colspan: 0
      }
    }
  }
}

const checkAll = (permissionList) => {
  const checkeds = tokenData.value.permissions
  permissionList.forEach((item) => {
    checkeds.push(item.permissionNo)
  })
  // 去重
  tokenData.value.permissions = [...new Set(checkeds)]
}

const createToken = async () => {
  const response = await TokenService.createAppToken(tokenData.value)
  await ElMessageBox.alert(null, {
    title: '新增成功',
    confirmButtonText: '确 定',
    message: (
      <div>
        <span style="margin-bottom: 10px">确定之后将无法再次查看，请复制保存并妥善保管!</span>
        <el-tag type="danger" style="margin-bottom: 10px" disable-transitions>
          注意: 访问令牌作为重要凭证，请勿泄露！
        </el-tag>
        <span
          style="
                color: var(--el-color-primary);
                padding: 10px;
                word-break: break-all;
                background-color: var(--el-color-primary-light-9);
                border: 1px solid var(--el-color-primary-light-8);
                border-radius: 6px;
          "
        >
          {response.data.token}
        </span>
      </div>
    )
  })
}

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
  // 保存令牌
  creation.value ? await createToken() : await modifyToken(tokenData.value)
  // 返回上一页
  goback()
  // 成功提示
  ElMessage({ message: '保存成功', type: 'info', duration: 2 * 1000 })
}

const goback = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/opencenter/application')
}
</script>

<style lang="scss" scoped>
.token-editor-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.token-editor {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 800px;
  min-width: 800px;
  padding: 20px;
}

.token-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
}

.token-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

:deep(.el-form) {
  width: 100%;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
}
</style>
