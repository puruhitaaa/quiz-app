import { createContext, useContext, useEffect, useState } from "react"
// @ts-ignore
import { useAuthStateChange, useClient } from "react-supabase"

const initialState = { session: null, user: null }
export const AuthContext = createContext(initialState)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined)
    throw Error("useAuth must be used within AuthProvider")
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const client = useClient()
  const [state, setState] = useState(initialState)

  useEffect(() => {
    const session = client.auth.session()
    setState({ session, user: session?.user ?? null })
  }, [])

  useAuthStateChange((_event, session) => {
    setState({ session, user: session?.user ?? null })
  })

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}
