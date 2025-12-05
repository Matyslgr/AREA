import axios, { AxiosInstance } from 'axios';
import { IHttpClient, HttpRequestConfig } from '../interfaces/http.interface';

export class AxiosAdapter implements IHttpClient {
  protected client: AxiosInstance;

  constructor(baseURLOrInstance?: string | AxiosInstance) {
    if (typeof baseURLOrInstance === 'string' || baseURLOrInstance === undefined) {
      this.client = axios.create({ baseURL: baseURLOrInstance });
    } else {
      this.client = baseURLOrInstance;
    }
  }

  async get<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, {
      headers: config?.headers,
      params: config?.params,
    });
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, {
      headers: config?.headers,
      params: config?.params,
    });
    return response.data;
  }

  async put<T>(url: string, data?: unknown, config?: HttpRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, {
      headers: config?.headers,
      params: config?.params,
    });
    return response.data;
  }

  async delete<T>(url: string, config?: HttpRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, {
      headers: config?.headers,
      params: config?.params,
    });
    return response.data;
  }
}
