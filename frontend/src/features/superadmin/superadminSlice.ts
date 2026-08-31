import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  fetchSuperadminDashboardApi, fetchBusinessesApi, createBusinessApi, updateBusinessApi, deleteBusinessApi,
  fetchAdminsApi, createAdminApi, updateAdminApi, deleteAdminApi
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
      });
  }
});

export const { clearSuperadminState } = superadminSlice.actions;
export default superadminSlice.reducer;
