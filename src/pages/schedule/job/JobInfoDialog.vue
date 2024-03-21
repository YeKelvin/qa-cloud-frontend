<template>
  <el-dialog title="新增定时任务" width="50%" center append-to-body @close="$emit('update:modelValue', false)">
    <!-- 作业表单 -->
    <el-form ref="jobformRef" label-width="100px" :model="jobData" :rules="jobRules">
      <!-- 作业基础信息 -->
      <el-card shadow="hover" style="width: 100%; margin-bottom: 10px">
        <!-- 任务名称 -->
        <el-form-item label="任务名称：" prop="jobName">
          <el-input v-model="jobData.jobName" clearable :disabled="!saveable" />
        </el-form-item>
        <!-- 任务描述 -->
        <el-form-item label="任务描述：" prop="jobDesc">
          <el-input v-model="jobData.jobDesc" type="textarea" autosize :disabled="!saveable" />
        </el-form-item>
      </el-card>

      <!-- 任务类型 -->
      <el-card shadow="hover" style="width: 100%; margin-bottom: 10px">
        <el-form-item label="任务类型：" prop="jobType">
          <el-radio-group v-model="jobData.jobType" :disabled="readonly">
            <el-radio value="TESTPLAN">测试计划</el-radio>
            <el-radio value="COLLECTION">测试集合</el-radio>
            <el-radio value="TESTCASE">测试用例</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 任务类型的表单 -->
        <el-form ref="funcformRef" label-width="100px" :model="funcData" :rules="funcRules">
          <template v-if="jobData.jobType == 'TESTPLAN'">
            <el-form-item label="测试计划：" prop="plan_no">
              <el-select
                v-model="funcData.plan_no"
                tag-type="danger"
                style="width: 100%"
                filterable
                :disabled="readonly"
              >
                <el-option
                  v-for="testplan in testplanList"
                  :key="testplan.planNo"
                  :label="testplan.planName"
                  :value="testplan.planNo"
                />
              </el-select>
            </el-form-item>
          </template>
          <template v-else-if="jobData.jobType == 'COLLECTION'">
            <el-form-item label="测试集合：" prop="collection_no">
              <el-select
                v-model="funcData.collection_no"
                tag-type="danger"
                style="width: 100%"
                filterable
                :disabled="readonly"
              >
                <el-option
                  v-for="collection in collectionList"
                  :key="collection.elementNo"
                  :label="collection.elementName"
                  :value="collection.elementNo"
                />
              </el-select>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="测试用例：" prop="worker_no">
              <el-cascader
                v-model="funcData.worker_no"
                tag-type="danger"
                style="width: 100%"
                clearable
                filterable
                :filter-method="cascaderFilter"
                :disabled="readonly"
                :options="testcaseList"
                :props="{ value: 'elementNo', label: 'elementName', children: 'children' }"
              />
            </el-form-item>
          </template>
        </el-form>
        <!-- 环境变量 -->
        <el-form-item label="环境/变量：" prop="jobArgs.datasets">
          <DatasetSelect
            v-model="jobData.jobArgs.datasets"
            v-model:use-currvalue="jobData.jobArgs.use_currvalue"
            :disabled="!saveable"
          />
        </el-form-item>
      </el-card>

      <!-- 触发器相关 -->
      <el-card shadow="hover" style="width: 100%; margin-bottom: 10px">
        <el-form-item label="触发类型：" prop="triggerType">
          <el-radio-group v-model="jobData.triggerType" :disabled="readonly">
            <el-radio value="DATE">固定时间</el-radio>
            <el-radio value="CRON">CRON表达式</el-radio>
          </el-radio-group>
        </el-form-item>
        <!-- 触发器表单 -->
        <el-form ref="triggerformRef" label-width="100px" :model="triggerData" :rules="triggerRules">
          <template v-if="jobData.triggerType == 'DATE'">
            <el-form-item label="固定时间：" prop="run_date">
              <el-date-picker
                v-model="triggerData.run_date"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                :disabled="readonly"
                :disabled-date="(time) => time.getTime() < Date.now() - 1 * 24 * 3600 * 1000"
                :disabled-hours="disabledHours"
                :disabled-minutes="disabledMinutes"
                :disabled-seconds="disabledSeconds"
              />
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="任务周期：" required>
              <el-date-picker
                v-model="jobCycleRange"
                type="datetimerange"
                value-format="YYYY-MM-DD HH:mm:ss"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                range-separator="-"
                :disabled="readonly"
                :default-time="[new Date(0, 0, 0, 0, 0, 0), new Date(0, 0, 0, 23, 59, 59)]"
                :disabled-date="(time) => time.getTime() < Date.now() - 1 * 24 * 3600 * 1000"
                :disabled-hours="disabledHours"
                :disabled-minutes="disabledMinutes"
                :disabled-seconds="disabledSeconds"
                @change="datetimeRangeChange"
              />
            </el-form-item>
            <el-form-item label="crontab：" prop="crontab">
              <el-input v-model="triggerData.crontab" clearable :disabled="readonly" />
            </el-form-item>
            <el-alert type="info" show-icon :closable="false">
              <div class="flexbox-center">
                <span>CRON请参考：</span>
                <el-link href="https://crontab.guru/" type="primary" target="_blank">crontab.guru</el-link>
              </div>
            </el-alert>
          </template>
        </el-form>
      </el-card>
    </el-form>

    <template v-if="saveable">
      <div class="flexbox-center">
        <el-button type="primary" @click="submitForm()">保 存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { isValidCron } from 'cron-validator'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { isEmpty } from 'lodash-es'

import * as ScheduleService from '@/api/schedule/job'
import * as ElementService from '@/api/script/element'
import * as TestplanService from '@/api/script/testplan'
import DatasetSelect from '@/pages/components/DatasetSelect.vue'
import { useWorkspaceStore } from '@/store/workspace'

const jobRules = {
  jobName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
  jobType: [{ required: true, message: '任务类型不能为空', trigger: 'blur' }],
  triggerType: [{ required: true, message: '触发类型不能为空', trigger: 'blur' }]
}
const funcRules = {
  plan_no: [{ required: true, message: '测试计划不能为空', trigger: 'blur' }],
  worker_no: [{ required: true, message: '测试用例不能为空', trigger: 'blur' }],
  collection_no: [{ required: true, message: '测试集合不能为空', trigger: 'blur' }]
}
const triggerRules = {
  run_date: [{ required: true, message: '时间不能为空', trigger: 'blur' }],
  crontab: [{ required: true, message: 'crontab不能为空', trigger: 'blur' }]
}

const emit = defineEmits(['update:modelValue', 're-query'])
const workspaceStore = useWorkspaceStore()

const currentRow = inject('currentRow', null)
const creation = computed(() => currentRow.value === null)
const saveable = computed(() => currentRow.value === null || currentRow.value.jobState !== 'CLOSED')
const readonly = computed(() => (currentRow.value === null ? false : currentRow.value.jobState !== 'PENDING'))
const jobformRef = ref()
const jobData = ref({
  workspaceNo: workspaceStore.workspaceNo,
  jobName: '',
  jobDesc: '',
  jobType: 'TESTPLAN',
  jobArgs: {
    datasets: [],
    use_currvalue: false
  },
  triggerType: 'CRON',
  triggerArgs: {}
})
const testplanList = ref([])
const testcaseList = ref([])
const collectionList = ref([])
const funcformRef = ref()
const funcData = ref({
  plan_no: '',
  worker_no: '',
  collection_no: ''
})
const triggerformRef = ref()
const triggerData = ref({
  start_date: '',
  end_date: '',
  run_date: '',
  crontab: ''
})

const jobCycleRange = ref([])
const requestData = computed(() => {
  const data = { ...jobData.value }
  data.triggerArgs = triggerData.value
  switch (jobData.value.jobType) {
    case 'TESTPLAN': {
      data.jobArgs.plan_no = funcData.value.plan_no
      break
    }
    case 'TESTCASE': {
      data.jobArgs.worker_no = funcData.value.worker_no
      break
    }
    case 'COLLECTION': {
      data.jobArgs.collection_no = funcData.value.collection_no
      break
    }
  }
  return data
})

watch(
  () => jobData.value.jobType,
  (val) => {
    switch (val) {
      case 'TESTPLAN': {
        queryTestplanAll()
        break
      }
      case 'TESTCASE': {
        queryTestcaseAll()
        break
      }
      case 'COLLECTION': {
        queryCollectionAll()
        break
      }
    }
  }
)

onMounted(() => {
  // 查询测试计划、测试集合或测试用例的列表数据
  switch (jobData.value.jobType) {
    case 'TESTPLAN': {
      queryTestplanAll()
      break
    }
    case 'TESTCASE': {
      queryTestcaseAll()
      break
    }
    case 'COLLECTION': {
      queryCollectionAll()
      break
    }
  }
  // 新增模式时无需查询定时任务信息
  if (creation.value) return
  // 查询定时任务信息
  ScheduleService.queryJobInfo({ jobNo: currentRow.value.jobNo }).then((response) => {
    // 初始化作业信息
    jobData.value = response.data
    Object.assign(funcData.value, response.data.jobArgs)
    Object.assign(triggerData.value, response.data.triggerArgs)
    // 初始化任务周期
    jobCycleRange.value = [triggerData.value.start_date, triggerData.value.end_date]
  })
})

const queryTestplanAll = () => {
  TestplanService.queryTestplanAll({
    workspaceNo: workspaceStore.workspaceNo,
    stateList: ['INITIAL', 'TESTING']
  }).then((response) => {
    testplanList.value = response.data
  })
}

const queryCollectionAll = () => {
  ElementService.queryElementAll({
    workspaceNo: workspaceStore.workspaceNo,
    elementType: 'COLLECTION',
    elementClass: 'TestCollection',
    enabled: true
  }).then((response) => {
    collectionList.value = response.data
  })
}

const queryTestcaseAll = () => {
  ElementService.queryElementAllWithChildren({
    workspaceNo: workspaceStore.workspaceNo,
    elementType: 'COLLECTION',
    elementClass: 'TestCollection',
    childType: 'WORKER',
    childClass: 'TestWorker',
    enabled: true
  }).then((response) => {
    testcaseList.value = response.data
  })
}

/**
 * 提交表单
 */
const submitForm = async () => {
  // 表单校验
  const jobFormError = await jobformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  // 表单校验
  const taskFormError = await funcformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  // 表单校验
  const triggerFormError = await triggerformRef.value
    .validate()
    .then(() => false)
    .catch(() => true)
  if (jobFormError || taskFormError || triggerFormError) {
    ElMessage({ message: '数据校验失败', type: 'error', duration: 2 * 1000 })
    return
  }
  // cron格式校验
  if (
    jobData.value.triggerType === 'CRON' &&
    !isValidCron(triggerData.value.crontab, { alias: true, allowBlankDay: true })
  ) {
    ElMessage({ message: 'CRON表达式不正确', type: 'error', duration: 2 * 1000 })
    return
  }
  // 没有选择变量集时给出提示
  if (isEmpty(jobData.value.jobArgs.datasets)) {
    await ElMessageBox.confirm('当前没有选择[环境/变量]，确定提交吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
  }
  // 创建或修改任务
  await (creation.value ? ScheduleService.createJob(requestData.value) : ScheduleService.modifyJob(requestData.value))
  // 成功提示
  ElMessage({ message: '新增成功', type: 'info', duration: 2 * 1000 })
  // 关闭dialog
  emit('update:modelValue', false)
  // 重新查询列表
  emit('re-query')
}

/**
 * 生成区间数组
 */
const makeRange = (start, end) => {
  const result = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
}

/**
 * 判断是否同一天
 */
const isSameDate = (current, strftime) => {
  const sameYear = current.isSame(strftime, 'year')
  const sameMonth = current.isSame(strftime, 'month')
  const sameDate = current.isSame(strftime, 'date')
  return sameYear && sameMonth && sameDate
}

/**
 * el-date-picker handler
 */
const disabledHours = () => {
  const current = dayjs()
  if (isSameDate(current, triggerData.value.date.datetime)) {
    return makeRange(0, current.hour() - 1)
  }
  return []
}

/**
 * el-date-picker handler
 */
const disabledMinutes = (hour) => {
  const current = dayjs()
  if (hour === current.hour()) {
    return makeRange(0, current.minute() - 1)
  }
  return []
}

/**
 * el-date-picker handler
 */
const disabledSeconds = () => {
  return makeRange(0, 60)
}

/**
 * el-cascader handler
 */
const cascaderFilter = (node, keyword) => {
  return node.data.elementName.includes(keyword)
}

const datetimeRangeChange = () => {
  triggerData.value.start_date = jobCycleRange.value[0]
  triggerData.value.end_date = jobCycleRange.value[1]
}
</script>

<style lang="scss" scoped></style>
