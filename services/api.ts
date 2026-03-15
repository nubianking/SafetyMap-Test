// ============================================================================
// API SERVICE - Centralized fetch wrapper with auth error handling
// ============================================================================

export interface ApiError extends Error {
  status?: number;
  data?: any;
}

/**
 * Creates an API error with status code information
 */
const createApiError = (message: string, status?: number, data?: any): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.data = data;
  return error;
};

/**
 * Clears auth data and redirects to login page
 */
export const forceReLogin = (reason: string = 'session_expired'): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = `/login?reason=${reason}`;
};

/**
 * Check if error is an authentication/permission error that requires re-login
 */
const isAuthError = (status: number, errorData?: any): boolean => {
  // 401 - Unauthorized (token expired/invalid)
  // 403 - Forbidden (permissions issue, possibly invalid token signature)
  if (status === 401) return true;
  if (status === 403) {
    // Check if it's a permission/session related 403
    const errorMessage = errorData?.error || errorData?.message || '';
    const permissionKeywords = [
      'permission',
      'forbidden',
      'unauthorized',
      'invalid token',
      'signature',
      'jwt',
      'auth'
    ];
    return permissionKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  return false;
};

/**
 * Fetch wrapper with auth error handling
 * 
 * Automatically handles:
 * - 401/403 errors by clearing auth and redirecting to login
 * - JSON parsing
 * - Error formatting
 * 
 * @param url - Request URL
 * @param options - Fetch options
 * @returns Promise with parsed JSON response
 * 
 * @example
 * ```typescript
 * const data = await apiFetch('/api/v1/protected/resource');
 * ```
 */
export const apiFetch = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  // Get auth token if available
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  
  // Prepare headers with auth
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };
  
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Handle non-OK responses
    if (!response.ok) {
      let errorData: any = {};
      
      try {
        errorData = await response.json();
      } catch {
        // Response body might not be JSON
        errorData = { error: response.statusText };
      }
      
      // Check if this is an auth error that requires re-login
      if (isAuthError(response.status, errorData)) {
        console.warn(`[API] Auth error (${response.status}): ${errorData.error || response.statusText}`);
        forceReLogin('session_expired');
      }
      
      throw createApiError(
        errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }
    
    // Handle empty responses (204 No Content, etc.)
    if (response.status === 204) {
      return undefined as T;
    }
    
    return await response.json() as T;
    
  } catch (error: any) {
    // Re-throw API errors (already processed)
    if (error.status) {
      throw error;
    }
    
    // Network or other errors
    throw createApiError(
      error.message || 'Network error',
      0,
      { originalError: error }
    );
  }
};

/**
 * GET request helper
 */
export const apiGet = <T = any>(url: string, options?: RequestInit): Promise<T> => {
  return apiFetch<T>(url, { ...options, method: 'GET' });
};

/**
 * POST request helper
 */
export const apiPost = <T = any>(url: string, body: any, options?: RequestInit): Promise<T> => {
  return apiFetch<T>(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(body)
  });
};

/**
 * PUT request helper
 */
export const apiPut = <T = any>(url: string, body: any, options?: RequestInit): Promise<T> => {
  return apiFetch<T>(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(body)
  });
};

/**
 * PATCH request helper
 */
export const apiPatch = <T = any>(url: string, body: any, options?: RequestInit): Promise<T> => {
  return apiFetch<T>(url, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(body)
  });
};

/**
 * DELETE request helper
 */
export const apiDelete = <T = any>(url: string, options?: RequestInit): Promise<T> => {
  return apiFetch<T>(url, { ...options, method: 'DELETE' });
};

/**
 * Response interceptor for existing fetch calls
 * Use this to wrap existing fetch calls with auth error handling
 * 
 * @param response - Fetch Response object
 * @returns Original response or throws error after handling auth
 */
export const handleApiResponse = async <T = any>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorData: any = {};
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    
    // Check if this is an auth error that requires re-login
    if (isAuthError(response.status, errorData)) {
      console.warn(`[API] Auth error (${response.status}): ${errorData.error || response.statusText}`);
      forceReLogin('session_expired');
    }
    
    throw createApiError(
      errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData
    );
  }
  
  if (response.status === 204) {
    return undefined as T;
  }
  
  return await response.json() as T;
};
