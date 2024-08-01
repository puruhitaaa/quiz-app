/**
 * v0 by Vercel.
 * @see https://v0.dev/t/LLVnCZ9hqM1
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// @ts-ignore
import { useSignIn, useSignUp } from "react-supabase"
import { useToast } from "@/components/ui/use-toast"

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
})

export default function AuthDialog({
  children,
}: React.HTMLAttributes<HTMLElement>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isRegister, setIsRegister] = useState(false)

  const { toast } = useToast()

  const [{ fetching: fetchingSignIn }, signIn] = useSignIn()
  const [{ fetching: fetchingSignUp }, signUp] = useSignUp()

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onClickSignIn({
    email,
    password,
  }: z.infer<typeof FormSchema>) {
    const { error } = await signIn({
      email,
      password,
    })

    if (error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
    setIsDialogOpen(false)
  }

  async function onClickSignUp({
    email,
    password,
  }: z.infer<typeof FormSchema>) {
    const { error, user: signedUpUser } = await signUp({
      email,
      password,
    })

    if (error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })

    if (signedUpUser) {
      toast({
        variant: "default",
        title: "Success",
        description:
          "Account has been successfully created! please check your email to activate your account.",
      })
    }
    setIsDialogOpen(false)
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    switch (isRegister) {
      case true:
        return onClickSignUp(data)
      case false:
        return onClickSignIn(data)
      default:
        return null
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isRegister ? "Register" : "Login"}</DialogTitle>
          <DialogDescription>
            {isRegister
              ? "Create a new account"
              : "Sign in to your existing account"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className='grid gap-4 py-4'
            id='auth-form'
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2'>
                  <FormControl>
                    <Input placeholder='Email...' {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your email used to log in.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='flex flex-col gap-2'>
                  <FormControl>
                    <Input
                      type='password'
                      placeholder='Password...'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>This is your password.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <div className='flex flex-col md:flex-row w-full items-center md:justify-between'>
            <Button
              variant='link'
              onClick={() => setIsRegister(!isRegister)}
              className='text-sm'
              type='button'
            >
              {isRegister
                ? "Have an account? Login"
                : "Don't have an account? Register"}
            </Button>
            <Button
              className='w-full md:w-[initial]'
              disabled={fetchingSignIn || fetchingSignUp}
              type='submit'
              form='auth-form'
            >
              {isRegister ? "Register" : "Login"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
