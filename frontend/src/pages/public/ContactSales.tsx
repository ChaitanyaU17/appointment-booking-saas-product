import { Box, Typography, Container, Grid, TextField, Button, Alert, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useAppDispatch } from '../../hook';
import { createDemoRequest } from '../../features/public/publicSlice';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';

const validationSchema = Yup.object({
  name: Yup.string().required('Full Name is required'),
  email: Yup.string().email('Invalid email address').required('Work Email is required'),
  phone: Yup.string().required('Phone Number is required'),
  businessName: Yup.string().required('Company Name is required'),
  message: Yup.string(),
});

export default function ContactSales() {
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      businessName: '',
      message: '',
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setStatus('idle');
      setErrorMsg('');
      try {
        await dispatch(createDemoRequest(values)).unwrap();
        setStatus('success');
        resetForm();
      } catch (err: any) {
        setStatus('error');
        setErrorMsg(typeof err === 'string' ? err : 'Failed to submit request.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  const benefits = [
    'Automate your booking workflow entirely',
    'Integrate with your existing tools and calendar',
    'Understand how our API and Webhooks can scale your operations',
    'Learn about our Enterprise-grade security and compliance',
    'Get personalized onboarding and dedicated support'
  ];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Grid container spacing={8} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
              Talk to our Sales team
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, mb: 6, lineHeight: 1.6 }}>
              Whether you're looking for a custom enterprise setup, API access, or just want to see how Slotify can accelerate your business growth, we're here to help.
            </Typography>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
              What you can expect:
            </Typography>
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {benefits.map((text, i) => (
                <ListItem key={i} disablePadding sx={{ alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.3 }}><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={<Typography sx={{ color: 'text.primary', fontWeight: 500 }}>{text}</Typography>} />
                </ListItem>
              ))}
            </List>
          </Grid>
          
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(15,23,42,0.05)' }}>
              {status === 'success' ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Request Received!</Typography>
                  <Typography color="text.secondary">Our team will be in touch with you shortly to schedule a demo.</Typography>
                </Box>
              ) : (
                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={3}>
                    {status === 'error' && (
                      <Grid size={{ xs: 12 }}>
                        <Alert severity="error">{errorMsg}</Alert>
                      </Grid>
                    )}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField 
                        fullWidth 
                        label="Full Name" 
                        name="name"
                        value={formik.values.name} 
                        onChange={formik.handleChange} 
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField 
                        fullWidth 
                        label="Work Email" 
                        name="email"
                        type="email" 
                        value={formik.values.email} 
                        onChange={formik.handleChange} 
                        onBlur={formik.handleBlur}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField 
                        fullWidth 
                        label="Phone Number" 
                        name="phone"
                        value={formik.values.phone} 
                        onChange={formik.handleChange} 
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField 
                        fullWidth 
                        label="Company Name" 
                        name="businessName"
                        value={formik.values.businessName} 
                        onChange={formik.handleChange} 
                        onBlur={formik.handleBlur}
                        error={formik.touched.businessName && Boolean(formik.errors.businessName)}
                        helperText={formik.touched.businessName && formik.errors.businessName}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <TextField 
                        fullWidth 
                        label="How can we help?" 
                        name="message"
                        multiline 
                        rows={4} 
                        value={formik.values.message} 
                        onChange={formik.handleChange} 
                        onBlur={formik.handleBlur}
                        error={formik.touched.message && Boolean(formik.errors.message)}
                        helperText={formik.touched.message && formik.errors.message}
                      />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <Button fullWidth type="submit" variant="contained" color="primary" size="large" disabled={formik.isSubmitting} sx={{ py: 1.8, fontWeight: 700, fontSize: '1.05rem' }}>
                        {formik.isSubmitting ? 'Submitting...' : 'Contact Sales'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
