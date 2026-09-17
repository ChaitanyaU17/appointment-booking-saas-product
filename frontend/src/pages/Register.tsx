import { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, MenuItem, Grid,
  InputAdornment, IconButton, CircularProgress, Chip, Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hook';
import { fetchPublicPlans } from '../features/public/publicSlice';
import { registerThunk } from '../features/auth/authSlice';
import { showNotification } from '../features/notifications/notificationSlice';
import Logo from '../components/common/Logo';
import registerImg from '../assets/meet-register.png';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  businessName: Yup.string().required('Business Name is required'),
  category: Yup.string().required('Category is required'),
  registrationNumber: Yup.string().required('Registration Number is required'),
  requestedPlanId: Yup.string().optional(),
});

const step1Fields = ['name', 'email', 'phone', 'password'] as const;

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

const reviewSteps = [
  {
    icon: <AssignmentTurnedInIcon />,
    title: 'Submit your details',
    desc: 'Tell us about your business — what you do, and how customers should reach you.',
  },
  {
    icon: <FactCheckIcon />,
    title: 'Our team verifies it',
    desc: 'A real person checks every application. Not a bot, not an algorithm — a human review.',
  },
  {
    icon: <RocketLaunchIcon />,
    title: 'You go live',
    desc: 'Once approved, your booking link, QR code and calendar sync are ready instantly.',
  },
];

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plans, plansLoading } = useAppSelector((state) => state.public);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    dispatch(fetchPublicPlans());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      businessName: '',
      category: '',
      registrationNumber: '',
      requestedPlanId: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(registerThunk(values)).unwrap();
        dispatch(showNotification({ message: 'Registration successful!' }));
        navigate('/business');
      } catch (error: any) {
        const errMsg = typeof error === 'string' ? error : error?.message || 'Registration failed';
        dispatch(showNotification({ message: errMsg, failure: true }));
      }
    },
  });

  const handleContinue = async () => {
    const errors = await formik.validateForm();
    const blocking = step1Fields.filter((f) => errors[f]);
    if (blocking.length > 0) {
      const touched: Record<string, boolean> = {};
      step1Fields.forEach((f) => { touched[f] = true; });
      formik.setTouched({ ...formik.touched, ...touched });
      return;
    }
    setStep(1);
  };

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
      <Box sx={{
        display: { xs: 'block', md: 'none' },
        position: 'relative',
        width: '100%',
        height: { xs: 190, sm: 240 },
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <Box
          component="img"
          src={registerImg}
          alt="Verified business onboarding"
          sx={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 30%',
          }}
        />
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.8) 100%)',
        }} />
        <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: { xs: 2.5, sm: 3 } }}>
          <Chip
            icon={<VerifiedUserIcon sx={{ fontSize: '14px !important', color: 'white !important' }} />}
            label="Verified Business Platform"
            size="small"
            sx={{ mb: 1, alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)' }}
          />
          <Typography sx={{ color: 'white', fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.3rem' }, lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            Every business is reviewed by a real person — not an algorithm.
          </Typography>
        </Box>
      </Box>

      <Box sx={{
        width: { xs: '100%', md: '50%' },
        display: 'flex', flexDirection: 'column',
        px: { xs: 3, sm: 6, md: 6, lg: 8 },
        py: { xs: 4, md: 6 },
        bgcolor: 'white',
      }}>
        <Box sx={{ mb: { xs: 4, md: 5 }, display: { xs: 'none', md: 'block' } }}>
          <Logo size="medium" />
        </Box>

        <Box sx={{ maxWidth: 440, mx: { xs: 'auto', md: 0 }, width: '100%', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
              STEP {step + 1} OF 2
            </Typography>
            <Box sx={{ flexGrow: 1, height: 4, borderRadius: 4, bgcolor: '#eef2f1', overflow: 'hidden' }}>
              <motion.div
                initial={false}
                animate={{ width: step === 0 ? '50%' : '100%' }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ height: '100%', background: '#659287', borderRadius: 4 }}
              />
            </Box>
          </Box>

          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px', fontSize: { xs: '1.6rem', sm: '2rem' } }}>
                  Create your account
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Let's start with a few details about you.
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    fullWidth
                    sx={fieldSx}
                    id="name"
                    name="name"
                    label="Full Name"
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
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password as string}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={handleContinue}
                  sx={{ mt: 4, py: 1.6, fontWeight: 700, fontSize: '1rem' }}
                >
                  Continue
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.5px', fontSize: { xs: '1.6rem', sm: '2rem' } }}>
                  Tell us about your business
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  This is what our review team will look at.
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <TextField
                      fullWidth
                      sx={fieldSx}
                      id="businessName"
                      name="businessName"
                      label="Business Name"
                      value={formik.values.businessName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.businessName && Boolean(formik.errors.businessName)}
                      helperText={formik.touched.businessName && formik.errors.businessName as string}
                    />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          sx={fieldSx}
                          id="category"
                          name="category"
                          label="Business Category"
                          placeholder="e.g. Garage, Clinic..."
                          value={formik.values.category}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.category && Boolean(formik.errors.category)}
                          helperText={formik.touched.category && formik.errors.category as string}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          sx={fieldSx}
                          id="registrationNumber"
                          name="registrationNumber"
                          label="Registration Number"
                          value={formik.values.registrationNumber}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.registrationNumber && Boolean(formik.errors.registrationNumber)}
                          helperText={formik.touched.registrationNumber && formik.errors.registrationNumber as string}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      select
                      sx={fieldSx}
                      id="requestedPlanId"
                      name="requestedPlanId"
                      label="Select a Plan (Optional)"
                      value={formik.values.requestedPlanId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={formik.touched.requestedPlanId && Boolean(formik.errors.requestedPlanId)}
                      helperText={formik.touched.requestedPlanId && formik.errors.requestedPlanId as string}
                      disabled={plansLoading}
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {plans.map((plan: any) => (
                        <MenuItem key={plan._id} value={plan._id}>
                          {plan.name} {plan.variants && plan.variants.length > 0 ? ` - Starts at ₹${Math.min(...plan.variants.map((v: any) => v.price))}` : (plan.price ? ` - ₹${plan.price}` : '')}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1.5, mt: 4 }}>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      startIcon={<ArrowBackIcon />}
                      onClick={() => setStep(0)}
                      sx={{ py: 1.6, px: 2.5, fontWeight: 700, borderColor: '#e2e8f0', color: 'text.secondary' }}
                    >
                      Back
                    </Button>
                    <Button
                      fullWidth
                      color="primary"
                      variant="contained"
                      type="submit"
                      size="large"
                      disabled={formik.isSubmitting}
                      sx={{ py: 1.6, fontWeight: 700, fontSize: '1rem' }}
                    >
                      {formik.isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Register'}
                    </Button>
                  </Box>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <Typography variant="body2" sx={{ mt: 5, textAlign: 'center', color: 'text.secondary' }}>
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
          alt="Verified business onboarding"
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
              icon={<VerifiedUserIcon sx={{ fontSize: '16px !important', color: 'white !important' }} />}
              label="Verified Business Platform"
              sx={{ mb: { md: 2, lg: 3 }, bgcolor: 'rgba(255,255,255,0.16)', color: 'white', fontWeight: 700, backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)' }}
            />
            <Typography sx={{
              color: 'white', fontWeight: 800, mb: 1.5, lineHeight: 1.22,
              fontSize: { md: '1.5rem', lg: '2rem' },
              textShadow: '0 2px 12px rgba(0,0,0,0.35)',
            }}>
              Every business is reviewed by a real person — not an algorithm.
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.82)', mb: { md: 3, lg: 5 }, maxWidth: 420, fontSize: { md: '0.9rem', lg: '1rem' } }}>
              That's how we keep booking pages on Slotify trustworthy for the customers who use them.
            </Typography>
          </motion.div>

          <Box sx={{ position: 'relative', pl: 1 }}>
            <Box sx={{ position: 'absolute', left: { md: 19, lg: 23 }, top: 12, bottom: 12, width: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />

            {reviewSteps.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
              >
                <Box sx={{ display: 'flex', gap: { md: 2, lg: 2.5 }, mb: i === reviewSteps.length - 1 ? 0 : { md: 2.5, lg: 4 }, position: 'relative' }}>
                  <Box sx={{
                    width: { md: 40, lg: 48 }, height: { md: 40, lg: 48 }, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'rgba(255,255,255,0.97)', color: 'primary.dark',
                    '& svg': { fontSize: { md: 20, lg: 24 } },
                  }}>
                    {s.icon}
                  </Box>
                  <Box sx={{ pt: 0.6 }}>
                    <Typography sx={{ color: 'white', fontWeight: 700, mb: 0.3, fontSize: { md: '0.9rem', lg: '1rem' }, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
                      {s.title}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.78)', maxWidth: 320, fontSize: { md: '0.8rem', lg: '0.875rem' } }}>
                      {s.desc}
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
                { value: '500+', label: 'Businesses onboarded' },
                { value: '24h', label: 'Avg. review time' },
                { value: '100%', label: 'Manually verified' },
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