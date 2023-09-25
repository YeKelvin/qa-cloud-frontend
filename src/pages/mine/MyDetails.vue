<template>
  <div class="details-container">
    <div class="tabs-container">
      <el-tabs v-model="activeName" tab-position="left">
        <el-tab-pane name="INFO" label="个人信息" />
        <el-tab-pane v-if="!userStore.sso" name="SECURITY" label="安全设置" />
        <el-tab-pane name="SETTINGS" label="个人设置" />
      </el-tabs>
    </div>
    <div class="panes-container">
      <MyInfo v-if="showUserInfo" />
      <MySecurity v-if="showSecurity" />
      <MySettings v-if="showSettings" />
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user'
import MyInfo from './MyInfo.vue'
import MySecurity from './MySecurity.vue'
import MySettings from './MySettings.vue'

const userStore = useUserStore()
const activeName = ref('INFO')
const showUserInfo = computed(() => activeName.value === 'INFO')
const showSecurity = computed(() => activeName.value === 'SECURITY')
const showSettings = computed(() => activeName.value === 'SETTINGS')
</script>

<style lang="scss" scoped>
.details-container {
  display: flex;
  justify-content: center;

  margin-top: 80px;
  padding: 0 80px;

  height: 100%;
}

.tabs-container {
  display: flex;
}

.panes-container {
  display: flex;
  flex: 1 1 80%;
}

.el-tabs {
  --el-tabs-header-height: 80px;
}
</style>
