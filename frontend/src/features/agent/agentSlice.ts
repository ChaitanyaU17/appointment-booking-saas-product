import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  fetchAgentProfileApi,
  fetchAgentDashboardStatsApi,
  fetchAssignedShopsApi,
  fetchShopDetailsApi,
  updateShopProfileApi,
  updateShopOnboardingApi,
  fetchAgentAppointmentsApi,
  updateAgentAppointmentStatusApi,
  fetchAgentPlansApi,
  agentCreateDemoApi,
  agentMarkDemoConductedApi,
  agentApproveShopApi,
  agentRejectShopApi,
  agentRequestShopChangesApi,
  agentActivateTrialApi,
  agentGeneratePaymentLinkApi,
  registerShopByAgentApi,
  deleteShopByAgentApi,
} from './agentApi';

interface IAgentState {
  profile: any;
  profileLoading: boolean;
  dashboardStats: any;
  dashboardLoading: boolean;
  assignedShops: any[];
  shopsLoading: boolean;
  selectedShop: any;
  shopDetailsLoading: boolean;
  appointments: any[];
  appointmentsLoading: boolean;
  plans: any[];
  plansLoading: boolean;
  error: any;
}

const initialState: IAgentState = {
  profile: null,
  profileLoading: false,
  dashboardStats: null,
  dashboardLoading: false,
  assignedShops: [],
  shopsLoading: false,
  selectedShop: null,
  shopDetailsLoading: false,
  appointments: [],
  appointmentsLoading: false,
  plans: [],
  plansLoading: false,
  error: null,
};

export const fetchAgentProfile = createAsyncThunk(
  'agent/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAgentProfileApi();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const fetchAgentDashboardStats = createAsyncThunk(
  'agent/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAgentDashboardStatsApi();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchAssignedShops = createAsyncThunk(
  'agent/fetchAssignedShops',
  async (params: { search?: string; status?: string } | undefined, { rejectWithValue }) => {
    try {
      return await fetchAssignedShopsApi(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch assigned shops');
    }
  }
);

export const fetchShopDetails = createAsyncThunk(
  'agent/fetchShopDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      return await fetchShopDetailsApi(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch shop details');
    }
  }
);

export const updateShopProfile = createAsyncThunk(
  'agent/updateShopProfile',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await updateShopProfileApi(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update shop profile');
    }
  }
);

export const updateShopOnboarding = createAsyncThunk(
  'agent/updateShopOnboarding',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await updateShopOnboardingApi(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update onboarding');
    }
  }
);

export const fetchAgentAppointments = createAsyncThunk(
  'agent/fetchAppointments',
  async (params: { businessId?: string; status?: string; date?: string } | undefined, { rejectWithValue }) => {
    try {
      return await fetchAgentAppointmentsApi(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const updateAgentAppointmentStatus = createAsyncThunk(
  'agent/updateAppointmentStatus',
  async ({ appointmentId, status }: { appointmentId: string; status: string }, { rejectWithValue }) => {
    try {
      return await updateAgentAppointmentStatusApi(appointmentId, status);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update appointment status');
    }
  }
);

export const fetchAgentPlans = createAsyncThunk(
  'agent/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAgentPlansApi();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch plans');
    }
  }
);

export const agentCreateDemo = createAsyncThunk(
  'agent/createDemo',
  async ({ id, meetLink }: { id: string; meetLink: string }, { rejectWithValue }) => {
    try {
      return await agentCreateDemoApi(id, meetLink);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to provision demo sandbox');
    }
  }
);

export const agentMarkDemoConducted = createAsyncThunk(
  'agent/markDemoConducted',
  async (id: string, { rejectWithValue }) => {
    try {
      return await agentMarkDemoConductedApi(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to mark demo conducted');
    }
  }
);

export const agentApproveShop = createAsyncThunk(
  'agent/approveShop',
  async ({ id, data }: { id: string; data?: any }, { rejectWithValue }) => {
    try {
      return await agentApproveShopApi(id, data || {});
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to approve shop');
    }
  }
);

export const agentRejectShop = createAsyncThunk(
  'agent/rejectShop',
  async ({ id, reason }: { id: string; reason: string }, { rejectWithValue }) => {
    try {
      return await agentRejectShopApi(id, reason);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reject shop');
    }
  }
);

export const agentRequestShopChanges = createAsyncThunk(
  'agent/requestShopChanges',
  async ({ id, note }: { id: string; note: string }, { rejectWithValue }) => {
    try {
      return await agentRequestShopChangesApi(id, note);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to request changes');
    }
  }
);

export const agentActivateTrial = createAsyncThunk(
  'agent/activateTrial',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      return await agentActivateTrialApi(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to activate trial');
    }
  }
);

export const agentGeneratePaymentLink = createAsyncThunk(
  'agent/generatePaymentLink',
  async ({ id, paymentBreakdown }: { id: string; paymentBreakdown: any }, { rejectWithValue }) => {
    try {
      return await agentGeneratePaymentLinkApi(id, paymentBreakdown);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to generate payment link');
    }
  }
);

export const registerShopByAgent = createAsyncThunk(
  'agent/registerShop',
  async (data: any, { rejectWithValue }) => {
    try {
      return await registerShopByAgentApi(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to register shop');
    }
  }
);

export const deleteShopByAgent = createAsyncThunk(
  'agent/deleteShop',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await deleteShopByAgentApi(id);
      return { id, message: res?.message || 'Shop deleted successfully' };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete shop');
    }
  }
);

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    clearAgentState: (state) => {
      state.selectedShop = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Profile
      .addCase(fetchAgentProfile.pending, (state) => {
        state.profileLoading = true;
      })
      .addCase(fetchAgentProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchAgentProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.error = action.payload;
      })

      // Dashboard
      .addCase(fetchAgentDashboardStats.pending, (state) => {
        state.dashboardLoading = true;
      })
      .addCase(fetchAgentDashboardStats.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchAgentDashboardStats.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.error = action.payload;
      })

      // Assigned Shops
      .addCase(fetchAssignedShops.pending, (state) => {
        state.shopsLoading = true;
      })
      .addCase(fetchAssignedShops.fulfilled, (state, action) => {
        state.shopsLoading = false;
        state.assignedShops = action.payload;
      })
      .addCase(fetchAssignedShops.rejected, (state, action) => {
        state.shopsLoading = false;
        state.error = action.payload;
      })
      .addCase(registerShopByAgent.fulfilled, (state, action) => {
        if (action.payload?.business) {
          state.assignedShops.unshift(action.payload.business);
        }
      })

      // Shop Details
      .addCase(fetchShopDetails.pending, (state) => {
        state.shopDetailsLoading = true;
      })
      .addCase(fetchShopDetails.fulfilled, (state, action) => {
        state.shopDetailsLoading = false;
        state.selectedShop = action.payload;
      })
      .addCase(fetchShopDetails.rejected, (state, action) => {
        state.shopDetailsLoading = false;
        state.error = action.payload;
      })

      // Update Shop Profile
      .addCase(updateShopProfile.fulfilled, (state, action) => {
        const updated = action.payload.shop;
        const idx = state.assignedShops.findIndex((s) => s._id === updated._id);
        if (idx !== -1) {
          state.assignedShops[idx] = { ...state.assignedShops[idx], ...updated };
        }
        if (state.selectedShop?.shop?._id === updated._id) {
          state.selectedShop.shop = updated;
        }
      })

      // Update Shop Onboarding
      .addCase(updateShopOnboarding.fulfilled, (state, action) => {
        const updated = action.payload.shop;
        const idx = state.assignedShops.findIndex((s) => s._id === updated._id);
        if (idx !== -1) {
          state.assignedShops[idx] = { ...state.assignedShops[idx], ...updated };
        }
        if (state.selectedShop?.shop?._id === updated._id) {
          state.selectedShop.shop = updated;
        }
      })

      // Delete Shop
      .addCase(deleteShopByAgent.fulfilled, (state, action) => {
        state.assignedShops = state.assignedShops.filter(
          (s: any) => (s._id || s.id) !== action.payload.id
        );
      })

      // Appointments
      .addCase(fetchAgentAppointments.pending, (state) => {
        state.appointmentsLoading = true;
      })
      .addCase(fetchAgentAppointments.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAgentAppointments.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.error = action.payload;
      })

      // Update Appointment Status
      .addCase(updateAgentAppointmentStatus.fulfilled, (state, action) => {
        const updated = action.payload.appointment;
        const idx = state.appointments.findIndex((a) => a._id === updated._id);
        if (idx !== -1) {
          state.appointments[idx] = updated;
        }
      })

      // Plans
      .addCase(fetchAgentPlans.pending, (state) => {
        state.plansLoading = true;
      })
      .addCase(fetchAgentPlans.fulfilled, (state, action) => {
        state.plansLoading = false;
        state.plans = action.payload;
      })
      .addCase(fetchAgentPlans.rejected, (state, action) => {
        state.plansLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAgentState } = agentSlice.actions;
export default agentSlice.reducer;
