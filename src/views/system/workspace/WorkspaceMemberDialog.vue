<template>
  <el-dialog title="成员管理" width="60%" center @close="$emit('update:model-value', false)">
    <div style="display: flex; flex: 1; flex-direction: column">
      <el-transfer
        v-model="members"
        style="display: flex; justify-content: center; align-items: center"
        filterable
        :titles="['平台用户', '空间成员']"
        :button-texts="['移除', '加入']"
        :data="data"
      >
        <template #default="{ option }">
          <span>{{ option.label }}</span>
        </template>
      </el-transfer>

      <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px">
        <el-button type="primary" @click="save">保 存</el-button>
        <el-button @click="$emit('update:model-value', false)">关 闭</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useWorkspaceStore } from '@/store/workspace'
import * as UserService from '@/api/usercenter/user'
import * as WorkspaceService from '@/api/public/workspace'

const currentRow = inject('currentRow', null)
const emit = defineEmits(['update:model-value'])
const workspaceStore = useWorkspaceStore()
const members = ref([])
const userList = ref([])
const data = computed(() => {
  const options = []
  userList.value.forEach((item) =>
    options.push({ key: item.userNo, label: item.userName, disabled: item.state !== 'ENABLE' })
  )
  return options
})

onMounted(() => {
  queryMemberAll()
  queryWorkspaceMemberAll()
})

/**
 * 查询所有用户
 */
const queryMemberAll = () => {
  UserService.queryUserAll().then((response) => {
    userList.value = response.result
  })
}

/**
 * 查询所有空间
 */
const queryWorkspaceMemberAll = () => {
  WorkspaceService.queryWorkspaceMemberAll({ workspaceNo: currentRow.value.workspaceNo }).then((response) => {
    members.value = response.result.map((item) => item.userNo)
  })
}

/**
 * 修改空间成员
 */
const save = () => {
  WorkspaceService.modifyWorkspaceMember({
    workspaceNo: currentRow.value.workspaceNo,
    members: members.value
  }).then(() => {
    // 重新查询工作空间列表
    workspaceStore.loadWorkspaceList()
    // 关闭dialog
    emit('update:model-value', false)
    // 成功提示
    ElMessage({ message: '编辑成功', type: 'info', duration: 2 * 1000 })
  })
}
</script>

<style lang="scss" scoped>
:deep(.el-transfer-panel) {
  min-width: 200px;
  max-width: 400px;
  width: 300px;
}

:deep(.el-transfer__buttons) {
  display: flex;
}

:deep(.el-transfer-panel__body) {
  display: flex;
  flex-direction: column;

  .el-input {
    width: auto;
  }
}
</style>
