import { useState } from "react"

import { Button, buttonVariants } from "@/components/ui/button"

import { AlignRight, PuzzleIcon } from "lucide-react"
// import { defaultLinks } from "@/config/nav";
// import type { AuthSession } from "@/lib/auth/utils";
// import SignOutBtn from "./auth/SignOutBtn";
import { cn } from "@/lib/utils"
import { Link } from "@tanstack/react-router"
// @ts-ignore
import { useSignOut } from "react-supabase"
import { useAuth } from "@/contexts/auth"
import { useToast } from "./ui/use-toast"
// @ts-ignore
import { useFilter, useSelect } from "react-supabase"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { session, user } = useAuth()
  const [_signOutState, signOut] = useSignOut()

  const { toast } = useToast()

  const fetchFilter = useFilter(
    // @ts-ignore
    (query) => query.eq("userId", user.id),
    [user?.id!]
  )
  const [{ data: quizzes }, _reexecute] = useSelect("quizzes", {
    columns: "id",
    filter: fetchFilter,
    options: {
      count: "exact",
      head: false,
    },
  })

  async function onClickSignOut() {
    const { error } = await signOut()

    if (error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      })
  }

  return (
    <div className='border-b w-full sticky top-0 flex items-center p-2 sm:p-4'>
      <div className='container mx-auto'>
        <div className='flex justify-between w-full items-center'>
          <Link to='/' className='flex items-center justify-center'>
            <PuzzleIcon className='h-6 w-6' />
            <span className='sr-only'>Quiz App</span>
          </Link>

          {/* <nav className="md:flex items-center gap-4 hidden">
          {defaultLinks.map((link) => (
            <Link
              key={link.href}
              className={cn("text-sm", {
                "text-primary hover:text-primary font-semibold":
                  pathname === link.href,
                "text-muted-foreground hover:text-primary":
                  pathname !== link.href,
              })}
              href={link.href}
            >
              {link.title}
            </Link>
          ))}
        </nav> */}

          <div className='md:inline-flex items-center hidden gap-4'>
            {quizzes?.length ? (
              <Link
                className={buttonVariants({ variant: "secondary", size: "sm" })}
                to='/quizzes'
              >
                Quiz History
              </Link>
            ) : null}
            {session ? (
              <div className='md:block hidden'>
                <Button
                  variant='destructive'
                  size='sm'
                  onClick={onClickSignOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : null}
          </div>

          <Button
            className='md:hidden'
            variant='ghost'
            onClick={() => setOpen(!open)}
          >
            <AlignRight />
          </Button>
        </div>
      </div>
    </div>
  )
}
