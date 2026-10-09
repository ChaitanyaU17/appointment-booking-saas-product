import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  fetchPublicBusinessApi, fetchPublicSlotsApi, fetchMyAppointmentsApi, bookAppointmentApi, publicGoogleLoginApi, fetchPublicPlansApi, createDemoRequestApi, fetchPaymentDetailsApi, processPaymentApi
} from "./publicApi";

interface IPublicState {
  business: any;
  businessLoading: boolean;
  businessError: any;

  slots: any[];
  slotsLoading: boolean;
  slotsError: any;
  googleConnected: boolean;

  myAppointments: any[];
  myAppointmentsLoading: boolean;
  myAppointmentsError: any;

  plans: any[];
  plansLoading: boolean;

  paymentDetails: any;
  receiptData: any;
  paymentDetailsLoading: boolean;
  paymentDetailsError: any;

  paymentProcessing: boolean;
  paymentSuccess: boolean;
  paymentError: any;
}

const initialState: IPublicState = {
  business: null,
  businessLoading: false,
  businessError: null,

  slots: [],
  slotsLoading: false,
  slotsError: null,
  googleConnected: true,

  myAppointments: [],
  myAppointmentsLoading: false,
  myAppointmentsError: null,

  plans: [],
  plansLoading: false,

  paymentDetails: null,
  receiptData: null,
  paymentDetailsLoading: false,
  paymentDetailsError: null,

  paymentProcessing: false,
  paymentSuccess: false,
  paymentError: null,
};

export const fetchPublicBusiness = createAsyncThunk(
  'public/fetchBusiness',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await fetchPublicBusinessApi(slug);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchPublicSlots = createAsyncThunk(
  'public/fetchSlots',
  async ({ slug, dateStr }: { slug: string; dateStr: string }, { rejectWithValue }) => {
    try {
      const response = await fetchPublicSlotsApi(slug, dateStr);
      return response;
    } catch (error: any) {
      if (error?.response?.status === 400 && error?.response?.data?.message === 'Business is not connected to Google Calendar') {
        return rejectWithValue({ isNotConnected: true, message: error?.response?.data?.message });
      }
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchMyAppointments = createAsyncThunk(
  'public/fetchMyAppointments',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await fetchMyAppointmentsApi(slug);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const bookAppointment = createAsyncThunk(
  'public/bookAppointment',
  async ({ slug, data }: { slug: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await bookAppointmentApi(slug, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const publicGoogleLogin = createAsyncThunk(
  'public/googleLogin',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await publicGoogleLoginApi(slug);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchPublicPlans = createAsyncThunk(
  'public/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchPublicPlansApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const createDemoRequest = createAsyncThunk(
  'public/createDemoRequest',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await createDemoRequestApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchPaymentDetails = createAsyncThunk(
  'public/fetchPaymentDetails',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await fetchPaymentDetailsApi(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const processPayment = createAsyncThunk(
  'public/processPayment',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await processPaymentApi(token);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

const publicSlice = createSlice({
  name: "public",
  initialState,
  reducers: {
    clearPublicState: (state) => {
      state.businessLoading = false;
      state.businessError = null;
      state.slotsLoading = false;
      state.slotsError = null;
      state.myAppointmentsLoading = false;
      state.myAppointmentsError = null;
      state.paymentDetails = null;
      state.paymentDetailsLoading = false;
      state.paymentDetailsError = null;
      state.paymentProcessing = false;
      state.paymentSuccess = false;
      state.paymentError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicBusiness.pending, (state) => {
        state.businessLoading = true;
        state.businessError = null;
      })
      .addCase(fetchPublicBusiness.fulfilled, (state, action) => {
        state.businessLoading = false;
        state.business = action.payload;
      })
      .addCase(fetchPublicBusiness.rejected, (state, action) => {
        state.businessLoading = false;
        state.businessError = action.payload;
      })

      .addCase(fetchPublicSlots.pending, (state) => {
        state.slotsLoading = true;
        state.slotsError = null;
        state.googleConnected = true;
      })
      .addCase(fetchPublicSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.slots = action.payload.availableSlots;
        state.googleConnected = true;
      })
      .addCase(fetchPublicSlots.rejected, (state, action: any) => {
        state.slotsLoading = false;
        if (action.payload?.isNotConnected) {
          state.slots = [];
          state.googleConnected = false;
        } else {
          state.slotsError = action.payload;
        }
      })

      .addCase(fetchMyAppointments.pending, (state) => {
        state.myAppointmentsLoading = true;
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.myAppointmentsLoading = false;
        state.myAppointments = action.payload;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.myAppointmentsLoading = false;
        state.myAppointmentsError = action.payload;
      })
      
      .addCase(fetchPublicPlans.pending, (state) => { state.plansLoading = true; })
      .addCase(fetchPublicPlans.fulfilled, (state, action) => { state.plansLoading = false; state.plans = action.payload; })
      .addCase(fetchPublicPlans.rejected, (state) => { state.plansLoading = false; })
      
      .addCase(fetchPaymentDetails.pending, (state) => {
        state.paymentDetailsLoading = true;
        state.paymentDetailsError = null;
      })
      .addCase(fetchPaymentDetails.fulfilled, (state, action) => {
        state.paymentDetailsLoading = false;
        state.paymentDetails = action.payload.business;
        if (action.payload.isReceipt) {
          state.paymentSuccess = true;
          state.receiptData = action.payload.payment;
        } else {
          state.paymentSuccess = false;
          state.receiptData = null;
        }
      })
      .addCase(fetchPaymentDetails.rejected, (state, action) => {
        state.paymentDetailsLoading = false;
        state.paymentDetailsError = action.payload;
      })

      .addCase(processPayment.pending, (state) => {
        state.paymentProcessing = true;
        state.paymentError = null;
        state.paymentSuccess = false;
      })
      .addCase(processPayment.fulfilled, (state) => {
        state.paymentProcessing = false;
        state.paymentSuccess = true;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.paymentProcessing = false;
        state.paymentError = action.payload;
      });
  }
});

export const { clearPublicState } = publicSlice.actions;
export default publicSlice.reducer;
