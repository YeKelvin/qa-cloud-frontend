<template>
  <div>
    <el-card
      v-for="(collection, index) in collections"
      :key="collection.id"
      :body-style="{ padding: '10px' }"
      :class="{ active: activeId == collection.id }"
      shadow="hover"
      style="cursor: pointer; margin-bottom: 6px"
      @click="handleCardClick(collection)"
    >
      <div class="collection-card">
        <!-- 序号 -->
        <span style="margin-right: 10px">{{ index + 1 }}</span>
        <!-- 集合名称 -->
        <div class="collection-name-wrapper">
          <span>{{ collection.name }}</span>
          <span class="collection-result-time-wrapper">
            <el-tag type="warning" size="small" disable-transitions>开始: {{ collection.startTime }}</el-tag>
            <el-tag type="danger" size="small" disable-transitions>耗时: {{ collection.elapsedTime }}</el-tag>
          </span>
        </div>
        <!-- 成功或失败的图标  -->
        <SvgIcon v-if="collection.success" icon-name="pymeter-pass" class="stauts-icon" />
        <SvgIcon v-else icon-name="pymeter-fail" class="stauts-icon" />
      </div>
    </el-card>
  </div>
</template>

<script setup>
defineProps({
  collections: { type: Array, default: () => [] }
})
const activeId = ref(0)

const emit = defineEmits(['click'])

/**
 * el-card handler
 */
const handleCardClick = (collection) => {
  emit('click', collection)
  activeId.value = collection.id
}
</script>

<style lang="scss" scoped>
.collection-card {
  display: flex;
  flex: 1;
  align-items: center;
  height: 100%;
  width: 100%;
}

.collection-name-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.collection-result-time-wrapper {
  display: inline-flex;
  flex-wrap: wrap;
  margin-top: 5px;

  .el-tag {
    margin-right: 5px;
  }
}
.stauts-icon {
  height: 2em !important;
  width: 2em !important;
}

.active {
  background-color: #f0f7ff;
}
</style>
