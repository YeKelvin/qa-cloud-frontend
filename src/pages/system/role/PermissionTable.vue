<template>
  <el-table :data="rows" :span-method="spanMethod" style="width: 100%" border stripe highlight-current-row>
    <!-- 空表格 -->
    <template #empty>
      <el-empty />
    </template>

    <el-table-column prop="moduleName" label="权限模块" width="180" min-width="180" />
    <el-table-column prop="objectName" label="权限对象" width="180" min-width="180" />
    <el-table-column prop="permissionName" label="权限">
      <template #default="{ row }">
        <el-checkbox-group v-model="checkeds">
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
</template>

<script setup>
import { has } from 'lodash-es'

import * as PermissionService from '@/api/usercenter/permission'

const emit = defineEmits(['update:checkedList'])
const props = defineProps({ checkedList: { type: Array, default: () => [] } })
const checkeds = computed({
  get() {
    return props.checkedList
  },
  set(val) {
    emit('update:checkedList', val)
  }
})
const moduleList = ref([])
const rows = computed(() => {
  const data = []
  const modules = moduleList.value
  for (const module of modules) {
    const objects = module.objectList
    let rowspan = objects.length
    for (const obj of objects) {
      data.push({
        rowspan: rowspan,
        moduleName: module.moduleName,
        objectName: obj.objectName,
        permissionList: obj.permissionList
      })
      if (rowspan !== 0) {
        rowspan = 0
      }
    }
  }
  return data
})

onMounted(() => {
  query()
})

const query = () => {
  PermissionService.queryPermissionAll().then(response => {
    const modules = moduleList.value
    const moduleIndexStore = {}
    const objectIndexStore = {}
    for (const item of response.data) {
      if (!has(moduleIndexStore, item.moduleCode)) {
        modules.push({
          moduleNo: item.moduleNo,
          moduleName: item.moduleName,
          moduleCode: item.moduleCode,
          objectList: []
        })
        moduleIndexStore[item.moduleCode] = modules.length - 1
      }
      const module = modules[moduleIndexStore[item.moduleCode]]
      const objects = module.objectList
      const objectIndexKey = `${item.moduleCode}__${item.objectCode}`
      if (!has(objectIndexStore, objectIndexKey)) {
        objects.push({
          objectNo: item.objectNo,
          objectName: item.objectName,
          objectCode: item.objectCode,
          permissionList: []
        })
        objectIndexStore[objectIndexKey] = objects.length - 1
      }
      objects[objectIndexStore[objectIndexKey]].permissionList.push({
        permissionNo: item.permissionNo,
        permissionName: item.permissionName,
        permissionDesc: item.permissionDesc,
        permissionCode: item.permissionCode,
        state: item.state
      })
    }
  })
}

const spanMethod = ({ row, column, rowIndex, columnIndex }) => {
  if (columnIndex === 0) {
    if (row.rowspan === 0) {
      return {
        rowspan: 0,
        colspan: 0
      }
    } else {
      return {
        rowspan: row.rowspan,
        colspan: 1
      }
    }
  }
}

const checkAll = permissionList => {
  const checked = checkeds.value
  for (const item of permissionList) {
    checked.push(item.permissionNo)
  }
  checkeds.value = [...new Set(checked)]
}
</script>

<style lang="scss" scoped>
:deep(.el-empty__description) {
  display: none;
}
</style>
