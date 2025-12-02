export interface HttpRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
}

export interface IHttpClient {
  get<T>(url: string, config?: HttpRequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T>;
}
