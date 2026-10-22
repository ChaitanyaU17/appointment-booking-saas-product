import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicExactRoutes = ['/login', '/register', '/superadmin/login', '/agent/login', '/', '/contact-sales', '/help-center', '/security', '/integrations'];
      const isPublicRoute = 
        publicExactRoutes.includes(window.location.pathname) || 
        window.location.pathname.startsWith('/b/') ||
        window.location.pathname.startsWith('/pay/');
        
      if (!isPublicRoute) {
        if (window.location.pathname.startsWith('/agent')) {
          window.location.href = '/agent/login';
        } else if (window.location.pathname.startsWith('/superadmin')) {
          window.location.href = '/superadmin/login';
        } else {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
