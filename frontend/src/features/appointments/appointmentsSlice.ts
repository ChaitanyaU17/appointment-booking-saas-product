import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchAppointmentsApi, createAppointmentApi, updateAppointmentStatusApi, recordPaymentApi } from "./appointmentsApi";

interface IAppointmentsState {
  data: any[];
  loading: boolean;
  error: any;
  createLoading: boolean;
  createError: any;
  updateLoading: boolean;
  updateError: any;
}

const initialState: IAppointmentsState = {
  data: [],
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  updateLoading: false,
  updateError: null,
};

export const fetchAppointments = createAsyncThunk(
  'appointments/fetch',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await fetchAppointmentsApi(query);
      return response;
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message;
      return rejectWithValue(errMsg);
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await createAppointmentApi(data);
      return response;
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message;
      return rejectWithValue(errMsg);
    }
  }
);

export const updateAppointmentStatus = createAsyncThunk(
  'appointments/updateStatus',
  async ({ id, status }: { id: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await updateAppointmentStatusApi(id, status);
      return response;
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message;
      return rejectWithValue(errMsg);
    }
  }
);

export const recordPayment = createAsyncThunk(
  'appointments/recordPayment',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await recordPaymentApi(id, data);
      return response;
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.message;
      return rejectWithValue(errMsg);
    }
  }
);

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    clearAppointmentsState: (state) => {
      state.loading = false;
      state.error = null;
      state.createLoading = false;
      state.createError = null;
      state.updateLoading = false;
      state.updateError = null;
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createAppointment.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createAppointment.fulfilled, (state) => {
        state.createLoading = false;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })

      .addCase(updateAppointmentStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })

      .addCase(recordPayment.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(recordPayment.fulfilled, (state) => {
        state.updateLoading = false;
      })
      .addCase(recordPayment.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      });
  }
});

export const { clearAppointmentsState } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
