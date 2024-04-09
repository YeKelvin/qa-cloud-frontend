<template>
  <div class="token-manager-wrapper">
    <div class="token-manager">
      <div class="token-header">
        <!-- 标题 -->
        <span style="font-size: 20px">应用访问令牌</span>
        <!-- 新增按钮 -->
        <el-button type="primary" plain :icon="Plus" @click="gotoTokenEditor()">新增</el-button>
      </div>
      <el-divider />
      <div class="token-body" />
      <!-- 空数据提示 -->
      <template v-if="tokenList.length === 0">
        <el-empty />
      </template>
      <!-- 令牌列表 -->
      <template v-else>
        <el-card v-for="token in tokenList" :key="token.tokenNo" shadow="hover">
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between">
              <!-- 令牌名称 -->
              <div style="display: flex; align-items: center">
                <SvgIcon icon-name="common-token" style="margin-right: 5px; font-size: 18px" />
                <span style="margin-right: 5px; font-size: 18px">{{ token.tokenName }}</span>
                <template v-if="dayjs(token.expireTime) < dayjs()">
                  <el-tag type="danger" disable-transitions>已失效</el-tag>
                </template>
              </div>
              <!-- 操作按钮 -->
              <div>
                <el-button type="primary" plain :icon="EditPen" @click="gotoTokenEditor(token.tokenNo)">编辑</el-button>
                <el-button type="danger" plain :icon="Delete" @click="deleteToken(token.tokenNo)">删除</el-button>
              </div>
            </div>
          </template>
          <div>
            <div style="margin-bottom: 20px">
              <!-- 权限对象列表 -->
              <el-tag
                v-for="object in token.objects"
                :key="object"
                size="large"
                style="margin-right: 10px"
                disable-transitions
              >
                {{ object }}
              </el-tag>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between">
              <div>
                <!-- 创建时间 -->
                <el-tag type="info" style="margin-right: 10px" disable-transitions>
                  创建时间: {{ token.createdTime }}
                </el-tag>
                <!-- 失效时间 -->
                <template v-if="token.expireTime">
                  <el-tag type="danger" disable-transitions>失效时间: {{ token.expireTime }}</el-tag>
                </template>
                <template v-else>
                  <el-tag type="danger" disable-transitions>永久有效</el-tag>
                </template>
              </div>
              <!-- 最后使用时间 -->
              <template v-if="token.lastUsedTime">
                <el-tag type="info" disable-transitions>最后使用时间: {{ token.lastUsedTime }}</el-tag>
              </template>
              <template v-else>
                <el-tag type="warning" disable-transitions>从未使用</el-tag>
              </template>
            </div>
          </div>
        </el-card>
      </template>
      <!-- 底部按钮 -->
      <div class="token-footer">
        <el-button @click="goback()">返 回</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Plus, Delete, EditPen } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'

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

/**
 * 删除令牌
 */
const deleteToken = async (tokenNo) => {
  // 二次确认
  const cancelled = await ElMessageBox.confirm('是否确定删除？', '警告', {
    type: 'error',
    confirmButtonText: '确 定',
    cancelButtonText: '取 消'
  })
    .then(() => false)
    .catch(() => true)
  if (cancelled) return
  // 删除提交
  await TokenService.removeToken({ tokenNo: tokenNo })
  // 刷新列表
  query()
  // 成功提示
  ElMessage({ message: '删除成功', type: 'info', duration: 2 * 1000 })
}

/**
 * 跳转至编辑页
 */
const gotoTokenEditor = (tokenNo = null) => {
  const querys = { appNo: appNo.value }
  if (tokenNo) {
    querys.tokenNo = tokenNo
  }
  router.push({ path: '/opencenter/token-editor', query: querys })
}

/**
 * 返回上一页
 */
const goback = () => {
  window.history.length > 1 ? router.go(-1) : router.push('/opencenter/application')
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

:deep(.el-card) {
  width: 100%;
  margin-bottom: 20px;
}

/* :deep(.el-card__header) {
  padding: 5px;
} */
</style>
