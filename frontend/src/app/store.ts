import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import appointmentsReducer from '../features/appointments/appointmentsSlice';
import superadminReducer from '../features/superadmin/superadminSlice';
import businessReducer from '../features/business/businessSlice';
import customerReducer from '../features/customer/customerSlice';
import publicReducer from '../features/public/publicSlice';
import notificationReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentsReducer,
    superadmin: superadminReducer,
    business: businessReducer,
    customer: customerReducer,
    public: publicReducer,
    notification: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

