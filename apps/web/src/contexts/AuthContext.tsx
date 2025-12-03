/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react"

interface User {
  email: string
  name: string
}

// Interface locale pour typer les données brutes du localStorage
interface StoredUser extends User {
  password?: string
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
  const [user, setUser] = useState<User | null>(() => {
    // Check if we are in a browser environment first (for SSR safety)
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("area-user");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo authentication - in production, this would call your API
    try {
      const storedUsers = localStorage.getItem("area-users")
      const users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []

      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      )

      if (foundUser) {
        const userData = { email: foundUser.email, name: foundUser.name }
        setUser(userData)
        localStorage.setItem("area-user", JSON.stringify(userData))
        return true
      }

      return false
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
    // Demo registration - in production, this would call your API
    try {
      const storedUsers = localStorage.getItem("area-users")
      const users: StoredUser[] = storedUsers ? JSON.parse(storedUsers) : []

      // Check if user already exists
      if (users.find((u) => u.email === email)) {
        return false
      }

      // Add new user
      const newUser = { email, name, password }
      users.push(newUser)
      localStorage.setItem("area-users", JSON.stringify(users))

      // Auto-login after signup
      const userData = { email, name }
      setUser(userData)
      localStorage.setItem("area-user", JSON.stringify(userData))

      return true
    } catch (error) {
      console.error("Signup error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("area-user")
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