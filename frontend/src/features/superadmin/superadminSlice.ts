import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  fetchSuperadminDashboardApi, fetchBusinessesApi, fetchPaymentsApi, createBusinessApi, updateBusinessApi, deleteBusinessApi,
  registerBusinessByAdminApi,
  fetchAdminsApi, createAdminApi, updateAdminApi, deleteAdminApi,
  approveBusinessApi, rejectBusinessApi, requestChangesBusinessApi,
  activateTrialApi,
  createDemoForRegistrationApi, markDemoConductedApi,
  fetchDemoRequestsApi, approveDemoRequestApi, rejectDemoRequestApi, deleteDemoRequestApi,
  generatePaymentLinkApi,
  fetchAgentsApi, fetchAgentByIdApi, createAgentApi, updateAgentApi, deleteAgentApi,
  fetchSuperadminAppointmentsApi,
  fetchSuperadminNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi, clearNotificationsApi
} from "./superadminApi";
import {
  fetchPlansApi, createPlanApi, updatePlanApi, deletePlanApi, togglePlanApi
} from "./planApi";

interface ISuperadminState {
  dashboardData: any;
  dashboardLoading: boolean;
  dashboardError: any;
  
  businesses: any[];
  payments: any[];
  paymentsLoading: boolean;
  paymentsError: any;
  businessesLoading: boolean;
  businessesError: any;
  
  admins: any[];
  adminsLoading: boolean;
  adminsError: any;

  agents: any[];
  agentsLoading: boolean;
  agentsError: any;
  currentAgent: any;
  currentAgentLoading: boolean;

  plans: any[];
  plansLoading: boolean;
  plansError: any;

  demoRequests: any[];
  demoRequestsLoading: boolean;
  demoRequestsError: any;

  appointments: any[];
  appointmentsLoading: boolean;
  appointmentsError: any;
  appointmentsTotal: number;
  appointmentsStats: any;

  notifications: any[];
  notificationsTotal: number;
  unreadNotificationsCount: number;
  notificationsLoading: boolean;
  notificationsHasMore: boolean;
}

const initialState: ISuperadminState = {
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,
  
  notifications: [],
  notificationsTotal: 0,
  unreadNotificationsCount: 0,
  notificationsLoading: false,
  notificationsHasMore: false,

  businesses: [],
  payments: [],
  paymentsLoading: false,
  paymentsError: null,
  businessesLoading: false,
  businessesError: null,
  
  admins: [],
  adminsLoading: false,
  adminsError: null,

  agents: [],
  agentsLoading: false,
  agentsError: null,
  currentAgent: null,
  currentAgentLoading: false,

  plans: [],
  plansLoading: false,
  plansError: null,

  demoRequests: [],
  demoRequestsLoading: false,
  demoRequestsError: null,

  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,
  appointmentsTotal: 0,
  appointmentsStats: null,
};


export const fetchPayments = createAsyncThunk(
  'superadmin/fetchPayments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchPaymentsApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payments');
    }
  }
);
export const fetchSuperadminDashboard = createAsyncThunk(
  'superadmin/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchSuperadminDashboardApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchBusinesses = createAsyncThunk(
  'superadmin/fetchBusinesses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchBusinessesApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const createBusiness = createAsyncThunk(
  'superadmin/createBusiness',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await createBusinessApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const registerBusinessByAdmin = createAsyncThunk(
  'superadmin/registerBusinessByAdmin',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await registerBusinessByAdminApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const updateBusiness = createAsyncThunk(
  'superadmin/updateBusiness',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await updateBusinessApi(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const deleteBusiness = createAsyncThunk(
  'superadmin/deleteBusiness',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteBusinessApi(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const approveBusiness = createAsyncThunk(
  'superadmin/approveBusiness',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await approveBusinessApi(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve business');
    }
  }
);

export const rejectBusiness = createAsyncThunk(
  'superadmin/rejectBusiness',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await rejectBusinessApi(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject business');
    }
  }
);

export const requestChangesBusiness = createAsyncThunk(
  'superadmin/requestChangesBusiness',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await requestChangesBusinessApi(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request changes');
    }
  }
);


export const activateTrial = createAsyncThunk(
  "superadmin/activateTrial",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await activateTrialApi(id, data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to activate trial");
    }
  }
);

export const createDemoForRegistration = createAsyncThunk(
  "superadmin/createDemoForRegistration",
  async (payload: { id: string, data: { meetLink?: string } }, { rejectWithValue }) => {
    try {
      const data = await createDemoForRegistrationApi(payload.id, payload.data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create demo");
    }
  }
);

export const markDemoConducted = createAsyncThunk(
  "superadmin/markDemoConducted",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await markDemoConductedApi(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark demo as conducted");
    }
  }
);

export const approveDemoRequest = createAsyncThunk(
  "superadmin/approveDemoRequest",
  async (payload: { id: string, meetLink?: string }, { rejectWithValue }) => {
    try {
      const data = await approveDemoRequestApi(payload.id, { meetLink: payload.meetLink });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to approve request");
    }
  }
);

export const fetchAdmins = createAsyncThunk(
  'superadmin/fetchAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAdminsApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const createAdmin = createAsyncThunk(
  'superadmin/createAdmin',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await createAdminApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const updateAdmin = createAsyncThunk(
  'superadmin/updateAdmin',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await updateAdminApi(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  'superadmin/deleteAdmin',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await deleteAdminApi(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchAgents = createAsyncThunk(
  'superadmin/fetchAgents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchAgentsApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchAgentById = createAsyncThunk(
  'superadmin/fetchAgentById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetchAgentByIdApi(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const createAgent = createAsyncThunk(
  'superadmin/createAgent',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await createAgentApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const updateAgent = createAsyncThunk(
  'superadmin/updateAgent',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await updateAgentApi(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const deleteAgent = createAsyncThunk(
  'superadmin/deleteAgent',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteAgentApi(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchSuperadminAppointments = createAsyncThunk(
  'superadmin/fetchAppointments',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await fetchSuperadminAppointmentsApi(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchSuperadminNotifications = createAsyncThunk(
  'superadmin/fetchNotifications',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const response = await fetchSuperadminNotificationsApi(params);
      return { ...response, append: params.page > 1 };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'superadmin/markNotificationAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await markNotificationReadApi(id);
      return { id, ...response };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'superadmin/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await markAllNotificationsReadApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const clearAllNotifications = createAsyncThunk(
  'superadmin/clearAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await clearNotificationsApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchPlans = createAsyncThunk(
  'superadmin/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchPlansApi();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const createPlan = createAsyncThunk(
  'superadmin/createPlan',
  async (data: any, { rejectWithValue }) => {
    try {
      return await createPlanApi(data);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const updatePlan = createAsyncThunk(
  'superadmin/updatePlan',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await updatePlanApi(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const deletePlan = createAsyncThunk(
  'superadmin/deletePlan',
  async (id: string, { rejectWithValue }) => {
    try {
      return await deletePlanApi(id);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const togglePlan = createAsyncThunk(
  'superadmin/togglePlan',
  async (id: string, { rejectWithValue }) => {
    try {
      return await togglePlanApi(id);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchDemoRequests = createAsyncThunk(
  'superadmin/fetchDemoRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchDemoRequestsApi();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const rejectDemoRequest = createAsyncThunk(
  'superadmin/rejectDemoRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      return await rejectDemoRequestApi(id);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const deleteDemoRequest = createAsyncThunk(
  'superadmin/deleteDemoRequest',
  async (id: string, { rejectWithValue }) => {
    try {
      return await deleteDemoRequestApi(id);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const generatePaymentLink = createAsyncThunk(
  'superadmin/generatePaymentLink',
  async ({ id, paymentBreakdown }: { id: string, paymentBreakdown: any }, { rejectWithValue }) => {
    try {
      return await generatePaymentLinkApi(id, paymentBreakdown);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

const superadminSlice = createSlice({
  name: "superadmin",
  initialState,
  reducers: {
    clearSuperadminState: (state) => {
      state.dashboardLoading = false;
      state.dashboardError = null;
      state.businessesLoading = false;
      state.businessesError = null;
      state.adminsLoading = false;
      state.adminsError = null;
      state.plansLoading = false;
      state.plansError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperadminDashboard.pending, (state) => {
        if (!state.dashboardData) {
          state.dashboardLoading = true;
        }
        state.dashboardError = null;
      })
      .addCase(fetchSuperadminDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchSuperadminDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      })

            .addCase(fetchPayments.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload as string;
      })
.addCase(fetchBusinesses.pending, (state) => {
        if (!state.businesses || state.businesses.length === 0) {
          state.businessesLoading = true;
        }
      })
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.businessesLoading = false;
        state.businesses = action.payload;
      })
      .addCase(fetchBusinesses.rejected, (state, action) => {
        state.businessesLoading = false;
        state.businessesError = action.payload;
      })
      .addCase(registerBusinessByAdmin.fulfilled, (state, action) => {
        if (action.payload?.business) {
          state.businesses.unshift(action.payload.business);
        }
        if (action.payload?.user) {
          state.admins.unshift(action.payload.user);
        }
      })

      .addCase(fetchAdmins.pending, (state) => {
        state.adminsLoading = true;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.adminsLoading = false;
        state.admins = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.adminsLoading = false;
        state.adminsError = action.payload;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        if (action.payload) {
          state.admins.unshift(action.payload);
        }
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.admins.findIndex((a: any) => (a._id || a.id) === (action.payload._id || action.payload.id));
          if (index !== -1) {
            state.admins[index] = action.payload;
          }
        }
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.admins = state.admins.filter((a: any) => (a._id || a.id) !== action.meta.arg);
      })

      .addCase(fetchPlans.pending, (state) => {
        state.plansLoading = true;
        state.plansError = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.plansLoading = false;
        state.plansError = action.payload;
      })
      .addCase(createPlan.fulfilled, (state, action) => {
        state.plans.push(action.payload);
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const idx = state.plans.findIndex((p: any) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.plans = state.plans.filter((p: any) => p._id !== action.meta.arg);
      })
      .addCase(togglePlan.fulfilled, (state, action) => {
        const idx = state.plans.findIndex((p: any) => p._id === action.payload._id);
        if (idx !== -1) state.plans[idx] = action.payload;
      })
      .addCase(fetchDemoRequests.pending, (state) => {
        state.demoRequestsLoading = true;
        state.demoRequestsError = null;
      })
      .addCase(fetchDemoRequests.fulfilled, (state, action) => {
        state.demoRequestsLoading = false;
        state.demoRequests = action.payload;
      })
      .addCase(fetchDemoRequests.rejected, (state, action) => {
        state.demoRequestsLoading = false;
        state.demoRequestsError = action.payload;
      })

      // Agents
      .addCase(fetchAgents.pending, (state) => {
        state.agentsLoading = true;
        state.agentsError = null;
      })
      .addCase(fetchAgents.fulfilled, (state, action) => {
        state.agentsLoading = false;
        state.agents = action.payload;
      })
      .addCase(fetchAgents.rejected, (state, action) => {
        state.agentsLoading = false;
        state.agentsError = action.payload;
      })
      .addCase(fetchAgentById.pending, (state) => {
        state.currentAgentLoading = true;
      })
      .addCase(fetchAgentById.fulfilled, (state, action) => {
        state.currentAgentLoading = false;
        state.currentAgent = action.payload;
      })
      .addCase(fetchAgentById.rejected, (state) => {
        state.currentAgentLoading = false;
      })
      .addCase(createAgent.fulfilled, (state, action) => {
        state.agents.unshift(action.payload);
      })
      .addCase(updateAgent.fulfilled, (state, action) => {
        const idx = state.agents.findIndex((a: any) => a._id === action.payload._id);
        if (idx !== -1) {
          state.agents[idx] = action.payload;
        }
        if (state.currentAgent?._id === action.payload._id) {
          state.currentAgent = action.payload;
        }
      })
      .addCase(deleteAgent.fulfilled, (state, action) => {
        state.agents = state.agents.filter((a: any) => a._id !== action.payload);
      })
      // Appointments
      .addCase(fetchSuperadminAppointments.pending, (state) => {
        if (!state.appointments || state.appointments.length === 0) {
          state.appointmentsLoading = true;
        }
        state.appointmentsError = null;
      })
      .addCase(fetchSuperadminAppointments.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload?.appointments || [];
        state.appointmentsTotal = action.payload?.total || 0;
        state.appointmentsStats = action.payload?.stats || null;
      })
      .addCase(fetchSuperadminAppointments.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.appointmentsError = action.payload;
      })
      // Notifications
      .addCase(fetchSuperadminNotifications.pending, (state, action) => {
        if (!action.meta.arg?.page || action.meta.arg.page === 1) {
          state.notificationsLoading = true;
        }
      })
      .addCase(fetchSuperadminNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        const newItems = action.payload?.notifications || [];
        if (action.payload?.append) {
          // Append unique notifications
          const existingIds = new Set(state.notifications.map((n: any) => n._id));
          const toAdd = newItems.filter((n: any) => !existingIds.has(n._id));
          state.notifications = [...state.notifications, ...toAdd];
        } else {
          state.notifications = newItems;
        }
        state.notificationsTotal = action.payload?.total || 0;
        state.unreadNotificationsCount = action.payload?.unreadCount || 0;
        state.notificationsHasMore = !!action.payload?.hasMore;
      })
      .addCase(fetchSuperadminNotifications.rejected, (state) => {
        state.notificationsLoading = false;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const id = action.payload?.id;
        state.notifications = state.notifications.map((n: any) =>
          n._id === id ? { ...n, read: true } : n
        );
        if (action.payload?.unreadCount !== undefined) {
          state.unreadNotificationsCount = action.payload.unreadCount;
        } else {
          state.unreadNotificationsCount = Math.max(0, state.unreadNotificationsCount - 1);
        }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n: any) => ({ ...n, read: true }));
        state.unreadNotificationsCount = 0;
      })
      .addCase(clearAllNotifications.fulfilled, (state) => {
        state.notifications = [];
        state.notificationsTotal = 0;
        state.unreadNotificationsCount = 0;
        state.notificationsHasMore = false;
      });
  }
});

export const { clearSuperadminState } = superadminSlice.actions;
export default superadminSlice.reducer;
