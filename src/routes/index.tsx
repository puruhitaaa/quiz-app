import { createFileRoute, useNavigate } from "@tanstack/react-router"
// @ts-ignore
import { useSignIn, useSignUp } from "react-supabase"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/contexts/auth"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useCategoryImpl } from "./-useCategoryImpl"
import AuthDialog from "./-components/AuthDialog"
import Navbar from "@/components/Navbar"
// @ts-ignore
import { useInsert, useUpdate } from "react-supabase"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export const Route = createFileRoute("/")({
  component: Index,
})

const FormSchema = z.object({
  difficulty: z.string().optional(),
  type: z.string().optional(),
  category: z.string().optional(),
  quizDuration: z.coerce.number().min(1).max(60),
  totalQuestions: z.coerce.number().min(1).max(100),
})

function Index() {
  const { session, user } = useAuth()
  const { data: categories, isLoading: isLoadingCategories } = useCategoryImpl()
  const [{ fetching: fetchingSignIn }, _signIn] = useSignIn()
  const [{ fetching: fetchingSignUp }, _signUp] = useSignUp()

  const { toast } = useToast()
  const navigate = useNavigate({ from: "/" })

  const [{ fetching: mutatingGameData }, insertGameData] = useInsert("gameData")
  const [{ fetching: mutatingQuizzes }, insertQuizzes] = useInsert("quizzes")

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  async function onClickInsert(values: z.infer<typeof FormSchema>) {
    const { totalQuestions, quizDuration, ...rest } = values
    const { data: quizData, error: errorQuizzes } = await insertQuizzes({
      // @ts-ignore
      userId: user?.id,
      totalQuestions,
      quizDuration,
    })
    const { data: gameData, error: errorGameData } = await insertGameData({
      ...rest,
      quizId: quizData[0].id,
    })

    toast({
      variant: "default",
      title: "Success",
      description: "Quiz has been successfully created and updated.",
    })

    if (errorQuizzes || errorGameData) {
      toast({
        variant: "destructive",
        title: "Error",
        description: errorGameData
          ? errorGameData.message
          : errorQuizzes
            ? errorQuizzes.message
            : "Something went wrong. Please try again.",
      })
    } else {
      navigate({
        to: "/quizzes/$quizId",
        params: { quizId: quizData[0].id },
        search: {
          page: 1,
          ...(gameData[0].type ? { type: gameData[0].type } : {}),
          ...(gameData[0].difficulty
            ? { difficulty: gameData[0].difficulty }
            : {}),
          ...(gameData[0].category ? { category: gameData[0].category } : {}),
        },
      })
    }
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    onClickInsert(data)
  }

  return (
    <div className='w-full relative'>
      <Navbar />

      <section className='max-w-2xl w-full space-y-6 py-6 sm:py-12 px-4 mx-auto'>
        <div className='text-center space-y-2'>
          <h1 className='text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl'>
            Test Your Knowledge with Our Quizzes
          </h1>
          <p className='text-muted-foreground md:text-xl'>
            Choose from a variety of quiz categories, difficulty levels, and
            question types to challenge yourself.
          </p>
        </div>
        <Form {...form}>
          <form
            className={cn("bg-card rounded-lg p-6 shadow-lg space-y-4", {
              relative: !session,
            })}
            onSubmit={form.handleSubmit(onSubmit)}
            id='quiz-start-form'
          >
            {!session ? (
              <div className='absolute inset-0 m-auto bg-background/90 flex items-center justify-center'>
                {!session ? (
                  <AuthDialog>
                    <Button
                      className='z-10 text-yellow-500'
                      variant='link'
                      type='button'
                    >
                      Sign In
                    </Button>
                  </AuthDialog>
                ) : null}
                {fetchingSignIn || fetchingSignUp ? (
                  <Loader2 className='h-5 w-5 animate-spin' />
                ) : null}
              </div>
            ) : null}
            <div className='grid grid-cols-3 gap-4'>
              <FormField
                control={form.control}
                name='difficulty'
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} disabled={!session}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Difficulty' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='easy'>Easy</SelectItem>
                        <SelectItem value='medium'>Medium</SelectItem>
                        <SelectItem value='hard'>Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='type'
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} disabled={!session}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Type' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='multiple'>
                          Multiple Choice
                        </SelectItem>
                        <SelectItem value='boolean'>True/False</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!isLoadingCategories ? (
                categories?.length ? (
                  <FormField
                    control={form.control}
                    name='category'
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          disabled={!session}
                        >
                          <FormControl>
                            <SelectTrigger className='w-full'>
                              <SelectValue placeholder='Category' />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id.toString()}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null
              ) : (
                <Skeleton className='w-full h-10' />
              )}
              <FormField
                control={form.control}
                name='quizDuration'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Quiz Duration (in mins)'
                        min={1}
                        max={60}
                        disabled={!session}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='totalQuestions'
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type='number'
                        placeholder='Total Questions'
                        min={1}
                        max={100}
                        disabled={!session}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <AlertDialog>
              <AlertDialogTrigger
                className={buttonVariants({ className: "w-full" })}
                disabled={
                  !session || !form.formState.isDirty || !form.formState.isValid
                }
              >
                Start Quiz
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will start a new quiz for{" "}
                    {form.getValues("quizDuration")} minutes
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction
                    form='quiz-start-form'
                    type='submit'
                    disabled={mutatingGameData || mutatingQuizzes}
                  >
                    Continue
                  </AlertDialogAction>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </form>
        </Form>
      </section>
    </div>
  )
}
