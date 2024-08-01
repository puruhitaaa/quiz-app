import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useQuestionImpl } from "./-useQuestionImpl"
import { cn, shuffleArray } from "@/lib/utils"
// @ts-ignore
import { useFilter, useRealtime, useUpdate } from "react-supabase"
import { useEffect, useState } from "react"
import { addMinutes, differenceInMilliseconds } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/Navbar"
import { Skeleton } from "@/components/ui/skeleton"
import { z } from "zod"

const quizzesSchema = z.object({
  page: z.number().catch(1),
  category: z.string().catch("").nullish(),
  difficulty: z.enum(["easy", "medium", "hard"]).nullish(),
  type: z.enum(["multiple", "boolean"]).nullish(),
})

export const Route = createFileRoute("/quizzes/$quizId")({
  component: QuizId,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.session) {
      throw redirect({
        to: "/",
        from: location.href,
      })
    }
  },
  validateSearch: quizzesSchema,
})

function QuizId() {
  const search = Route.useSearch()
  const params = Route.useParams()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [shuffledAnswers, setShuffledAnswers] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)

  const filter = useFilter(
    // @ts-ignore
    (query) => query.eq("id", parseInt(params.quizId)).limit(1),
    [params.quizId]
  )
  const [{ data: quiz, fetching: fetchingQuizzes }, _reexecute] = useRealtime(
    "quizzes",
    {
      select: {
        columns:
          "id, created_at, quizDuration, totalQuestions, score, correctAnswers, incorrectAnswers",
        filter,
      },
    }
  )
  const updateFilter = useFilter(
    // @ts-ignore
    (query) => query.eq("id", parseInt(params.quizId)),
    [params.quizId]
  )
  const [_updateQuizState, updateQuiz] = useUpdate("quizzes", {
    filter: updateFilter,
  })
  const {
    data: question,
    isLoading: isLoadingQuestion,
    refetch: refetchQuestion,
    isRefetching: isRefetchingQuestion,
  } = useQuestionImpl({
    isEnabled: !fetchingQuizzes && !!quiz,
    params: {
      ...(search.type ? { type: search.type } : {}),
      ...(search.difficulty ? { difficulty: search.difficulty } : {}),
      ...(search.category ? { category: search.category } : {}),
    },
  })

  useEffect(() => {
    if (!fetchingQuizzes && !quiz?.length) {
      navigate({
        to: "/",
        from: location.href,
      })
    }
  }, [fetchingQuizzes, quiz, navigate])

  useEffect(() => {
    if (quiz && quiz[0] && quiz[0].created_at && quiz[0].quizDuration) {
      const createdAt = new Date(quiz[0].created_at)
      const endTime = addMinutes(createdAt, quiz[0].quizDuration).getTime()
      const interval = setInterval(() => {
        const currentTime = new Date().getTime()
        const timeRemaining = differenceInMilliseconds(endTime, currentTime)
        if (timeRemaining <= 0) {
          clearInterval(interval)
          setTimeLeft(0)
          navigate({
            to: "/quiz-results/$quizId",
            params: { quizId: params.quizId },
            from: location.href,
          })
        } else {
          setTimeLeft(timeRemaining)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [quiz?.[0].created_at, quiz?.[0].quizDuration])

  useEffect(() => {
    if (question) {
      const answers =
        question.type === "multiple"
          ? [...question.incorrect_answers, question.correct_answer]
          : [...question.incorrect_answers, question.correct_answer]

      setShuffledAnswers(shuffleArray(answers))
    }
  }, [question])

  const handleClickNextPage = () => {
    navigate({
      to: "/quizzes/$quizId",
      params: {
        quizId: params.quizId,
      },
      search: {
        page: search.page + 1,
        ...(search.type ? { type: search.type } : {}),
        ...(search.difficulty ? { difficulty: search.difficulty } : {}),
        ...(search.category ? { category: search.category } : {}),
      },
      replace: true,
    })
  }

  async function handleAnswerClick(answer: string) {
    if (selectedAnswer !== null) return
    const { correctAnswers, incorrectAnswers, totalQuestions } = quiz[0]

    if (search.page !== totalQuestions) {
      handleClickNextPage()
    }

    setSelectedAnswer(answer)
    const correct = answer === question?.correct_answer
    setIsAnswerCorrect(correct)

    const newCorrectAnswers = correct ? correctAnswers + 1 : correctAnswers
    const newIncorrectAnswers = correct
      ? incorrectAnswers
      : incorrectAnswers + 1
    const newScore = (newCorrectAnswers / totalQuestions) * 100

    const { error: updateQuizError } = await updateQuiz({
      correctAnswers: newCorrectAnswers,
      incorrectAnswers: newIncorrectAnswers,
      score: newScore,
    })

    if (updateQuizError) {
      toast({
        variant: "destructive",
        title: "Error",
        description: updateQuizError.message,
      })
    }

    if (search.page !== totalQuestions) {
      setTimeout(() => {
        refetchQuestion()
        setSelectedAnswer(null)
        setIsAnswerCorrect(null)
      }, 5000)
    } else {
      navigate({
        to: "/quiz-results/$quizId",
        params: {
          quizId: params.quizId,
        },
        replace: true,
      })
    }
  }

  const formatTimeLeft = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className='relative'>
      <Navbar />

      <section className='py-6 sm:py-12 flex items-center justify-center px-4'>
        <div className='w-full max-w-xl bg-card rounded-lg border border-border p-6 flex flex-col gap-6'>
          {!isLoadingQuestion ? (
            question ? (
              <>
                <div className='flex flex-col gap-2'>
                  <p className='text-sm text-muted-foreground'>
                    Question {search.page} of{" "}
                    {!fetchingQuizzes ? quiz?.[0].totalQuestions : null}
                  </p>
                  {timeLeft !== null && (
                    <p className='text-sm text-muted-foreground'>
                      {formatTimeLeft(timeLeft)}
                    </p>
                  )}
                </div>

                <div className='text-center'>
                  <h2 className='text-2xl font-bold'>{question.question}</h2>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  {question?.type === "multiple"
                    ? shuffledAnswers.map((answer) => (
                        <Button
                          key={answer}
                          onClick={() => void handleAnswerClick(answer)}
                          variant='outline'
                          className={cn(
                            "text-sm w-full",
                            selectedAnswer === answer &&
                              isAnswerCorrect === true &&
                              "bg-green-500",
                            selectedAnswer === answer &&
                              isAnswerCorrect === false &&
                              "bg-red-500",
                            selectedAnswer !== null &&
                              answer === question.correct_answer &&
                              "bg-green-500"
                          )}
                          disabled={
                            selectedAnswer !== null || isRefetchingQuestion
                          }
                        >
                          {answer}
                        </Button>
                      ))
                    : question?.type === "boolean"
                      ? [...question.incorrect_answers, question.correct_answer]
                          .sort()
                          .reverse()
                          .map((answer) => (
                            <Button
                              key={answer}
                              onClick={() => void handleAnswerClick(answer)}
                              variant='outline'
                              className={cn(
                                "text-sm w-full",
                                selectedAnswer === answer &&
                                  isAnswerCorrect === true &&
                                  "bg-green-500",
                                selectedAnswer === answer &&
                                  isAnswerCorrect === false &&
                                  "bg-red-500",
                                selectedAnswer !== null &&
                                  answer === question.correct_answer &&
                                  "bg-green-500"
                              )}
                              disabled={
                                selectedAnswer !== null || isRefetchingQuestion
                              }
                            >
                              {answer}
                            </Button>
                          ))
                      : null}
                </div>
              </>
            ) : null
          ) : (
            <div className='gap-4 flex flex-col'>
              <div className='flex items-center justify-between'>
                <div className='flex flex-col gap-2'>
                  <Skeleton className='w-20 h-2.5' />
                  <Skeleton className='w-20 h-2.5' />
                </div>

                <div className='gap-2 flex items-center'>
                  <Skeleton className='w-5 h-5 rounded' />
                  <Skeleton className='w-5 h-5 rounded' />
                </div>
              </div>

              <div className='gap-2 flex flex-col mb-2'>
                <Skeleton className='w-full h-5' />
                <Skeleton className='w-full h-5' />
                <Skeleton className='w-full h-5' />
                <Skeleton className='w-full h-5' />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <Skeleton className='w-full h-10' />
                <Skeleton className='w-full h-10' />
                <Skeleton className='w-full h-10' />
                <Skeleton className='w-full h-10' />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default QuizId
