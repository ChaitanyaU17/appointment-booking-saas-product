import api from '../../services/api';

const isAgentRole = () => {
  try {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/agent')) {
      return true;
    }
    const u = JSON.parse(localStorage.getItem('user') || '{}');
    return u?.role === 'Agent';
  } catch {
    return false;
  }
};

export const fetchSuperadminDashboardApi = async (): Promise<any> => {
  const response = await api.get('/superadmin/dashboard');
  return response.data;
};

export const fetchBusinessesApi = async (): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.get('/agent/shops');
    return response.data;
  }
  const response = await api.get('/superadmin/businesses');
  return response.data;
};

export const createBusinessApi = async (data: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.post('/agent/shops/register', data);
    return response.data;
  }
  const response = await api.post('/superadmin/businesses', data);
  return response.data;
};

export const registerBusinessByAdminApi = async (data: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.post('/agent/shops/register', data);
    return response.data;
  }
  const response = await api.post('/superadmin/register-business', data);
  return response.data;
};

export const updateBusinessApi = async (id: string, data: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.put(`/agent/shops/${id}/profile`, data);
    return response.data;
  }
  const response = await api.put(`/superadmin/businesses/${id}`, data);
  return response.data;
};

export const deleteBusinessApi = async (id: string): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.delete(`/agent/shops/${id}`);
    return response.data;
  }
  const response = await api.delete(`/superadmin/businesses/${id}`);
  return response.data;
};

export const fetchPaymentsApi = async (): Promise<any> => {
  const response = await api.get('/superadmin/payments');
  return response.data;
};

export const fetchAdminsApi = async (): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.get('/agent/admins');
    return response.data;
  }
  const response = await api.get('/superadmin/admins');
  return response.data;
};

export const createAdminApi = async (data: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.post('/agent/admins', data);
    return response.data;
  }
  const response = await api.post('/superadmin/admins', data);
  return response.data;
};

export const updateAdminApi = async (id: string, data: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.put(`/agent/admins/${id}`, data);
    return response.data;
  }
  const response = await api.put(`/superadmin/admins/${id}`, data);
  return response.data;
};

export const deleteAdminApi = async (id: string): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.delete(`/agent/admins/${id}`);
    return response.data;
  }
  const response = await api.delete(`/superadmin/admins/${id}`);
  return response.data;
};

export const approveBusinessApi = async (id: string, data?: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.put(`/agent/shops/${id}/approve`, data);
    return response.data;
  }
  const response = await api.put(`/superadmin/businesses/${id}/approve`, data);
  return response.data;
};

export const rejectBusinessApi = async (id: string, data?: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.put(`/agent/shops/${id}/reject`, data);
    return response.data;
  }
  const response = await api.put(`/superadmin/businesses/${id}/reject`, data);
  return response.data;
};

export const requestChangesBusinessApi = async (id: string, data?: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.put(`/agent/shops/${id}/request-changes`, data);
    return response.data;
  }
  const response = await api.put(`/superadmin/businesses/${id}/request-changes`, data);
  return response.data;
};

export const activateTrialApi = async (id: string, data?: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.put(`/agent/shops/${id}/activate-trial`, data);
    return response.data;
  }
  const response = await api.put(`/superadmin/businesses/${id}/activate-trial`, data);
  return response.data;
};

export const createDemoForRegistrationApi = async (id: string, data?: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.post(`/agent/shops/${id}/create-demo`, data);
    return response.data;
  }
  const response = await api.post(`/superadmin/businesses/${id}/create-demo`, data);
  return response.data;
};

export const markDemoConductedApi = async (id: string): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.put(`/agent/shops/${id}/mark-demo-conducted`);
    return response.data;
  }
  const response = await api.put(`/superadmin/businesses/${id}/mark-demo-conducted`);
  return response.data;
};

export const fetchDemoRequestsApi = async (): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.get('/agent/demo-requests');
    return response.data;
  }
  const response = await api.get('/superadmin/demo-requests');
  return response.data;
};

export const approveDemoRequestApi = async (id: string, data?: any): Promise<any> => {
  const response = await api.put(`/superadmin/demo-requests/${id}/approve`, data);
  return response.data;
};

export const rejectDemoRequestApi = async (id: string, data?: any): Promise<any> => {
  const response = await api.put(`/superadmin/demo-requests/${id}/reject`, data);
  return response.data;
};

export const deleteDemoRequestApi = async (id: string): Promise<any> => {
  const response = await api.delete(`/superadmin/demo-requests/${id}`);
  return response.data;
};

export const generatePaymentLinkApi = async (id: string, paymentBreakdown: any): Promise<any> => {
  if (isAgentRole()) {
    const response = await api.post(`/agent/shops/${id}/generate-payment-link`, { paymentBreakdown });
    return response.data;
  }
  const response = await api.post(`/superadmin/businesses/${id}/generate-payment-link`, { paymentBreakdown });
  return response.data;
};

export const fetchAgentsApi = async (): Promise<any> => {
  const response = await api.get('/superadmin/agents');
  return response.data;
};

export const fetchAgentByIdApi = async (id: string): Promise<any> => {
  const response = await api.get(`/superadmin/agents/${id}`);
  return response.data;
};

export const createAgentApi = async (data: any): Promise<any> => {
  const response = await api.post('/superadmin/agents', data);
  return response.data;
};

export const updateAgentApi = async (id: string, data: any): Promise<any> => {
  const response = await api.put(`/superadmin/agents/${id}`, data);
  return response.data;
};

export const deleteAgentApi = async (id: string): Promise<any> => {
  const response = await api.delete(`/superadmin/agents/${id}`);
  return response.data;
};

export const fetchSuperadminAppointmentsApi = async (params?: any): Promise<any> => {
  const response = await api.get('/superadmin/appointments', { params });
  return response.data;
};

export const fetchSuperadminNotificationsApi = async (params?: any): Promise<any> => {
  const response = await api.get('/superadmin/notifications', { params });
  return response.data;
};

export const markNotificationReadApi = async (id: string): Promise<any> => {
  const response = await api.put(`/superadmin/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsReadApi = async (): Promise<any> => {
  const response = await api.put('/superadmin/notifications/mark-all-read');
  return response.data;
};

export const clearNotificationsApi = async (): Promise<any> => {
  const response = await api.delete('/superadmin/notifications/clear');
  return response.data;
};
