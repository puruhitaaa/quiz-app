import { createFileRoute, Link, redirect } from "@tanstack/react-router"
// @ts-ignore
import { useFilter, useSelect } from "react-supabase"
import Navbar from "@/components/Navbar"
import ScoreDiv from "./-components/ScoreDiv"
import { ChevronLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export const Route = createFileRoute("/quiz-results/$quizId")({
  component: QuizId,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.session) {
      throw redirect({
        to: "/",
        from: location.href,
      })
    }
  },
})

function QuizId() {
  const params = Route.useParams()

  const filter = useFilter(
    // @ts-ignore
    (query) => query.eq("id", parseInt(params.quizId)).limit(1),
    [params.quizId]
  )
  const [{ data: quiz, fetching: fetchingQuizzes }, _reexecute] = useSelect(
    "quizzes",
    {
      filter,
    }
  )

  return (
    <div className='relative'>
      <Navbar />

      <section className='py-6 sm:py-12 flex flex-col items-center justify-center px-4 gap-4'>
        {quiz ? (
          <div className='bg-card rounded-lg border p-4 sm:p-6 w-full max-w-md flex flex-col gap-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <ScoreDiv
                loading={fetchingQuizzes}
                title='Total Questions'
                value={quiz[0].totalQuestions ?? 0}
              />
              <ScoreDiv
                loading={fetchingQuizzes}
                title='Score'
                value={quiz[0].score ?? 0}
                color='primary'
              />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <ScoreDiv
                loading={fetchingQuizzes}
                title='Correct Answers'
                value={quiz[0].correctAnswers ?? 0}
                color='green'
              />
              <ScoreDiv
                loading={fetchingQuizzes}
                title='Incorrect Answers'
                value={quiz[0].incorrectAnswers ?? 0}
                color='red'
              />
            </div>
          </div>
        ) : null}

        <Link
          className={buttonVariants({
            className: "gap-2 inline-flex items-center",
            variant: "outline",
          })}
          to='/'
          replace
        >
          <ChevronLeft className='h-5 w-5' /> Visit Homepage
        </Link>
      </section>
    </div>
  )
}

export default QuizId
