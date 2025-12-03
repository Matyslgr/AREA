import { createContext, useContext, useState, useEffect } from "react"

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user has a valid token on mount
    const token = localStorage.getItem("area-token")
    if (token) {
      // Decode JWT to get user info (simple base64 decode of payload)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({
          id: payload.userId,
          email: payload.email,
          name: payload.name
        })
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem("area-token")
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Invalid credentials')
        }
        return false
      }

      const data = await response.json()

      // Store JWT token
      localStorage.setItem("area-token", data.token)

      // Set user state
      setUser({
        id: data.id,
        email: data.email,
        name: data.name
      })

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
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        if (response.status === 409) {
          console.error('Email already exists')
        }
        return false
      }

      const data = await response.json()

      // Store JWT token
      localStorage.setItem("area-token", data.token)

      // Set user state
      setUser({
        id: data.id,
        email: data.email,
        name: name // Use the name from the form since backend doesn't store it yet
      })

      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("area-token")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
