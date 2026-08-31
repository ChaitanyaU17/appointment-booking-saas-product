import api from '../../services/api';

export const fetchAppointmentsApi = async (query: string): Promise<any> => {
  const response = await api.get(`/business/appointments?${query}`);
  return response.data;
};

export const createAppointmentApi = async (data: any): Promise<any> => {
  const response = await api.post('/business/appointments', data);
  return response.data;
};

export const updateAppointmentStatusApi = async (id: string, status: string): Promise<any> => {
  const response = await api.put(`/business/appointments/${id}/status`, { status });
  return response.data;
};

export const recordPaymentApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/business/appointments/${id}/payment`, data);
  return response.data;
};
