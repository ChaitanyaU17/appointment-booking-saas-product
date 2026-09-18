import { Box, Typography, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useAppDispatch } from '../../hook';
import { loginThunk } from '../../features/auth/authSlice';
import DynamicForm from '../../components/common/DynamicForm';
import Logo from '../../components/common/Logo';

export default function SuperadminLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <Grid size={{ xs: 12, md: 5, lg: 6 }} sx={{ bgcolor: '#1e293b', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4, position: 'relative' }}>
        <Box sx={{ mb: 4 }}>
          <Logo size="large" color="white" />
        </Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 300, textAlign: 'center' }}>
          Master Control Panel
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8, textAlign: 'center', maxWidth: 400 }}>
          Manage platform businesses, global settings, and administrative accounts.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 4, md: 8 } }}>
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Superadmin Login
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            System administrators only.
          </Typography>

          <DynamicForm 
            fields={[
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'password', label: 'Password', type: 'password' }
            ]}
            initialValues={{ email: '', password: '' }}
            onSubmit={async (values) => {
              try {
                const user = await dispatch(loginThunk(values)).unwrap();
                if (user.role !== 'Superadmin') {
                  dispatch(showNotification({ message: 'Unauthorized access', failure: true }));
                  return;
                }
                dispatch(showNotification({ message: 'Logged in successfully!' }));
                navigate('/superadmin');
              } catch (error: any) {
                const errorMsg = typeof error === 'string' ? error : error?.message || 'Login failed';
                dispatch(showNotification({ message: errorMsg, failure: true }));
              }
            }}
            submitLabel="Access Dashboard"
          />
        </Box>
      </Grid>
    </Grid>
  );
}
