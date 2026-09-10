import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  fetchBusinessDashboardApi, fetchBusinessSettingsApi, updateBusinessSettingsApi, connectGoogleCalendarApi, updateBusinessPlanApi,
  fetchServicesApi, createServiceApi, updateServiceApi, deleteServiceApi, resubmitVerificationApi
} from "./businessApi";

interface IBusinessState {
  dashboardData: any;
  dashboardLoading: boolean;
  dashboardError: any;

  settingsData: any;
  settingsLoading: boolean;
  settingsError: any;

  services: any[];
  servicesLoading: boolean;
}

const initialState: IBusinessState = {
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  settingsData: null,
  settingsLoading: false,
  settingsError: null,

  services: [],
  servicesLoading: false,
};

export const fetchBusinessDashboard = createAsyncThunk(
  'business/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchBusinessDashboardApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchBusinessSettings = createAsyncThunk(
  'business/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchBusinessSettingsApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const updateBusinessSettings = createAsyncThunk(
  'business/updateSettings',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await updateBusinessSettingsApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const resubmitVerification = createAsyncThunk(
  'business/resubmitVerification',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await resubmitVerificationApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const updateBusinessPlan = createAsyncThunk(
  'business/updatePlan',
  async (planId: string, { rejectWithValue }) => {
    try {
      const response = await updateBusinessPlanApi(planId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const connectGoogleCalendar = createAsyncThunk(
  'business/connectGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const response = await connectGoogleCalendarApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchServices = createAsyncThunk(
  'business/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchServicesApi();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const createService = createAsyncThunk(
  'business/createService',
  async (data: any, { rejectWithValue }) => {
    try {
      return await createServiceApi(data);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const updateService = createAsyncThunk(
  'business/updateService',
  async ({ id, data }: { id: string, data: any }, { rejectWithValue }) => {
    try {
      return await updateServiceApi(id, data);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const deleteService = createAsyncThunk(
  'business/deleteService',
  async (id: string, { rejectWithValue }) => {
    try {
      return await deleteServiceApi(id);
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

const businessSlice = createSlice({
  name: "business",
  initialState,
  reducers: {
    clearBusinessState: (state) => {
      state.dashboardLoading = false;
      state.dashboardError = null;
      state.settingsLoading = false;
      state.settingsError = null;
      state.servicesLoading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBusinessDashboard.pending, (state) => {
        state.dashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchBusinessDashboard.fulfilled, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchBusinessDashboard.rejected, (state, action) => {
        state.dashboardLoading = false;
        state.dashboardError = action.payload;
      })

      .addCase(fetchBusinessSettings.pending, (state) => {
        state.settingsLoading = true;
        state.settingsError = null;
      })
      .addCase(fetchBusinessSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        state.settingsData = action.payload;
      })
      .addCase(fetchBusinessSettings.rejected, (state, action) => {
        state.settingsLoading = false;
        state.settingsError = action.payload;
      })

      .addCase(fetchServices.pending, (state) => {
        state.servicesLoading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.servicesLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state) => {
        state.servicesLoading = false;
      });
  }
});

export const { clearBusinessState } = businessSlice.actions;
export default businessSlice.reducer;
