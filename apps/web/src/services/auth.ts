import { api } from "@/lib/api"

export interface User {
  id?: string
  email: string
  username: string
  name?: string // For backwards compatibility
}

export interface AuthResponse {
  user: User
  token: string
}

export interface SignupData {
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export const authService = {
  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/signup", data)
      localStorage.setItem("area-token", response.token)
      return response
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Signup failed")
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/signin", data)
      localStorage.setItem("area-token", response.token)
      return response
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Login failed")
    }
  },

  async logout(): Promise<void> {
    localStorage.removeItem("area-token")
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = localStorage.getItem("area-token")
      if (!token) return null

      const user = await api.get<User>("/auth/account")
      return user
    } catch (error) {
      // Don't clear token automatically - let the user explicitly logout
      // This prevents token from being cleared during OAuth callback flow
      console.warn("Failed to get current user:", error)
      return null
    }
  },

  getStoredToken(): string | null {
    return localStorage.getItem("area-token")
  },
}
