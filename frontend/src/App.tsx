import { Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ThemeProvider, Box, Skeleton } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import { useAppDispatch } from './hook';
import { fetchSessionThunk } from './features/auth/authSlice';

import PublicLayout from './components/layout/PublicLayout';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { lazy } from 'react';

const Landing = lazy(() => import('./pages/public/Landing'));
const ContactSales = lazy(() => import('./pages/public/ContactSales'));
const HelpCenter = lazy(() => import('./pages/public/HelpCenter'));
const Security = lazy(() => import('./pages/public/Security'));
const Integrations = lazy(() => import('./pages/public/Integrations'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const SuperadminLogin = lazy(() => import('./pages/superadmin/Login'));
const SuperadminDashboard = lazy(() => import('./pages/superadmin/Dashboard'));
const Registration = lazy(() => import('./pages/superadmin/Registration'));
const OnboardedShops = lazy(() => import('./pages/superadmin/OnboardedShops'));
const ExpiredShops = lazy(() => import('./pages/superadmin/ExpiredShops'));
const AllocatePlan = lazy(() => import('./pages/superadmin/AllocatePlan'));
const ShopDetails = lazy(() => import('./pages/superadmin/ShopDetails'));
const Admins = lazy(() => import('./pages/superadmin/Admins'));
const Plans = lazy(() => import('./pages/superadmin/Plans'));
const Coupons = lazy(() => import('./pages/superadmin/Coupons'));
const CouponForm = lazy(() => import('./pages/superadmin/CouponForm'));
const PlanForm = lazy(() => import('./pages/superadmin/PlanForm'));
const DemoRequests = lazy(() => import('./pages/superadmin/DemoRequests'));
const Payments = lazy(() => import('./pages/superadmin/Payments'));
const BusinessDashboard = lazy(() => import('./pages/business/Dashboard'));
const Appointments = lazy(() => import('./pages/business/Appointments'));
const Settings = lazy(() => import('./pages/business/Settings'));
const PendingVerification = lazy(() => import('./pages/business/PendingVerification'));
const PublicBooking = lazy(() => import('./pages/public/PublicBooking'));
const PaymentPage = lazy(() => import('./pages/public/PaymentPage'));
const CustomerDashboard = lazy(() => import('./pages/customer/Dashboard'));

const LoadingFallback = () => (
  <Box sx={{ p: 2.5 }}>
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {[...Array(5)].map((_, i) => <Skeleton key={i} variant="rounded" height={40} />)}
    </Box>
  </Box>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { path: "", element: <Suspense fallback={<LoadingFallback />}><Landing /></Suspense> },
      { path: "contact-sales", element: <Suspense fallback={<LoadingFallback />}><ContactSales /></Suspense> },
      { path: "pay/:token", element: <Suspense fallback={<LoadingFallback />}><PaymentPage /></Suspense> },
      { path: "help-center", element: <Suspense fallback={<LoadingFallback />}><HelpCenter /></Suspense> },
      { path: "security", element: <Suspense fallback={<LoadingFallback />}><Security /></Suspense> },
      { path: "integrations", element: <Suspense fallback={<LoadingFallback />}><Integrations /></Suspense> },
      { path: "login", element: <Suspense fallback={<LoadingFallback />}><Login /></Suspense> },
      { path: "register", element: <Suspense fallback={<LoadingFallback />}><Register /></Suspense> },
      { path: "superadmin/login", element: <Suspense fallback={<LoadingFallback />}><SuperadminLogin /></Suspense> },
      { path: "b/:slug", element: <Suspense fallback={<LoadingFallback />}><PublicBooking /></Suspense> },
      {
        path: "customer/dashboard",
        element: (
          <ProtectedRoute allowedRoles={['Customer']}><Suspense fallback={<LoadingFallback />}><CustomerDashboard /></Suspense></ProtectedRoute>
        )
      },
    ]
  },
  {
    path: "/superadmin",
    element: (
      <ProtectedRoute allowedRoles={['Superadmin']}><DashboardLayout /></ProtectedRoute>
    ),
    children: [
      { path: "", element: <Suspense fallback={<LoadingFallback />}><SuperadminDashboard /></Suspense> },
      { path: "registration", element: <Suspense fallback={<LoadingFallback />}><Registration /></Suspense> },
      { path: "shops", element: <Suspense fallback={<LoadingFallback />}><OnboardedShops /></Suspense> },
      { path: "expired-shops", element: <Suspense fallback={<LoadingFallback />}><ExpiredShops /></Suspense> },
      { path: "allocate-plan/:id", element: <Suspense fallback={<LoadingFallback />}><AllocatePlan /></Suspense> },
      { path: "shops/:id", element: <Suspense fallback={<LoadingFallback />}><ShopDetails /></Suspense> },
      { path: "admins", element: <Suspense fallback={<LoadingFallback />}><Admins /></Suspense> },
      { path: "plans", element: <Suspense fallback={<LoadingFallback />}><Plans /></Suspense> },
      { path: "coupons", element: <Suspense fallback={<LoadingFallback />}><Coupons /></Suspense> },
      { path: "coupons/create", element: <Suspense fallback={<LoadingFallback />}><CouponForm /></Suspense> },
      { path: "coupons/edit/:id", element: <Suspense fallback={<LoadingFallback />}><CouponForm /></Suspense> },
      { path: "plan-create", element: <Suspense fallback={<LoadingFallback />}><PlanForm /></Suspense> },
      { path: "plan-edit/:id", element: <Suspense fallback={<LoadingFallback />}><PlanForm /></Suspense> },
      { path: "demo-requests", element: <Suspense fallback={<LoadingFallback />}><DemoRequests /></Suspense> },
      { path: "payments", element: <Suspense fallback={<LoadingFallback />}><Payments /></Suspense> },
    ]
  },
  {
    path: "/business",
    element: (
      <ProtectedRoute allowedRoles={['BusinessAdmin']}><DashboardLayout /></ProtectedRoute>
    ),
    children: [
      { path: "", element: <Suspense fallback={<LoadingFallback />}><BusinessDashboard /></Suspense> },
      { path: "appointments", element: <Suspense fallback={<LoadingFallback />}><Appointments /></Suspense> },
      { path: "settings", element: <Suspense fallback={<LoadingFallback />}><Settings /></Suspense> },
    ]
  },
  {
    path: "/business/pending-verification",
    element: (
      <ProtectedRoute allowedRoles={['BusinessAdmin']}><Suspense fallback={<LoadingFallback />}><PendingVerification /></Suspense></ProtectedRoute>
    )
  },
  { path: "*", element: <Navigate to="/" />}
]);

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchSessionThunk());
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
