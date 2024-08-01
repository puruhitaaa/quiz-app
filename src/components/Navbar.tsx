import { Button, buttonVariants } from "@/components/ui/button"

import { AlignRight, PuzzleIcon } from "lucide-react"
import { Link } from "@tanstack/react-router"
// @ts-ignore
import { useSignOut } from "react-supabase"
import { useAuth } from "@/contexts/auth"
import { useToast } from "./ui/use-toast"
// @ts-ignore
import AuthDialog from "@/routes/-components/AuthDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const { session } = useAuth()
  const [_signOutState, signOut] = useSignOut()

  const { toast } = useToast()

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

          <div className='md:inline-flex items-center hidden gap-4'>
            {session ? (
              <>
                <Link
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                  to='/quizzes'
                >
                  Quiz History
                </Link>

                <Button
                  variant='destructive'
                  size='sm'
                  onClick={onClickSignOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <AuthDialog>
                <Button size='sm'>Sign In</Button>
              </AuthDialog>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className='md:hidden block'>
              <AlignRight className='h-5 w-5' />
            </DropdownMenuTrigger>

            <DropdownMenuContent className='md:hidden flex flex-col gap-2 sm:w-56'>
              {!session ? (
                <DropdownMenuItem asChild>
                  <AuthDialog>
                    <Button size='sm'>Sign In</Button>
                  </AuthDialog>
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link
                      className={buttonVariants({
                        variant: "secondary",
                        size: "sm",
                      })}
                      to='/quizzes'
                    >
                      Quiz History
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button variant='destructive' size='sm'>
                      Sign Out
                    </Button>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
