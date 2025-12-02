import axios, { AxiosInstance } from 'axios';
import { IHttpClient, HttpRequestConfig } from '../interfaces/http.interface';

export class AxiosAdapter implements IHttpClient {
  private client: AxiosInstance;

  constructor(baseURL?: string) {
    this.client = axios.create({ baseURL });
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
}