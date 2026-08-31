import { Skeleton } from '@mui/material';
import { Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, Box } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { useAppDispatch } from './hook';
import { fetchSessionThunk } from './features/auth/authSlice';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { lazy } from 'react';

const Landing = lazy(() => import('./pages/public/Landing'));
const Login = lazy(() => import('./pages/Login'));
const SuperadminLogin = lazy(() => import('./pages/superadmin/Login'));
const SuperadminDashboard = lazy(() => import('./pages/superadmin/Dashboard'));
const Businesses = lazy(() => import('./pages/superadmin/Businesses'));
const Plans = lazy(() => import('./pages/superadmin/Plans'));
const BusinessDashboard = lazy(() => import('./pages/business/Dashboard'));
const Appointments = lazy(() => import('./pages/business/Appointments'));
const Settings = lazy(() => import('./pages/business/Settings'));
const PublicBooking = lazy(() => import('./pages/public/PublicBooking'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));

const LoadingFallback = () => (
  <Box sx={{ p: 2.5 }}>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>{[...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={40} />)}</Box>
  </Box>
);

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchSessionThunk());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/superadmin/login" element={<SuperadminLogin />} />

              <Route path="/b/:slug" element={<PublicBooking />} />
              <Route path="/customer/dashboard" element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="/superadmin" element={<ProtectedRoute allowedRoles={['Superadmin']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<SuperadminDashboard />} />
              <Route path="businesses" element={<Businesses />} />
              <Route path="plans" element={<Plans />} />
            </Route>
            
            <Route path="/business" element={<ProtectedRoute allowedRoles={['BusinessAdmin']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<BusinessDashboard />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
