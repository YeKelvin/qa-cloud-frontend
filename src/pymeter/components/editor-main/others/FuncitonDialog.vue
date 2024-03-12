<template>
  <el-dialog title="函数助手" width="60%" center append-to-body @close="emit('update:modelValue', false)">
    <!-- resizebox分割面板 -->
    <a-split v-model:size="splitSize" class="func-split" min="200px" max="400px">
      <!-- 分割线 -->
      <template #resize-trigger>
        <div class="resizebox-line-wrapper">
          <div class="resizebox-line" />
        </div>
      </template>
      <!-- 函数列表 -->
      <template #first>
        <a-typography-paragraph>
          <!-- 列表 -->
          <FuncitonList :data="functions" @click="activeFunciton = $event" />
        </a-typography-paragraph>
      </template>
      <!-- 函数详情 -->
      <template #second>
        <a-typography-paragraph>
          <!-- 详情 -->
          <FunctionDetails :data="activeFunciton" />
        </a-typography-paragraph>
      </template>
    </a-split>
    <el-divider />

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <!-- 表达式 -->
        <div>
          <span class="expression-title">表达式：</span>
          <span class="expression-value">{{ previewValue }}</span>
        </div>
        <!-- 操作按钮 -->
        <div>
          <el-button @click="emit('update:modelValue', false)">取消</el-button>
          <el-button type="primary" @click="insert()">插入</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { getFunctions } from './functions'
import FuncitonList from './FunctionList.vue'
import FunctionDetails from './FunctionDetails.vue'

const emit = defineEmits(['update:modelValue', 'insert'])
const functions = getFunctions()
const splitSize = ref('250px')
const activeFunciton = ref(functions[0].func[0])
const previewValue = computed(() => {
  const func = activeFunciton.value
  let args = func.args.map((arg) => arg.value).join(', ')
  if (args.slice(-2) === ', ') {
    args = args.slice(0, -2)
  }
  return `\${${func.code}(${args})}`
})
const insert = () => {
  // 插入函数内容
  emit('insert', previewValue.value)
  // 关闭函数助手
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.func-split {
  width: 100%;
  height: 350px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}

.expression-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--el-text-color-regular);
  user-select: none;
}

.expression-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--el-color-danger);
}

.resizebox-line-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.resizebox-line {
  flex: 1;
  width: 1px;
  height: 100%;
  background-color: var(--el-border-color);

  &:hover {
    background-color: var(--el-color-primary);
  }
}

/* override */
.el-divider--horizontal {
  margin: 5px 0;
}

:deep(.arco-split-pane) {
  display: flex;
  overflow: hidden;
}

:deep(.arco-typography) {
  flex: 1;
  margin-top: 0;
  margin-bottom: 0;
}
</style>
