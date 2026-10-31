import { Box, Typography, Grid, Link as MuiLink } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useAppDispatch } from '../../hook';
import { loginThunk, logoutThunk } from '../../features/auth/authSlice';
import DynamicForm from '../../components/common/DynamicForm';
import Logo from '../../components/common/Logo';

export default function AgentLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <Grid 
        size={{ xs: 12, md: 5, lg: 6 }} 
        sx={{ bgcolor: '#1c3d36', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4, position: 'relative' }}
      >
        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo size="large" color="white" />
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mt: 2, px: 2, py: 0.6, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <SupportAgentRoundedIcon sx={{ fontSize: 18, color: '#a7f3d0' }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: '#a7f3d0' }}>
              Field Operations Portal
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ mb: 2, fontWeight: 400, textAlign: 'center', maxWidth: 440 }}>
          Partner & Agent Workspace
        </Typography>

        <Typography variant="body1" sx={{ opacity: 0.8, textAlign: 'center', maxWidth: 420, lineHeight: 1.6 }}>
          Register local businesses, coordinate merchant onboarding, manage bookings, and inspect shop subscriptions across your assigned territory.
        </Typography>
      </Grid>

      <Grid 
        size={{ xs: 12, md: 7, lg: 6 }} 
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 4, md: 8 },bgcolor: '#fafcfb'}}
      >
        <Box sx={{ width: '100%', maxWidth: 460 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Agent Login
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Authorized field agents and partner representatives only.
            </Typography>
          </Box>

          <DynamicForm 
            fields={[
              { name: 'email', label: 'Agent Email', type: 'email' },
              { name: 'password', label: 'Password', type: 'password' }
            ]}
            initialValues={{ email: '', password: '' }}
            onSubmit={async (values) => {
              try {
                const user = await dispatch(loginThunk({ ...values, role: 'Agent' })).unwrap();
                if (user.role !== 'Agent') {
                  await dispatch(logoutThunk());
                  dispatch(showNotification({ 
                    message: 'Access restricted: This portal is for authorized Agents only. Business owners should use Business Login.', 
                    failure: true 
                  }));
                  return;
                }
                dispatch(showNotification({ message: 'Welcome back, Agent!' }));
                navigate('/agent');
              } catch (error: any) {
                const errorMsg = typeof error === 'string' ? error : error?.message || 'Login failed';
                dispatch(showNotification({ message: errorMsg, failure: true }));
              }
            }}
            submitLabel="Sign In to Agent Portal"
          />

          <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Looking for your shop dashboard?{' '}
              <MuiLink 
                component={RouterLink} 
                to="/login" 
                sx={{ color: '#4a6b62', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                Business Owner Login
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
