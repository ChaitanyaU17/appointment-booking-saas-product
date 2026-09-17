import api from '../../services/api';

export const fetchSuperadminDashboardApi = async (): Promise<any> => {
  const response = await api.get('/superadmin/dashboard');
  return response.data;
};

export const fetchBusinessesApi = async (): Promise<any> => {
  const response = await api.get('/superadmin/businesses');
  return response.data;
};

export const createBusinessApi = async (data: any): Promise<any> => {
  const response = await api.post('/superadmin/businesses', data);
  return response.data;
};

export const updateBusinessApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/superadmin/businesses/${id}`, data);
  return response.data;
};

export const deleteBusinessApi = async (id: string): Promise<any> => {
  const response = await api.delete(`/superadmin/businesses/${id}`);
  return response.data;
};

export const fetchAdminsApi = async (): Promise<any> => {
  const response = await api.get('/superadmin/admins');
  return response.data;
};

export const createAdminApi = async (data: any): Promise<any> => {
  const response = await api.post('/superadmin/admins', data);
  return response.data;
};

export const updateAdminApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/superadmin/admins/${id}`, data);
  return response.data;
};

export const deleteAdminApi = async (id: string): Promise<any> => {
  const response = await api.delete(`/superadmin/admins/${id}`);
  return response.data;
};

export const approveBusinessApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/superadmin/businesses/${id}/approve`, data);
  return response.data;
};

export const rejectBusinessApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/superadmin/businesses/${id}/reject`, data);
  return response.data;
};

export const requestChangesBusinessApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/superadmin/businesses/${id}/request-changes`, data);
  return response.data;
};

export const activateTrialApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/superadmin/businesses/${id}/activate-trial`, data);
  return response.data;
};

export const createDemoForRegistrationApi = async (id: string, data: { meetLink?: string }): Promise<any> => {
  const response = await api.post(`/superadmin/businesses/${id}/create-demo`, data);
  return response.data;
};

export const markDemoConductedApi = async (id: string): Promise<any> => {
  const response = await api.put(`/superadmin/businesses/${id}/mark-demo-conducted`);
  return response.data;
};

export const fetchDemoRequestsApi = async (): Promise<any> => {
  const response = await api.get('/superadmin/demo-requests');
  return response.data;
};

export const approveDemoRequestApi = async (id: string, data?: { meetLink?: string }): Promise<any> => {
  const response = await api.put(`/superadmin/demo-requests/${id}/approve`, data);
  return response.data;
};

export const rejectDemoRequestApi = async (id: string): Promise<any> => {
  const response = await api.put(`/superadmin/demo-requests/${id}/reject`);
  return response.data;
};

export const deleteDemoRequestApi = async (id: string): Promise<any> => {
  const response = await api.delete(`/superadmin/demo-requests/${id}`);
  return response.data;
};
