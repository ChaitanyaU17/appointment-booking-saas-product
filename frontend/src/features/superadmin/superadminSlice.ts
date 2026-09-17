import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  fetchSuperadminDashboardApi, fetchBusinessesApi, createBusinessApi, updateBusinessApi, deleteBusinessApi,
  fetchAdminsApi, createAdminApi, updateAdminApi, deleteAdminApi,
  approveBusinessApi, rejectBusinessApi, requestChangesBusinessApi,
  activateTrialApi,
  createDemoForRegistrationApi, markDemoConductedApi,
  fetchDemoRequestsApi, approveDemoRequestApi, rejectDemoRequestApi, deleteDemoRequestApi
} from "./superadminApi";
import {
  fetchPlansApi, createPlanApi, updatePlanApi, deletePlanApi, togglePlanApi
} from "./planApi";

interface ISuperadminState {
  dashboardData: any;
  dashboardLoading: boolean;
  dashboardError: any;
  
  businesses: any[];
  businessesLoading: boolean;
  businessesError: any;
  
  admins: any[];
  adminsLoading: boolean;
  adminsError: any;

  plans: any[];
  plansLoading: boolean;
  plansError: any;

  demoRequests: any[];
  demoRequestsLoading: boolean;
  demoRequestsError: any;
}

const initialState: ISuperadminState = {
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,
  
  businesses: [],
  businessesLoading: false,
  businessesError: null,
  
  admins: [],
  adminsLoading: false,
  adminsError: null,

  plans: [],
  plansLoading: false,
  plansError: null,

  demoRequests: [],
  demoRequestsLoading: false,
  demoRequestsError: null,
};

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
        state.dashboardLoading = true;
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

      .addCase(fetchBusinesses.pending, (state) => {
        state.businessesLoading = true;
      })
      .addCase(fetchBusinesses.fulfilled, (state, action) => {
        state.businessesLoading = false;
        state.businesses = action.payload;
      })
      .addCase(fetchBusinesses.rejected, (state, action) => {
        state.businessesLoading = false;
        state.businessesError = action.payload;
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
      });
  }
});

export const { clearSuperadminState } = superadminSlice.actions;
export default superadminSlice.reducer;
