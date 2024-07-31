import type { GetAllQuestionsParams } from "@/types"
import { useQuestionData } from "./-hooks/useQuestionData"

export const useQuestionImpl = ({
  isEnabled,
  params,
}: {
  isEnabled: boolean
  params?: GetAllQuestionsParams
}) => {
  let newParams = { amount: 1, ...params }
  const { data, isLoading, refetch, isRefetching } = useQuestionData({
    isEnabled,
    params: newParams,
  })

  return {
    data,
    isLoading,
    refetch,
    isRefetching,
  }
}
