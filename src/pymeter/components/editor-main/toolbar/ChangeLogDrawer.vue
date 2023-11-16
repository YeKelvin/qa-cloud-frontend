<template>
  <el-drawer class="pymeter-toolbar__changelog-drawer" direction="rtl" size="35%" @open="onOpen">
    <template #header>
      <div class="flexbox-between">
        <span style="font-size: 16px; color: var(--el-text-color-regular)">变更日志</span>
        <span style="display: flex; align-items: center">
          <el-dropdown
            v-if="currentElementNo"
            trigger="click"
            style="margin-right: 20px"
            :show-timeout="0.25"
            :hide-timeout="0.25"
          >
            <span style="color: var(--el-color-primary); cursor: pointer">{{ onlyself ? '元素' : '全部' }}</span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="onlyself = true">元素日志</el-dropdown-item>
                <el-dropdown-item @click="onlyself = false">全部日志</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" link style="margin-right: 10px" @click="toggleOrder()">
            <SvgIcon icon-name="common-sort" style="font-size: 16px; transition: 0.25s" :class="{ asc: !desc }" />
          </el-button>
          <el-button link style="margin-right: 10px" @click="query()">
            <SvgIcon icon-name="common-refresh" />
          </el-button>
        </span>
      </div>
    </template>

    <!-- 加载骨架 -->
    <el-skeleton v-if="loading" :rows="10" style="padding: 10px" animated />

    <!-- 空提示 -->
    <template v-if="!loading && activities.length === 0">
      <div style="display: flex; flex: 1; align-items: center; justify-content: center">
        <el-empty />
      </div>
    </template>

    <!-- 时间线 -->
    <template v-if="!loading">
      <el-scrollbar class="maxsize" wrap-style="overflow-x:auto;" view-style="padding:0 20px 0 5px;">
        <div class="timeline">
          <el-timeline>
            <el-timeline-item
              v-for="activity in activities"
              :key="activity.changelogNo"
              :timestamp="activity.operationTime + '\t' + activity.operationBy"
              :type="
                {
                  INSERT: 'success',
                  UPDATE: 'primary',
                  DELETE: 'danger',
                  COPY: 'primary',
                  MOVE: 'warning',
                  ORDER: 'warning',
                  TRANSFER: 'warning'
                }[activity.operationType]
              "
              hollow
              size="large"
              placement="top"
            >
              <el-card shadow="hover">
                <!-- 新增 -->
                <template v-if="activity.operationType === 'INSERT'">
                  <div class="flexbox" style="flex-wrap: wrap; align-items: center">
                    <span class="description-text">新增了&nbsp;</span>
                    <template v-if="activity.parentNo !== currentElementNo">
                      <span class="element-data">{{ activity.parentName }}</span>
                      <span class="description-text">&nbsp;下的&nbsp;</span>
                    </template>
                    <span class="element-data">{{ activity.elementName }}</span>
                  </div>
                </template>
                <!-- 修改 -->
                <template v-else-if="activity.operationType === 'UPDATE'">
                  <div class="flexbox-between">
                    <span class="flexbox" style="flex-wrap: wrap; align-items: center">
                      <span class="description-text">{{ getModifiedPreDesc(activity.newValue) }}&nbsp;</span>
                      <template v-if="activity.elementNo !== currentElementNo">
                        <span class="element-data">{{ activity.elementName }}&nbsp;</span>
                        <span class="description-text">的&nbsp;</span>
                      </template>
                      <span class="element-data">{{ getPropertyName(activity) }}</span>
                    </span>
                    <span><el-button type="primary" link @click="openDiff(activity)">比较</el-button></span>
                  </div>
                </template>
                <!-- 删除 -->
                <template v-else-if="activity.operationType === 'DELETE'">
                  <div class="flexbox" style="flex-wrap: wrap; align-items: center">
                    <span class="description-text">删除了&nbsp;</span>
                    <template v-if="activity.parentNo !== currentElementNo">
                      <span class="element-data">{{ activity.parentName }}</span>
                      <span class="description-text">&nbsp;下的&nbsp;</span>
                    </template>
                    <span class="element-data">{{ activity.elementName }}</span>
                  </div>
                </template>
                <!-- 复制 -->
                <template v-else-if="activity.operationType === 'COPY'">
                  <div class="flexbox" style="flex-wrap: wrap; align-items: center">
                    <span class="description-text">新增了&nbsp;</span>
                    <span class="element-data">{{ activity.elementName }}</span>
                  </div>
                  <div class="flexbox" style="flex-wrap: wrap; align-items: center">
                    <span class="copied-from">来自&nbsp;</span>
                    <span class="copied-from">{{ activity.sourceName }}</span>
                  </div>
                </template>
                <!-- 移动（不同父级） -->
                <template v-else-if="activity.operationType === 'MOVE'">
                  <div class="flexbox" style="flex-wrap: wrap; align-items: center">
                    <span class="description-text">调整了&nbsp;</span>
                    <template v-if="activity.elementNo !== currentElementNo">
                      <span class="element-data">{{ activity.elementName }}</span>
                      <span class="description-text">&nbsp;的&nbsp;</span>
                    </template>
                    <span class="element-data">位置</span>
                    <span class="description-text">，从&nbsp;</span>
                    <span class="element-data">{{ activity.sourceName }}</span>
                    <span class="description-text">&nbsp;的第&nbsp;</span>
                    <span class="element-data">{{ activity.sourceIndex }}</span>
                    <span class="description-text">&nbsp;位移动至&nbsp;</span>
                    <span class="element-data">{{ activity.targetName }}</span>
                    <span class="description-text">&nbsp;的第&nbsp;</span>
                    <span class="element-data">{{ activity.targetIndex }}</span>
                    <span class="description-text">&nbsp;位</span>
                  </div>
                </template>
                <!-- 排序（相同父级） -->
                <template v-else-if="activity.operationType === 'ORDER'">
                  <div class="flexbox" style="flex-wrap: wrap; align-items: center">
                    <span class="description-text">调整了&nbsp;</span>
                    <template v-if="activity.elementNo !== currentElementNo">
                      <span class="element-data">{{ activity.elementName }}</span>
                      <span class="description-text">&nbsp;的&nbsp;</span>
                    </template>
                    <span class="element-data">顺序</span>
                    <span class="description-text">，从第&nbsp;</span>
                    <span class="element-data">{{ activity.sourceIndex }}</span>
                    <span class="description-text">&nbsp;位移动至第&nbsp;</span>
                    <span class="element-data">{{ activity.targetIndex }}</span>
                    <span class="description-text">&nbsp;位</span>
                  </div>
                </template>
                <!-- 转移空间 -->
                <template v-else-if="activity.operationType === 'TRANSFER'">
                  <div class="flexbox" style="flex-wrap: wrap; align-items: center">
                    <span class="description-text">转移了&nbsp;</span>
                    <template v-if="activity.elementNo !== currentElementNo">
                      <span class="element-data">{{ activity.elementName }}</span>
                      <span class="description-text">&nbsp;的&nbsp;</span>
                    </template>
                    <span class="element-data">空间</span>
                    <span class="description-text">，从&nbsp;</span>
                    <span class="element-data">{{ activity.sourceName }}</span>
                    <span class="description-text">&nbsp;转移至&nbsp;</span>
                    <span class="element-data">{{ activity.targetName }}</span>
                    <span class="description-text">&nbsp;中</span>
                  </div>
                </template>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-scrollbar>

      <!-- 分页组件 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          layout="total, prev, pager, next, jumper"
          :total="total"
          @current-change="onPageChange"
        />
      </div>
    </template>

    <!-- 数据对比窗口 -->
    <el-dialog
      v-model="showDiffDialog"
      class="diff-dialog"
      width="65%"
      center
      destroy-on-close
      @close="showDiffDialog = false"
    >
      <MonacoDiffEditor ref="diffEditorRef" language="json" />
    </el-dialog>
  </el-drawer>
</template>

<script setup>
import { isBoolean } from 'lodash-es'
import { AttributeDefinition, PropertyDefinition } from '@/api/enum'
import * as HistoryService from '@/api/script/history'
import MonacoDiffEditor from '@/components/monaco-editor/MonacoDiffEditor.vue'
import { usePyMeterStore } from '@/store/pymeter'

const pymeterStore = usePyMeterStore()
const currentTab = computed(() => {
  const result = pymeterStore.tabs.filter((tab) => tab.editorNo === pymeterStore.activeTabNo)
  if (!result) return
  return result[0]
})
const currentElementNo = computed(() => {
  const tab = currentTab.value
  if (!tab) return
  return tab.metadata.elementNo
})
const loading = ref(false)
const activities = ref([])
const onlyself = ref(true)
const desc = ref(true)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const diffEditorRef = ref()
const showDiffDialog = ref()

watch(onlyself, () => query())

const getModifiedPreDesc = (val) => {
  if (val === null || val === undefined) return '修改了'
  if (isBoolean(val)) {
    return val ? '开启了' : '关闭了'
  } else {
    if (val.toLowerCase() === 'true') return '开启了'
    else if (val.toLowerCase() === 'false') return '关闭了'
    else return '修改了'
  }
}

const getPropertyName = (activity) => {
  const code = activity.propName || activity.attrName
  return PropertyDefinition[code] || AttributeDefinition[code] || code
}

const onOpen = () => {
  query()
}

const toggleOrder = () => {
  desc.value = !desc.value
  query()
}

const query = () => {
  loading.value = true
  HistoryService.queryElementChangelogList({
    elementNo: currentTab.value.metadata.sn,
    onlyself: onlyself.value,
    order: desc.value ? 'desc' : 'asc',
    page: page.value,
    pageSize: pageSize.value
  }).then((response) => {
    activities.value = response.result.data
    total.value = response.result.total
    loading.value = false
  })
}

const openDiff = (activity) => {
  showDiffDialog.value = true
  nextTick(() => {
    diffEditorRef.value.setOldValue(activity.oldValue)
    diffEditorRef.value.setNewValue(activity.newValue)
  })
}

const onPageChange = (val) => {
  page.value = val
  query()
}

const onPageSizeChange = (val) => {
  pageSize.value = val
  query()
}
</script>

<style lang="scss">
.pymeter-toolbar__changelog-drawer {
  .el-drawer__body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0 10px;
  }
}

.diff-dialog {
  .el-dialog__header {
    display: none;
  }

  .el-dialog__body {
    padding: 5px;
  }
}
</style>

<style lang="scss" scoped>
.timeline {
  padding: 10px 0;
}

.pagination {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.description-text {
  color: var(--el-text-color-secondary);
}

.element-data {
  font-size: 16px;
  font-weight: 400;
}

.copied-from {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.asc {
  transform: rotate(180deg);
}

:deep(.el-timeline) {
  padding-inline-start: 10px;
}

:deep(.el-timeline-item__timestamp) {
  white-space: pre-wrap;
}

:deep(.el-card__body) {
  padding: 10px !important;
}

:deep(.el-empty__description) {
  display: none;
}
</style>
