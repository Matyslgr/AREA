import { apiClient } from "./api"

export interface User {
  id?: string
  email: string
  name: string
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
      const response = await apiClient.post<AuthResponse>("/auth/signup", data)
      apiClient.setToken(response.token)
      return response
    } catch (error: any) {
      throw new Error(error.message || "Signup failed")
    }
  },

  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/signin", data)
      apiClient.setToken(response.token)
      return response
    } catch (error: any) {
      throw new Error(error.message || "Login failed")
    }
  },

  async logout(): Promise<void> {
    apiClient.setToken(null)
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = apiClient.getToken()
      if (!token) return null

      const user = await apiClient.get<User>("/auth/me")
      return user
    } catch (error) {
      // If token is invalid, clear it
      apiClient.setToken(null)
      return null
    }
  },

  getStoredToken(): string | null {
    return apiClient.getToken()
  },
}
