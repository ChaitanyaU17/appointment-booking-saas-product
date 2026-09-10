import api from '../../services/api';

export const fetchBusinessDashboardApi = async (): Promise<any> => {
  const response = await api.get('/business/dashboard');
  return response.data;
};

export const fetchBusinessSettingsApi = async (): Promise<any> => {
  const response = await api.get('/business/settings');
  return response.data;
};

export const updateBusinessSettingsApi = async (data: any): Promise<any> => {
  const response = await api.put('/business/settings', data);
  return response.data;
};

export const resubmitVerificationApi = async (data: any): Promise<any> => {
  const response = await api.put('/business/resubmit', data);
  return response.data;
};

export const connectGoogleCalendarApi = async (): Promise<any> => {
  const response = await api.get('/auth/google');
  return response.data;
};

export const updateBusinessPlanApi = async (planId: string): Promise<any> => {
  const response = await api.put('/business/settings/plan', { planId });
  return response.data;
};

export const fetchServicesApi = async (): Promise<any> => {
  const response = await api.get('/business/services');
  return response.data;
};

export const createServiceApi = async (data: any): Promise<any> => {
  const response = await api.post('/business/services', data);
  return response.data;
};

export const updateServiceApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/business/services/${id}`, data);
  return response.data;
};

export const deleteServiceApi = async (id: string): Promise<any> => {
  const response = await api.delete(`/business/services/${id}`);
  return response.data;
};
