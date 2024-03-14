<template>
  <!-- 元素名称 -->
  <span class="element-name-wrapper">
    <!-- 图标 -->
    <span style="padding-right: 5px">
      <SvgIcon v-if="data.elementType == 'COLLECTION'" icon-name="pymeter-collection" />
      <SvgIcon v-else-if="data.elementType == 'SNIPPET'" icon-name="pymeter-snippet" />
      <SvgIcon v-else-if="data.elementType == 'WORKER'" icon-name="pymeter-worker" />
      <SvgIcon v-else-if="data.elementClass == 'HTTPSampler'" icon-name="pymeter-http" />
      <SvgIcon v-else-if="data.elementClass == 'PythonSampler'" icon-name="pymeter-python" />
      <SvgIcon v-else-if="data.elementClass == 'SQLSampler'" icon-name="pymeter-sql" />
      <SvgIcon v-else-if="data.elementClass == 'SnippetSampler'" icon-name="pymeter-snippet" />
      <SvgIcon v-else-if="data.elementType == 'PREV_PROCESSOR'" icon-name="pymeter-prev-processor" />
      <SvgIcon v-else-if="data.elementType == 'POST_PROCESSOR'" icon-name="pymeter-post-processor" />
      <SvgIcon v-else-if="data.elementClass == 'ForeachController'" icon-name="pymeter-foreach-controller" />
      <SvgIcon v-else-if="data.elementClass == 'IfController'" icon-name="pymeter-if-controller" />
      <SvgIcon v-else-if="data.elementClass == 'LoopController'" icon-name="pymeter-loop-controller" />
      <SvgIcon v-else-if="data.elementClass == 'RetryController'" icon-name="pymeter-retry-controller" />
      <SvgIcon v-else-if="data.elementClass == 'TransactionController'" icon-name="pymeter-transaction-controller" />
      <SvgIcon v-else-if="data.elementClass == 'WhileController'" icon-name="pymeter-while-controller" />
      <SvgIcon v-else-if="data.elementType == 'CONTROLLER'" icon-name="pymeter-controller" />
      <SvgIcon v-else-if="data.elementType == 'ASSERTION'" icon-name="pymeter-assertion" />
    </span>
    <!-- 名称 -->
    <span class="element-name">{{ data.elementName }}</span>
    <!-- 集合标识 -->
    <el-tag v-if="data.elementClass == 'TestCollection'" size="small" disable-transitions>集合</el-tag>
    <!-- 片段标识 -->
    <el-tag v-if="data.elementClass == 'TestSnippet'" size="small" disable-transitions>片段</el-tag>
    <!-- Setup标识 -->
    <el-tag v-if="data.elementClass == 'SetupWorker'" size="small" disable-transitions>前置</el-tag>
    <!-- Teardown标识 -->
    <el-tag v-if="data.elementClass == 'TeardownWorker'" size="small" disable-transitions>后置</el-tag>
    <!-- 禁用标识 -->
    <el-tag v-if="!data.enabled" type="danger" size="small" disable-transitions>禁用</el-tag>
    <!-- 跳过标识 -->
    <el-tag v-if="data.skiped" type="danger" size="small" disable-transitions>跳过</el-tag>
  </span>
</template>

<script>
export default {
  name: 'ElementTreeItemName',
  props: {
    data: { type: Object, default: () => ({}) }
  }
}
</script>

<style lang="scss" scoped>
.element-name-wrapper {
  display: inline-flex;
  align-items: center;
  width: 100%;
  user-select: none;
}

.element-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal;
}

.el-tag {
  margin-left: 5px;
}
</style>
