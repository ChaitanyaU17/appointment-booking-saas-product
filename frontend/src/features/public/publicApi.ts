import api from '../../services/api';

export const fetchPublicBusinessApi = async (slug: string): Promise<any> => {
  const response = await api.get(`/public/business/${slug}`);
  return response.data;
};

export const fetchPublicSlotsApi = async (slug: string, dateStr: string): Promise<any> => {
  const response = await api.get(`/public/business/${slug}/slots?date=${dateStr}`);
  return response.data;
};

export const fetchMyAppointmentsApi = async (slug: string): Promise<any> => {
  const response = await api.get(`/public/business/${slug}/my-appointments`);
  return response.data;
};

export const bookAppointmentApi = async (slug: string, data: any): Promise<any> => {
  const response = await api.post(`/public/business/${slug}/book`, data);
  return response.data;
};

export const publicGoogleLoginApi = async (slug: string): Promise<any> => {
  const response = await api.get(`/auth/google?state=/b/${slug}`);
  return response.data;
};

export const fetchPublicPlansApi = async (): Promise<any> => {
  const response = await api.get('/public/plans');
  return response.data;
};

export const createDemoRequestApi = async (data: any): Promise<any> => {
  const response = await api.post('/public/demo-request', data);
  return response.data;
};
