import axios from "axios"
import { BASE_URL } from "../url"
import type { GetAllCategoriesResponse } from "@/types/categories/getAll"

type CategoryResponse = {
  trivia_categories: GetAllCategoriesResponse[]
}

export const getAllCategories = async () => {
  return axios
    .request<CategoryResponse>({
      method: "GET",
      url: `${BASE_URL}/api_category.php`,
    })
    .then((res) => {
      return res.data.trivia_categories
    })
}
