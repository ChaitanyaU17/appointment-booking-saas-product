import { Box, Typography, Button, Divider, Grid } from '@mui/material';
import GoogleIcon from '../components/common/GoogleIcon';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../features/notifications/notificationSlice';
import Logo from '../components/common/Logo';
import { useAppDispatch } from '../hook';
import { loginThunk, googleLoginThunk } from '../features/auth/authSlice';
import DynamicForm from '../components/common/DynamicForm';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleGoogleLogin = async () => {
    try {
      const resData = await dispatch(googleLoginThunk('/business')).unwrap();
      window.location.href = resData.url;
    } catch (error: any) {
      const errMsg = typeof error === 'string' ? error : error?.message || 'Failed to initiate Google Login';
      dispatch(showNotification({ message: errMsg, failure: true }));
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      <Grid size={{ xs: 12, md: 5, lg: 6 }} sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4, position: 'relative' }}>
        <Box sx={{ mb: 4 }}>
          <Logo size="large" color="white" />
        </Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 300, textAlign: 'center' }}>
          Booking Made Simple
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8, textAlign: 'center', maxWidth: 400 }}>
          Manage your business appointments, sync with Google Calendar, and let your customers book with ease.
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 7, lg: 6 }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 4, md: 8 } }}>
        <Box sx={{ width: '100%', maxWidth: 480 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Business Login
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            Welcome back! Please enter your details.
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
                if (user.role !== 'BusinessAdmin') {
                  dispatch(showNotification({ message: 'Unauthorized access', failure: true }));
                  return;
                }
                dispatch(showNotification({ message: 'Logged in successfully!' }));
                navigate('/business');
              } catch (error: any) {
                const errMsg = typeof error === 'string' ? error : error?.message || 'Login failed';
                dispatch(showNotification({ message: errMsg, failure: true }));
              }
            }}
            submitLabel="Sign In"
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1, mb: 1 }}>
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', fontWeight: 500 }}>
                Forgot Password?
              </Typography>
            </Box>
          </DynamicForm>

          <Box sx={{ my: 4, position: 'relative' }}>
            <Divider>
              <Typography variant="body2" color="textSecondary">OR</Typography>
            </Divider>
          </Box>

          <Button 
            variant="outlined" 
            fullWidth 
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ py: 1.5, borderColor: '#e0e0e0', color: 'text.primary', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#e0e0e0' } }}
          >
            Sign In with Google
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}