import api from '../../services/api';

export const fetchPlansApi = async (): Promise<any> => {
  const response = await api.get('/superadmin/plans');
  return response.data;
};

export const createPlanApi = async (data: any): Promise<any> => {
  const response = await api.post('/superadmin/plans', data);
  return response.data;
};

export const updatePlanApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/superadmin/plans/${id}`, data);
  return response.data;
};

export const deletePlanApi = async (id: string): Promise<any> => {
  const response = await api.delete(`/superadmin/plans/${id}`);
  return response.data;
};

export const togglePlanApi = async (id: string): Promise<any> => {
  const response = await api.put(`/superadmin/plans/${id}/toggle`);
  return response.data;
};
