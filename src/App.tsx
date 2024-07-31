import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
// @ts-ignore
import { Provider as SupabaseProvider } from "react-supabase"

import { createClient } from "@supabase/supabase-js"
import { router } from "./router"
import { AuthProvider, useAuth } from "./contexts/auth"

const queryClient = new QueryClient()

// Supabase initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const client = createClient(supabaseUrl, supabaseKey)

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const { session, user } = useAuth()

  return (
    <RouterProvider router={router} context={{ auth: { session, user } }} />
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider value={client}>
        <AuthProvider>
          <InnerApp />
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  )
}

export default App
