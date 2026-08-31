import api from '../../services/api';

export const fetchCustomerAppointmentsApi = async (): Promise<any> => {
  const response = await api.get('/customer/appointments');
  return response.data;
};

export const cancelCustomerAppointmentApi = async (id: string): Promise<any> => {
  const response = await api.put(`/customer/appointments/${id}/cancel`);
  return response.data;
};
