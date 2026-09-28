import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const API_URL = '/superadmin/coupons';

export const fetchCoupons = createAsyncThunk('coupons/fetchCoupons', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get(API_URL);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch coupons');
  }
});

export const createCoupon = createAsyncThunk('coupons/createCoupon', async (couponData: any, { rejectWithValue }) => {
  try {
    const response = await api.post(API_URL, couponData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create coupon');
  }
});

export const updateCoupon = createAsyncThunk('coupons/updateCoupon', async ({ id, data }: { id: string, data: any }, { rejectWithValue }) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, data);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update coupon');
  }
});

export const deleteCoupon = createAsyncThunk('coupons/deleteCoupon', async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`${API_URL}/${id}`);
    return id;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete coupon');
  }
});

export const validateCoupon = createAsyncThunk('coupons/validateCoupon', async ({ code, amount }: { code: string, amount: number }, { rejectWithValue }) => {
  try {
    const response = await api.post(`${API_URL}/validate`, { code, amount });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to validate coupon');
  }
});

const couponSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [],
    loading: false,
    error: null as string | null,
    validating: false,
    validateError: null as string | null,
    validatedCoupon: null as any | null,
  },
  reducers: {
    clearValidatedCoupon: (state) => {
      state.validatedCoupon = null;
      state.validateError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => { 
        state.loading = false; 
        state.coupons = action.payload; 
      })
      .addCase(fetchCoupons.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })
      
      .addCase(createCoupon.fulfilled, (state, action) => { 
        state.coupons.unshift(action.payload as never); 
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const index = state.coupons.findIndex((c: any) => c._id === action.payload._id);
        if (index !== -1) { state.coupons[index] = action.payload as never; }
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((c: any) => c._id !== action.payload);
      })
      
      .addCase(validateCoupon.pending, (state) => { 
        state.validating = true; 
        state.validateError = null; })
      .addCase(validateCoupon.fulfilled, (state, action) => { 
        state.validating = false; 
        state.validatedCoupon = action.payload; 
      })
      .addCase(validateCoupon.rejected, (state, action) => { 
        state.validating = false; 
        state.validateError = action.payload as string; 
      });
  }
});

export const { clearValidatedCoupon } = couponSlice.actions;
export default couponSlice.reducer;
