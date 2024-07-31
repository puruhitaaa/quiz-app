import axios from "axios"
import { BASE_URL } from "../url"
import type { GetQuestionResponse, GetAllQuestionsParams } from "@/types"

type QuestionResponse = {
  results: GetQuestionResponse[]
}

export const getQuestion = async (params: GetAllQuestionsParams) => {
  return axios
    .request<QuestionResponse>({
      method: "GET",
      url: `${BASE_URL}/api.php`,
      params,
    })
    .then((res) => {
      return res.data.results[0]
    })
}
