import api from '../../services/api';

export const loginApi = async (data: any): Promise<any> => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const googleLoginApi = async (stateParams: string): Promise<any> => {
  const response = await api.get(`/auth/google?state=${stateParams}`);
  return response.data;
};

export const fetchSessionApi = async (): Promise<any> => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logoutApi = async (): Promise<any> => {
  const response = await api.post('/auth/logout');
  return response.data;
};
