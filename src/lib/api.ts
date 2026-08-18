// API Client with authentication
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const body = await response.text();
  let parsedBody: unknown;

  if (body.trim()) {
    try {
      parsedBody = JSON.parse(body);
    } catch {
      if (!response.ok) throw new Error(body || `API Error: ${response.status}`);
      throw new Error(`Invalid response from ${endpoint}. Please refresh and try again.`);
    }
  }

  if (!response.ok) {
    const error = parsedBody as { message?: string; error?: string } | undefined;
    throw new Error(error?.message || error?.error || `API Error: ${response.status}`);
  }

  // A successful DELETE may deliberately return 204 No Content.
  return parsedBody as T;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
  upload: async <T>(endpoint: string, formData: FormData) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {};
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });
    const body = await response.text();
    let parsedBody: unknown;
    if (body.trim()) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        if (!response.ok) throw new Error(body || 'Upload failed');
        throw new Error('Upload returned an invalid response. Please try again.');
      }
    }
    if (!response.ok) {
      const error = parsedBody as { message?: string; error?: string } | undefined;
      throw new Error(error?.message || error?.error || 'Upload failed');
    }
    return parsedBody as T;
  },
};
