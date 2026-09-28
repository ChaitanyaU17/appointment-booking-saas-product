import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const publicExactRoutes = ['/login', '/register', '/superadmin/login', '/', '/contact-sales', '/help-center', '/security', '/integrations'];
      const isPublicRoute = 
        publicExactRoutes.includes(window.location.pathname) || 
        window.location.pathname.startsWith('/b/') ||
        window.location.pathname.startsWith('/pay/');
        
      if (!isPublicRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
