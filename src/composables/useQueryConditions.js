export default function useTablePagination(conditions) {
  const queryConditions = reactive(conditions)

  const resetQueryConditions = () => {
    Object.keys(queryConditions).forEach((key) => (queryConditions[key] = ''))
  }

  return {
    queryConditions,
    resetQueryConditions
  }
}
