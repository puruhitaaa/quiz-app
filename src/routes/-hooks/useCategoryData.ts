import { BASE_URL } from "@/clients"
import { getAllCategories } from "@/clients/categories"
import type { GetAllCategoriesResponse } from "@/types"
import { useQuery } from "@tanstack/react-query"

export const useCategoryData = () => {
  const result = useQuery<GetAllCategoriesResponse[]>({
    queryKey: [`${BASE_URL}/api_category.php`],
    queryFn: () => getAllCategories(),
  })

  return { ...result }
}
