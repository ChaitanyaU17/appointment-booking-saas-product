import { useState } from 'react';
import {
  Box, Typography, TextField, Button,
  InputAdornment, IconButton, CircularProgress, Chip, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import BoltIcon from '@mui/icons-material/Bolt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppDispatch } from '../hook';
import { registerThunk } from '../features/auth/authSlice';
import { showNotification } from '../features/notifications/notificationSlice';
import Logo from '../components/common/Logo';
import registerImg from '../assets/meet-register.png';

const validationSchema = Yup.object({
  name: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  additionalNotes: Yup.string().optional(),
});

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2.5,
    bgcolor: '#f8fafc',
    transition: 'all 0.2s ease',
    '& fieldset': { borderColor: '#e2e8f0' },
    '&:hover fieldset': { borderColor: '#cbd5e1' },
    '&.Mui-focused': { bgcolor: '#ffffff' },
    '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 },
  },
};

const benefits = [
  {
    icon: <BoltIcon />,
    title: 'Instant Booking Link',
    desc: 'Share your personalized booking page on WhatsApp, Instagram, or anywhere.',
  },
  {
    icon: <NotificationsActiveIcon />,
    title: 'Automated Reminders',
    desc: 'Eliminate no-shows and keep your client appointments running on time.',
  },
  {
    icon: <CalendarMonthIcon />,
    title: 'Zero Complicated Paperwork',
    desc: 'Get up and running in minutes with no legal hassle or credit card required.',
  },
];

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      additionalNotes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(registerThunk(values)).unwrap();
        dispatch(showNotification({ message: 'Registration successful! Welcome to Slotify.' }));
        navigate('/business');
      } catch (error: any) {
        const errMsg = typeof error === 'string' ? error : error?.message || 'Registration failed';
        dispatch(showNotification({ message: errMsg, failure: true }));
      }
    },
  });

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <Box sx={{
        display: { xs: 'block', md: 'none' },
        position: 'relative',
        width: '100%',
        height: { xs: 160, sm: 200 },
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <Box
          component="img"
          src={registerImg}
          alt="Online appointment booking"
          sx={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
          }}
        />
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.85) 100%)',
        }} />
        <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: { xs: 2.5, sm: 3 } }}>
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />}
            label="Fast & Easy Scheduling"
            size="small"
            sx={{ mb: 1, alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)' }}
          />
          <Typography sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.3rem' }, lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            Start taking online appointments in minutes.
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        width: { xs: '100%', md: '50%' },
        display: 'flex', flexDirection: 'column',
        px: { xs: 3, sm: 6, md: 6, lg: 8 },
        py: { xs: 4, md: 5 },
        bgcolor: 'white',
      }}>
        <Box sx={{ mb: { xs: 3, md: 4 }, display: { xs: 'none', md: 'block' } }}>
          <Logo size="medium" />
        </Box>

        <Box sx={{ maxWidth: 440, mx: { xs: 'auto', md: 0 }, width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px', fontSize: { xs: '1.6rem', sm: '2rem' }, color: '#1e293b' }}>
              Create your account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5 }}>
              Sign up with a few basic details to start accepting bookings.
            </Typography>

            <form onSubmit={formik.handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                <TextField
                  fullWidth
                  sx={fieldSx}
                  id="name"
                  name="name"
                  label="Full Name"
                  placeholder="e.g. chaitanya"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name as string}
                />

                <TextField
                  fullWidth
                  sx={fieldSx}
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="chaitanya@example.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email as string}
                />

                <TextField
                  fullWidth
                  sx={fieldSx}
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  placeholder="e.g. 9876543210"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone as string}
                />

                <TextField
                  fullWidth
                  sx={fieldSx}
                  id="password"
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter a secure password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password as string}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2.5}
                  sx={fieldSx}
                  id="additionalNotes"
                  name="additionalNotes"
                  label="Additional Note (Optional)"
                  placeholder="Tell us about your services, questions, or any special requests..."
                  value={formik.values.additionalNotes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />

                <Button
                  fullWidth
                  color="primary"
                  variant="contained"
                  type="submit"
                  size="large"
                  disabled={formik.isSubmitting}
                  sx={{
                    mt: 1,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: 2.5,
                    bgcolor: '#659287',
                    '&:hover': { bgcolor: '#4a6b62' },
                    boxShadow: '0 4px 14px rgba(101, 146, 135, 0.25)',
                    textTransform: 'none'
                  }}
                >
                  {formik.isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Register'}
                </Button>
              </Box>
            </form>
          </motion.div>

          <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            Already have an account?{' '}
            <RouterLink to="/login" style={{ color: '#659287', fontWeight: 700, textDecoration: 'none' }}>
              Login
            </RouterLink>
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        display: { xs: 'none', md: 'block' },
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        width: '50%',
        height: '100dvh',
        overflow: 'hidden',
      }}>
        <Box
          component="img"
          src={registerImg}
          alt="Online appointment booking platform"
          sx={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: { md: 'center 25%', lg: 'center 20%' },
          }}
        />
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.72) 45%, rgba(15,23,42,0.93) 100%)',
        }} />

        <Box sx={{
          position: 'relative', zIndex: 1, height: '100%',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          px: { md: 5, lg: 8 },
          py: { md: 4, lg: 6 },
        }}>
          <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: 'white !important' }} />}
              label="Instant Online Scheduling"
              sx={{ mb: { md: 2, lg: 3 }, bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)' }}
            />
            <Typography sx={{
              color: 'white', fontWeight: 800, mb: 1.5, lineHeight: 1.22,
              fontSize: { md: '1.5rem', lg: '2rem' },
              textShadow: '0 2px 12px rgba(0,0,0,0.35)',
            }}>
              Start taking online appointments in minutes.
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.82)', mb: { md: 3, lg: 5 }, maxWidth: 420, fontSize: { md: '0.9rem', lg: '1rem' } }}>
              Slotify makes booking effortless for solo professionals, salons, clinics, and businesses alike.
            </Typography>
          </motion.div>

          <Box sx={{ position: 'relative', pl: 1 }}>
            <Box sx={{ position: 'absolute', left: { md: 19, lg: 23 }, top: 12, bottom: 12, width: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />

            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
              >
                <Box sx={{ display: 'flex', gap: { md: 2, lg: 2.5 }, mb: i === benefits.length - 1 ? 0 : { md: 2.5, lg: 4 }, position: 'relative' }}>
                  <Box sx={{
                    width: { md: 40, lg: 48 }, height: { md: 40, lg: 48 }, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.97)', color: 'primary.dark',
                    '& svg': { fontSize: { md: 20, lg: 24 } },
                  }}>
                    {b.icon}
                  </Box>
                  <Box sx={{ pt: 0.6 }}>
                    <Typography sx={{ color: 'white', fontWeight: 700, mb: 0.3, fontSize: { md: '0.9rem', lg: '1rem' }, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
                      {b.title}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.78)', maxWidth: 320, fontSize: { md: '0.8rem', lg: '0.875rem' } }}>
                      {b.desc}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            ))}
          </Box>

          <Divider sx={{ my: { md: 2.5, lg: 4 }, borderColor: 'rgba(255,255,255,0.18)' }} />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.9 }}>
            <Box sx={{ display: 'flex', gap: { md: 2.5, lg: 4 }, flexWrap: 'wrap' }}>
              {[
                { value: '100%', label: 'Free to start' },
                { value: '2 mins', label: 'Average setup' },
                { value: '24/7', label: 'Online bookings' },
              ].map((stat) => (
                <Box key={stat.label}>
                  <Typography sx={{ color: 'white', fontWeight: 800, fontSize: { md: '1.1rem', lg: '1.5rem' } }}>{stat.value}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>{stat.label}</Typography>
                </Box>
              ))}
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}