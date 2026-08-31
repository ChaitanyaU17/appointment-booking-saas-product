import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchCustomerAppointmentsApi, cancelCustomerAppointmentApi } from "./customerApi";

interface ICustomerState {
  appointments: any[];
  appointmentsLoading: boolean;
  appointmentsError: any;
}

const initialState: ICustomerState = {
  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,
};

export const fetchCustomerAppointments = createAsyncThunk(
  'customer/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchCustomerAppointmentsApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const cancelCustomerAppointment = createAsyncThunk(
  'customer/cancelAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await cancelCustomerAppointmentApi(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    clearCustomerState: (state) => {
      state.appointmentsLoading = false;
      state.appointmentsError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerAppointments.pending, (state) => {
        state.appointmentsLoading = true;
        state.appointmentsError = null;
      })
      .addCase(fetchCustomerAppointments.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchCustomerAppointments.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.appointmentsError = action.payload;
      })
      .addCase(cancelCustomerAppointment.fulfilled, (state, action) => {
        const index = state.appointments.findIndex(a => a._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = { ...state.appointments[index], ...action.payload };
        }
      });
  }
});

export const { clearCustomerState } = customerSlice.actions;
export default customerSlice.reducer;
