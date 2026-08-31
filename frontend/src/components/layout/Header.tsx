import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { logoutThunk } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hook';
import { showNotification } from '../../features/notifications/notificationSlice';
import Logo from '../common/Logo';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      dispatch(showNotification({ message: 'Logged out successfully' }));
      navigate('/login');
    } catch (error: any) {
      const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to log out';
      dispatch(showNotification({ message: errorMsg, failure: true }));
    }
  };

  const isPublicPage = location.pathname === '/' || location.pathname.startsWith('/b/');
  const isDashboardPage = location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/business') || location.pathname.startsWith('/customer');

  return (
    <AppBar position="sticky" color="inherit" elevation={0}>
      <Toolbar>
        {isDashboardPage && onMenuClick && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <Logo size="small" />
        </Box>

        <Box>
          {!isAuthenticated ? (
            isPublicPage && (
              <Button color="primary" variant="contained" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            )
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.name}
              </Typography>
              {!isDashboardPage && (
                <Button color="primary" variant="text" onClick={() => {
                  if (user?.role === 'Superadmin') navigate('/superadmin');
                  else if (user?.role === 'BusinessAdmin') navigate('/business');
                  else if (user?.role === 'Customer') navigate('/customer/dashboard');
                }}>
                  {user?.role === 'Customer' ? 'My Appointments' : 'Dashboard'}
                </Button>
              )}
              <Button color="inherit" variant="outlined" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}