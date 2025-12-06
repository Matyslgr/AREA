import { AxiosAdapter } from '@area/shared';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('area-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class FrontendHttpAdapter extends AxiosAdapter {
  private instance: typeof axiosInstance;

  constructor() {
    super(axiosInstance);
    this.instance = axiosInstance;
  }

  async get<T>(url: string): Promise<T> {
    return super.get<T>(url);
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    return super.post<T>(url, data);
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    return super.put<T>(url, data);
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.instance.patch(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    return super.delete<T>(url);
  }
}

export const api = new FrontendHttpAdapter();