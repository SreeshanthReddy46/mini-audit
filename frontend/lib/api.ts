import { getStoredToken } from './auth';

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:8000`;
  }
  return 'http://localhost:8000';
}

class ApiClient {
  private getHeaders(isMultipart = false): HeadersInit {
    const headers: Record<string, string> = {};
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let message = 'An error occurred';
      try {
        const errorData = await res.json();
        message = errorData.detail || errorData.message || message;
      } catch {
        message = res.statusText || message;
      }
      throw new Error(message);
    }
    return res.json();
  }

  async get<T>(path: string): Promise<T> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(path: string, body?: any): Promise<T> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    return this.handleResponse<T>(res);
  }

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      credentials: 'include',
      body: formData,
    });
    return this.handleResponse<T>(res);
  }

  getFileUrl(path: string): string {
    const baseUrl = getBaseUrl();
    return `${baseUrl}${path}`;
  }

  async getFileBlob(path: string): Promise<Blob> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Failed to fetch file');
    }
    return res.blob();
  }

  async downloadFile(path: string, filename: string): Promise<void> {
    const baseUrl = getBaseUrl();
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('Failed to download file');
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const api = new ApiClient();
