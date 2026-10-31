import api from '../../services/api';

export const fetchAgentProfileApi = async (): Promise<any> => {
  const response = await api.get('/agent/profile');
  return response.data;
};

export const fetchAgentDashboardStatsApi = async (): Promise<any> => {
  const response = await api.get('/agent/dashboard-stats');
  return response.data;
};

export const fetchAssignedShopsApi = async (params?: { search?: string; status?: string }): Promise<any> => {
  const response = await api.get('/agent/shops', { params });
  return response.data;
};

export const fetchShopDetailsApi = async (id: string): Promise<any> => {
  const response = await api.get(`/agent/shops/${id}`);
  return response.data;
};

export const updateShopProfileApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/agent/shops/${id}/profile`, data);
  return response.data;
};

export const updateShopOnboardingApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/agent/shops/${id}/onboarding`, data);
  return response.data;
};

export const fetchAgentAppointmentsApi = async (params?: { businessId?: string; status?: string; date?: string }): Promise<any> => {
  const response = await api.get('/agent/appointments', { params });
  return response.data;
};

export const updateAgentAppointmentStatusApi = async (appointmentId: string, status: string): Promise<any> => {
  const response = await api.put(`/agent/appointments/${appointmentId}/status`, { status });
  return response.data;
};

export const fetchAgentPlansApi = async (): Promise<any> => {
  const response = await api.get('/agent/plans');
  return response.data;
};

export const agentCreateDemoApi = async (id: string, meetLink: string): Promise<any> => {
  const response = await api.post(`/agent/shops/${id}/create-demo`, { meetLink });
  return response.data;
};

export const agentMarkDemoConductedApi = async (id: string): Promise<any> => {
  const response = await api.put(`/agent/shops/${id}/mark-demo-conducted`);
  return response.data;
};

export const agentApproveShopApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/agent/shops/${id}/approve`, data);
  return response.data;
};

export const agentRejectShopApi = async (id: string, reason: string): Promise<any> => {
  const response = await api.put(`/agent/shops/${id}/reject`, { reason });
  return response.data;
};

export const agentRequestShopChangesApi = async (id: string, note: string): Promise<any> => {
  const response = await api.put(`/agent/shops/${id}/request-changes`, { note });
  return response.data;
};

export const agentActivateTrialApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/agent/shops/${id}/activate-trial`, data);
  return response.data;
};

export const agentGeneratePaymentLinkApi = async (id: string, paymentBreakdown: any): Promise<any> => {
  const response = await api.post(`/agent/shops/${id}/generate-payment-link`, { paymentBreakdown });
  return response.data;
};

export const registerShopByAgentApi = async (data: any): Promise<any> => {
  const response = await api.post('/agent/shops/register', data);
  return response.data;
};

export const deleteShopByAgentApi = async (id: string): Promise<any> => {
  const response = await api.delete(`/agent/shops/${id}`);
  return response.data;
};


