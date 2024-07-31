import { BASE_URL } from "@/clients"
import { getQuestion } from "@/clients/questions"
import type { GetAllQuestionsParams, GetQuestionResponse } from "@/types"
import { useQuery } from "@tanstack/react-query"

export const useQuestionData = ({
  isEnabled,
  params,
}: {
  isEnabled: boolean
  params: GetAllQuestionsParams
}) => {
  const result = useQuery<GetQuestionResponse>({
    queryKey: [`${BASE_URL}/api.php${JSON.stringify(params)}`],
    queryFn: () => getQuestion(params),
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  })

  return { ...result }
}
