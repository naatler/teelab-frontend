import axios from 'axios';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
<<<<<<< HEAD
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// ✅ REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    const csrfToken = Cookies.get('XSRF-TOKEN');

    // Attach CSRF token for Laravel Sanctum
    if (csrfToken) {
      config.headers['X-XSRF-TOKEN'] = csrfToken;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

    // Only redirect to login for non-auth endpoints when 401/403
    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      Cookies.remove('token');
      localStorage.removeItem('auth-storage');

      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (!path.startsWith('/login') && !path.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
    }

=======
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
export default axiosInstance; 
=======
export default axiosInstance;
>>>>>>> 687640a364110c573b580e6a98b33ac2f5ffabb8
