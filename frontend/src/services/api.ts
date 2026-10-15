import { encryptPassword, clearCachedPublicKey } from './crypto';

const envUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL =
  envUrl && (!import.meta.env.PROD || !envUrl.includes('localhost'))
    ? envUrl
    : (import.meta.env.DEV ? 'http://localhost:5000' : '');

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  user?: User;
  data?: T;
}

/**
 * Custom fetch wrapper with credentials enabled for secure HTTP-only cookies.
 */
async function fetchWithCredentials<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Essential for sending and receiving HTTP-only cookies
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: 'An unexpected response was received from the server.',
  }));

  if (!response.ok) {
    if (data.message && data.message.toLowerCase().includes('encryption')) {
      clearCachedPublicKey();
    }
    const error: any = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  /**
   * Registers a new account with end-to-end encrypted password.
   */
  async register(email: string, username: string, plainPassword: string): Promise<ApiResponse> {
    const encryptedPassword = await encryptPassword(plainPassword, API_BASE_URL);

    return fetchWithCredentials<ApiResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email,
        username,
        password: encryptedPassword,
      }),
    });
  },

  /**
   * Logs in a user with end-to-end encrypted password using email.
   */
  async login(email: string, plainPassword: string): Promise<ApiResponse> {
    const encryptedPassword = await encryptPassword(plainPassword, API_BASE_URL);

    return fetchWithCredentials<ApiResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        emailOrUsername: email,
        password: encryptedPassword,
      }),
    });
  },

  /**
   * Ends user session and clears the cookie.
   */
  async logout(): Promise<ApiResponse> {
    return fetchWithCredentials<ApiResponse>('/api/auth/logout', {
      method: 'POST',
    });
  },

  /**
   * Retrieves the current authenticated user from cookie session.
   */
  async getMe(): Promise<{ success: boolean; user: User }> {
    return fetchWithCredentials<{ success: boolean; user: User }>('/api/auth/me', {
      method: 'GET',
    });
  },
};
