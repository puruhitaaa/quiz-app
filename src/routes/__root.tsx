import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/ui/theme-provider"

interface RootRoute {
  // The ReturnType of your useAuth hook or the value of your AuthContext
  auth: any
}

export const Route = createRootRouteWithContext<RootRoute>()({
  component: () => (
    <>
      <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
        <Outlet />
        <Toaster />
      </ThemeProvider>
      <TanStackRouterDevtools />
    </>
  ),
})
