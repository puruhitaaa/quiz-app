export type GetQuizResponse = {
  id: number
  score?: number
  totalQuestions?: number
  correctAnswers?: number
  incorrectAnswers?: number
  quizDuration?: number
  created_at?: Date
  userId: string
}
