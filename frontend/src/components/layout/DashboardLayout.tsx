import { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import NotificationSnackbar from '../snackbar/NotificationSnackbar';
import DemoTour from '../tour/DemoTour';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header onMenuClick={() => setMobileOpen((o) => !o)} />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <Box
          component="main"
          sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, bgcolor: 'background.default', width: { md: `calc(100% - 240px)` }}}
        >
          <Outlet />
        </Box>
      </Box>
      <NotificationSnackbar />
      <DemoTour />
    </Box>
  );
}