import { useCategoryData } from "./-hooks/useCategoryData"

export const useCategoryImpl = () => {
  const { data, isLoading } = useCategoryData()

  return {
    data,
    isLoading,
  }
}
