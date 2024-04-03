<template>
  <div class="token-manager-wrapper">
    <div class="token-manager">
      <div class="token-header">
        <p style="font-size: 20px">应用访问令牌</p>
        <el-button type="primary" plain :icon="Plus" @click="gotoTokenEditor()">新增</el-button>
      </div>
      <el-divider />
      <div class="token-body" />
      <template v-if="tokenList.length === 0">
        <el-empty />
      </template>
      <template v-else>
        <el-card v-for="token in tokenList" :key="token.tokenNo" shadow="hover">
          <template v-slot:header>
<div  style="display: flex; align-items: center; justify-content: space-between;">
            <p style="font-size: 18px">{{ token.name }}</p>
            <el-button type="text" @click="gotoTokenEditor(token.tokenNo)">编辑</el-button>
          </div>
</template>
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px">
            <p style="font-size: 16px">令牌编号：{{ token.tokenNo }}</p>
            <el-button type="text" @click="copyToken(token.tokenNo)">复制</el-button>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px">
            <p style="font-size: 16px">有效期：{{ token.validTime }}</p>
            <el-button type="text" @click="deleteToken(token.tokenNo)">删除</el-button>
          </div>
        </el-card>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Close, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

import * as TokenService from '@/api/opencenter/token'

const route = useRoute()
const router = useRouter()

const appNo = ref(route.query.appNo)
const tokenList = ref([])

onMounted(() => {
  query()
})

/**
 * 查询
 */
const query = () => {
  TokenService.queryTokenAll({ owner: appNo.value }).then((response) => {
    tokenList.value = response.data
  })
}

const gotoTokenEditor = (tokenNo = null) => {
  const querys = {}
  if (tokenNo) {
    querys.tokenNo = tokenNo
  }
  router.push({ path: '/opencenter/token-editor', query: querys })
}
</script>

<style lang="scss" scoped>
.token-manager-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.token-manager {
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

:deep(.el-empty__description) {
  display: none;
}
</style>
