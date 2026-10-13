/**
 * API Service Client for SnipURL
 * 
 * SECURITY ARCHITECTURE & TRADEOFF NOTE:
 * ============================================================================
 * Token Strategy: Bearer JWT in Authorization Header with Local Storage.
 * - Why used: The backend REST API uses stateless Bearer JWT verification.
 * - Trade-offs:
 *   * Advantages: Works seamlessly across modern client-side architectures,
 *     does not require cross-site cookie configuration or CSRF token handling.
 *   * Vulnerabilities: Storage in localStorage is accessible to client scripts,
 *     so protection against Cross-Site Scripting (XSS) is mandatory.
 *   * Safeguards implemented:
 *     1. Tokens are NEVER included in URLs or query strings.
 *     2. Tokens are NEVER printed to browser logs or error trackers.
 *     3. Expired or invalid tokens trigger immediate cleanup and re-authentication.
 *   * Production Recommendation: For maximum defense-in-depth against XSS,
 *     migrating to SameSite=Strict HttpOnly session cookies with CSRF tokens
 *     can be enabled on the backend.
 * ============================================================================
 */

const rawBaseUrl = (import.meta.env?.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
const API_BASE_URL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl}/api`;
const TOKEN_KEY = 'snipurl_auth_token';

// Listeners for global session expiration
const authStateListeners = new Set();

export function onSessionExpired(callback) {
  authStateListeners.add(callback);
  return () => authStateListeners.delete(callback);
}

function notifySessionExpired() {
  clearAuthToken();
  for (const listener of authStateListeners) {
    try {
      listener();
    } catch (err) {
      // Avoid breaking flow
    }
  }
}

// Token Storage Helpers
export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (err) {
    // Local storage unavailable (private browsing quota)
  }
}

export function clearAuthToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Centralized fetch request wrapper with error normalization and auth header injection
 */
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getAuthToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (networkError) {
    throw new Error('API server is unreachable. Please check your internet connection or ensure the server is running.');
  }

  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    // 401 Unauthorized / Expired token handler
    if (response.status === 401 && !endpoint.includes('/login') && !endpoint.includes('/register')) {
      notifySessionExpired();
      const message = data?.error || 'Your session has expired. Please log in again.';
      throw new Error(message);
    }

    const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Auth API Methods
export const authAPI = {
  async register({ name, email, password }) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async login({ email, password }) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (data?.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async getMe() {
    return await request('/auth/me', {
      method: 'GET'
    });
  },

  logout() {
    clearAuthToken();
  }
};

// URL API Methods
export const urlAPI = {
  async createShortUrl({ originalUrl }) {
    return await request('/urls', {
      method: 'POST',
      body: JSON.stringify({ originalUrl })
    });
  },

  async getMyUrls() {
    return await request('/urls/user/my-urls', {
      method: 'GET'
    });
  },

  async deleteUrl(id) {
    return await request(`/urls/${id}`, {
      method: 'DELETE'
    });
  },

  async getUrlAnalytics(id) {
    return await request(`/urls/${id}/analytics`, {
      method: 'GET'
    });
  },

  async getUrlById(id) {
    return await request(`/urls/id/${id}`, {
      method: 'GET'
    });
  }
};

export default {
  auth: authAPI,
  url: urlAPI,
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  onSessionExpired
};
