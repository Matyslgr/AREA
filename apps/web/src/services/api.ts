const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8080"

interface ApiError {
  message: string
  statusCode?: number
}

export class ApiClient {
  private baseUrl: string
  private token: string | null

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem("area-token")
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem("area-token", token)
    } else {
      localStorage.removeItem("area-token")
    }
  }

  getToken(): string | null {
    return this.token
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    const url = `${this.baseUrl}${endpoint}`

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "An error occurred",
        }))
        throw {
          message: errorData.message || `HTTP error ${response.status}`,
          statusCode: response.status,
        } as ApiError
      }

      return await response.json()
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error
      }
      throw {
        message: "Network error. Please check your connection.",
      } as ApiError
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
