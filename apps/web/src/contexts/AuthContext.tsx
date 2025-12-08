import { createContext, useContext, useState, useEffect } from "react"
import { authService, type User } from "@/services/auth"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

interface User {
  id: number
  email: string
  name?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Don't initialize auth on OAuth callback page to prevent token interference
    if (window.location.pathname === '/auth/callback') {
      setLoading(false)
      return
    }

    // Check if user is logged in on mount
    const initAuth = async () => {
      try {
        const token = authService.getStoredToken()
        if (token) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.login({ email, password })
      setUser(response.user)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const response = await authService.signup({ name, email, password })
      setUser(response.user)
      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
