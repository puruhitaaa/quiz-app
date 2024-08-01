import Navbar from "@/components/Navbar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/contexts/auth"
import type { GetQuizResponse } from "@/types/quizzes"
import { createFileRoute, redirect } from "@tanstack/react-router"
// @ts-ignore
import { useFilter, useSelect } from "react-supabase"

export const Route = createFileRoute("/quizzes/")({
  component: Quizzes,
  beforeLoad: ({ context, location }) => {
    if (!context.auth.session) {
      throw redirect({
        to: "/",
        from: location.href,
      })
    }
  },
})

function Quizzes() {
  const { user } = useAuth()

  const fetchFilter = useFilter(
    // @ts-ignore
    (query) => query.eq("userId", user.id),
    [user?.id!]
  )
  const [{ data: quizzes, fetching: fetchingQuizzes }, _reexecute] = useSelect(
    "quizzes",
    {
      columns: "id, correctAnswers, incorrectAnswers, score, totalQuestions",
      filter: fetchFilter,
    }
  )
  return (
    <div className='relative'>
      <Navbar />

      <section className='py-6 sm:py-12 gap-6 flex-col flex justify-center px-4'>
        <div>
          <h1 className='text-3xl font-bold'>Quiz History</h1>
          <p className='text-muted-foreground'>
            Review your previous quiz results.
          </p>
        </div>

        <div className='overflow-auto border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Incorrect</TableHead>
                <TableHead>Correct</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!fetchingQuizzes
                ? quizzes?.map((quiz: GetQuizResponse) => (
                    <TableRow key={quiz.id}>
                      <TableCell>{quiz.id}</TableCell>
                      <TableCell>{quiz.incorrectAnswers ?? 0}</TableCell>
                      <TableCell>{quiz.correctAnswers ?? 0}</TableCell>
                      <TableCell>{quiz.score ?? 0}</TableCell>
                      <TableCell>{quiz.totalQuestions ?? 0}</TableCell>
                    </TableRow>
                  ))
                : [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className='w-12 h-4' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='w-12 h-4' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='w-12 h-4' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='w-12 h-4' />
                      </TableCell>
                      <TableCell>
                        <Skeleton className='w-12 h-4' />
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!quizzes?.length && !fetchingQuizzes ? (
            <p className='text-sm p-4'>No results yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default Quizzes
