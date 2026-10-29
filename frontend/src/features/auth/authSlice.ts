import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { loginApi, googleLoginApi, fetchSessionApi, logoutApi, registerApi } from './authApi';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  businessId?: string;
  phone?: string;
  permissions?: {
    canManageShopProfile?: boolean;
    canManageOnboarding?: boolean;
    canManageAppointments?: boolean;
    canManageBilling?: boolean;
  };
  assignedBusinessIds?: any[];
  verificationStatus?: 'Pending' | 'ChangesRequested' | 'Approved' | 'Rejected';
  isDemoAccount?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  loginError: any;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  loginError: null,
};

export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await logoutApi();
      localStorage.removeItem('demoTourCompleted');
      return true;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const fetchSessionThunk = createAsyncThunk(
  'auth/fetchSession',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchSessionApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await loginApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const demoLoginThunk = createAsyncThunk(
  'auth/demoLogin',
  async (_, { rejectWithValue }) => {
    try {
      const { demoLoginApi } = await import('./authApi');
      const response = await demoLoginApi();
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await registerApi(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

export const googleLoginThunk = createAsyncThunk(
  'auth/googleLogin',
  async (stateParams: string, { rejectWithValue }) => {
    try {
      const response = await googleLoginApi(stateParams);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message);
    }
  }
);

const syncUserToLocalStorage = (user: any) => {
  try {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  } catch (e) {
    console.error('Failed to sync user to localStorage', e);
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      syncUserToLocalStorage(action.payload.user);
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      syncUserToLocalStorage(null);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearLoginError: (state) => {
      state.loginError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.loginError = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        syncUserToLocalStorage(action.payload);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      .addCase(demoLoginThunk.pending, (state) => {
        state.loading = true;
        state.loginError = null;
      })
      .addCase(demoLoginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        syncUserToLocalStorage(action.payload);
      })
      .addCase(demoLoginThunk.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.loginError = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        syncUserToLocalStorage(action.payload);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.loginError = action.payload;
      })

      .addCase(fetchSessionThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSessionThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        syncUserToLocalStorage(action.payload);
      })
      .addCase(fetchSessionThunk.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        syncUserToLocalStorage(null);
      })

      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        syncUserToLocalStorage(null);
      });
  }
});

export const { setCredentials, logoutUser, setLoading, clearLoginError } = authSlice.actions;
export default authSlice.reducer;
