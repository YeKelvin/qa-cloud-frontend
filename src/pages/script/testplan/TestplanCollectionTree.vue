<template>
  <div class="tree-container flexbox-column">
    <template v-if="collections.length > 0">
      <!-- 按钮 -->
      <div style="display: flex; justify-content: flex-end">
        <el-button type="primary" link @click="setAllChecked">全 选</el-button>
        <el-button type="primary" link @click="resetChecked">清 空</el-button>
      </div>

      <!-- 搜索 -->
      <el-input v-model="filterText" placeholder="搜索脚本" style="margin-bottom: 10px" clearable />

      <el-scrollbar class="maxsize" wrap-style="overflow-x:auto;" view-style="padding:10px;">
        <el-tree
          ref="eltreeRef"
          node-key="elementNo"
          draggable
          show-checkbox
          highlight-current
          style="padding-bottom: 50px"
          :data="collections"
          :props="{ label: 'elementName', children: 'children' }"
          :allow-drop="allowDrop"
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <span style="display: inline-flex; align-items: center">
              <el-tag type="info" size="small" style="width: 30px; margin-right: 10px" disable-transitions round>
                {{ node.parent.childNodes.findIndex((item) => item.key == data.elementNo) + 1 }}
              </el-tag>
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap">{{ node.label }}</span>
            </span>
          </template>
        </el-tree>
      </el-scrollbar>
    </template>

    <!-- 空提示 -->
    <template v-else>
      <el-empty description="工作空间下暂无脚本" />
    </template>
  </div>
</template>

<script setup>
import { isEmpty } from 'lodash-es'

import * as ElementService from '@/api/script/element'
import { useWorkspaceStore } from '@/store/workspace'

const eltreeRef = ref()
const collections = ref([])
const workspaceStore = useWorkspaceStore()

const filterText = ref('')
// eslint-disable-next-line unicorn/no-array-callback-reference
watch(filterText, (val) => eltreeRef.value.filter(val))
watch(
  () => workspaceStore.workspaceNo,
  (val) => {
    if (!val) return
    queryCollections()
  }
)
onMounted(() => {
  if (workspaceStore.workspaceNo) queryCollections()
})

/**
 * 根据工作空间编号查询测试集合
 */
const queryCollections = () => {
  ElementService.queryElementAll({
    workspaceNo: workspaceStore.workspaceNo,
    elementType: 'COLLECTION',
    elementClass: 'TestCollection'
  }).then((response) => {
    collections.value = response.data
  })
}

/**
 * 拖拽时判定目标节点能否被放置
 */
const allowDrop = (draggingNode, dropNode, type) => {
  // 只允许在 Collection 前后插入，不允许在 Collection 里插入
  if (type === 'inner') {
    return false
  }
  return true
}

const handleNodeClick = (data, node) => {
  // 点击节点勾选 checkbox
  node.checked = !node.checked
}

const filterNode = (value, data) => {
  if (!value) return true
  return data.elementName.toLowerCase().indexOf(value.toLowerCase()) !== -1
}

const setAllChecked = () => {
  if (!isEmpty(filterText.value)) {
    const filteredCollections = collections.value.filter((item) => filterNode(filterText.value, item))
    eltreeRef.value.setCheckedKeys(filteredCollections.map((item) => item.elementNo))
    return
  }
  eltreeRef.value.setCheckedKeys(collections.value.map((item) => item.elementNo))
}

const setCheckedKeys = (keys) => {
  // 设置选中的脚本
  eltreeRef.value.setCheckedKeys(keys)
  // 调整脚本顺序
  const indexs = []
  const list = [...collections.value]
  for (const key of keys) {
    const index = collections.value.findIndex((item) => item.elementNo === key)
    if (index === -1) return
    indexs.push(index)
  }
  for (const [i, index] of indexs.entries()) {
    ;[list[i], list[index]] = [list[index], list[i]]
  }
  collections.value = list
}

const resetChecked = () => {
  eltreeRef.value.setCheckedKeys([])
}

const getCheckedCollections = () => {
  const nodes = eltreeRef.value.getCheckedNodes()
  const collections = []
  for (let i = 0, len = nodes.length; i < len; i++) {
    collections.push(nodes[i].elementNo)
  }
  return collections
}

defineExpose({
  getCheckedCollections,
  setCheckedKeys
})
</script>

<style lang="scss" scoped>
.tree-container {
  display: flex;
  height: 100%;
  padding: 10px;
  border-radius: 4px;
  box-shadow:
    0 2px 4px rgb(0 0 0 / 12%),
    0 0 6px rgb(0 0 0 / 4%);
}

:deep(.el-tree-node) {
  padding: 0 10px;
  margin-bottom: 5px;
}

:deep(.el-tree-node__expand-icon) {
  display: none;
}

:deep(.el-checkbox__inner) {
  width: 20px;
  height: 20px;
  border-radius: 6px;
}

:deep(.el-checkbox__inner::after) {
  top: 0;
  left: 6px;
  width: 4px;
  height: 14px;
  border-width: 2px;
}
</style>
