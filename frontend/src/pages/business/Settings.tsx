import { useState, useEffect } from 'react';
import { Skeleton, Box, Card, Typography, TextField, Button, Grid, Divider,
  CircularProgress, Switch, FormControlLabel, Alert, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, Chip } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { dayNames } from '../../utils/format';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchBusinessSettings, updateBusinessSettings, updateBusinessPlan, connectGoogleCalendar, fetchServices, createService, updateService, deleteService } from '../../features/business/businessSlice';
import { fetchPublicPlans } from '../../features/public/publicSlice';
import InfoTooltip from '../../components/common/InfoTooltip';

interface DayHours { dayOfWeek: number; startTime: string; endTime: string; isClosed: boolean; }

const defaultHours: DayHours[] = dayNames.map((_, i) => ({
  dayOfWeek: i,
  startTime: '09:00',
  endTime: '17:00',
  isClosed: i === 0,
}));

export default function Settings() {
  const dispatch = useAppDispatch();
  const { settingsData: data, settingsLoading, services, servicesLoading } = useAppSelector((state) => state.business);
  const { plans, plansLoading } = useAppSelector((state) => state.public);
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);

  const [bookingUrl, setBookingUrl] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [hours, setHours] = useState<DayHours[]>(defaultHours);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (upgradeModalOpen && plans.length === 0) {
      dispatch(fetchPublicPlans());
    }
  }, [upgradeModalOpen, plans.length, dispatch]);

  const handleUpgradePlan = async (planId: string) => {
    try {
      await dispatch(updateBusinessPlan(planId)).unwrap();
      dispatch(showNotification({ message: 'Plan updated successfully!' }));
      dispatch(fetchBusinessSettings());
      setUpgradeModalOpen(false);
    } catch (e: any) {
      dispatch(showNotification({ message: e, failure: true }));
    }
  };

  useEffect(() => {
    dispatch(fetchBusinessSettings());
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    if (data) {
      setBookingUrl(data.bookingUrl);
      setQrCode(data.qrCode);
      setIsGoogleConnected(data.isGoogleConnected);
      formik.setValues({
        name: data.business.name,
        description: data.business.description || '',
        timezone: data.business.settings?.timezone || 'Asia/Kolkata',
        currency: data.business.settings?.currency || 'INR',
      });
      if (data.business.settings?.availableHours?.length) {
        setHours(data.business.settings.availableHours);
      }
    }
  }, [data]);

  const formik = useFormik({
    initialValues: { name: '', description: '', timezone: 'Asia/Kolkata', currency: 'INR' },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      description: Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        await dispatch(updateBusinessSettings({
          name: values.name,
          description: values.description,
          settings: { timezone: values.timezone, currency: values.currency, availableHours: hours },
        })).unwrap();
        dispatch(showNotification({ message: 'Settings updated successfully' }));
      } catch (error: any) {
        const errMsg = typeof error === 'string' ? error : error?.message || 'Failed to update settings';
        dispatch(showNotification({ message: errMsg, failure: true }));
      } finally {
        setLoading(false);
      }
    },
  });

  const serviceFormik = useFormik({
    initialValues: { name: '', duration: 30, price: 0, description: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      duration: Yup.number().min(5).required('Required'),
      price: Yup.number().min(0).required('Required')
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        if (editingServiceId) {
          await dispatch(updateService({ id: editingServiceId, data: values })).unwrap();
          dispatch(showNotification({ message: 'Service updated' }));
        } else {
          await dispatch(createService(values)).unwrap();
          dispatch(showNotification({ message: 'Service created' }));
        }
        setServiceModalOpen(false);
        resetForm();
        dispatch(fetchServices());
      } catch (e: any) {
        dispatch(showNotification({ message: e || 'Failed to save service', failure: true }));
      }
    },
  });

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await dispatch(deleteService(id)).unwrap();
      dispatch(showNotification({ message: 'Service deleted' }));
      dispatch(fetchServices());
    } catch (e: any) {
      dispatch(showNotification({ message: e || 'Failed to delete service', failure: true }));
    }
  };

  const openServiceModal = (service: any = null) => {
    if (service) {
      setEditingServiceId(service._id);
      serviceFormik.setValues({ name: service.name, duration: service.duration, price: service.price, description: service.description || '' });
    } else {
      setEditingServiceId(null);
      serviceFormik.resetForm();
    }
    setServiceModalOpen(true);
  };

  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    try {
      const resData = await dispatch(connectGoogleCalendar()).unwrap();
      window.location.href = resData.url;
    } catch (error: any) {
      const errMsg = typeof error === 'string' ? error : error?.message || 'Could not start Google connection';
      dispatch(showNotification({ message: errMsg, failure: true }));
    } finally {
      setConnectingGoogle(false);
    }
  };

  const updateHour = (index: number, field: keyof DayHours, value: string | boolean) => {
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  };

  if (settingsLoading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={40} width={200} />
        <Skeleton variant="rounded" height={300} sx={{ mt: 2.5 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{fontWeight: 700}} color="primary" gutterBottom>
        Settings & Billing
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Admin Profile</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: 60, flexShrink: 0 }}>Name</Typography>
                <Typography sx={{ fontWeight: 600 }}>{data?.admin?.name || 'Admin User'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: 60, flexShrink: 0 }}>Email</Typography>
                <Typography sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{data?.admin?.email || 'admin@business.com'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ width: 60, flexShrink: 0 }}>Role</Typography>
                <Chip label={data?.admin?.role || 'Admin'} size="small" color="primary" />
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Subscription Plan</Typography>
              <InfoTooltip title="Your current plan and limits" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, flexGrow: 1 }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="caption" color="text.secondary">Current Plan</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, mb: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    {data?.business?.planId?.name || 'Free'}
                  </Typography>
                  <Chip 
                    label={data?.business?.trialStatus === 'Active' ? 'Trial Active' : 'Active'} 
                    color={data?.business?.trialStatus === 'Active' ? 'secondary' : 'success'} 
                    size="small" 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {data?.business?.trialStatus === 'Active' 
                    ? `Premium Trial` 
                    : (!data?.business?.planId || data.business.planId.price === 0 ? 'Free forever' : `\u20B9${data.business.planId.price} / month`)}
                </Typography>
                
                {data?.business?.isDemoAccount ? (
                  <Typography variant="body2" color="info.main" sx={{ fontStyle: 'italic' }}>
                    Demo Sandbox (Plan modifications disabled)
                  </Typography>
                ) : data?.business?.trialStatus === 'Active' ? (
                  <Typography variant="body2" color="secondary" sx={{ fontStyle: 'italic' }}>
                    Your trial ends in {Math.max(0, Math.ceil((new Date(data.business.trialEndsAt).getTime() - new Date().getTime()) / 86400000))} days. Please contact support to upgrade.
                  </Typography>
                ) : (
                  <Button variant="contained" color="primary" onClick={() => setUpgradeModalOpen(true)}>
                    Upgrade Plan
                  </Button>
                )}
              </Box>

              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Typography variant="caption" color="text.secondary">Usage & Limits</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Services</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {services.length} / {data?.business?.planId?.features?.maxServices >= 9999 ? '∞' : (data?.business?.planId?.features?.maxServices || 1)}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: '#e2e8f0', borderRadius: 3 }}>
                      <Box sx={{ 
                        height: '100%', bgcolor: 'primary.main', borderRadius: 3, 
                        width: `${Math.min(100, (services.length / (data?.business?.planId?.features?.maxServices || 1)) * 100)}%` 
                      }} />
                    </Box>
                  </Box>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Admins</Typography>
                      <Typography variant="body2" color="text.secondary">
                        1 / {data?.business?.planId?.features?.maxAdmins >= 9999 ? '∞' : (data?.business?.planId?.features?.maxAdmins || 1)}
                      </Typography>
                    </Box>
                    <Box sx={{ height: 6, bgcolor: '#e2e8f0', borderRadius: 3 }}>
                      <Box sx={{ height: '100%', bgcolor: 'primary.main', borderRadius: 3, width: `${Math.min(100, (1 / (data?.business?.planId?.features?.maxAdmins || 1)) * 100)}%` }} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 4, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Business Profile</Typography>
              <InfoTooltip title="This information is displayed on your public booking page" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <form onSubmit={formik.handleSubmit}>
              <TextField
                fullWidth margin="normal" id="name" name="name" label="Business Name"
                value={formik.values.name} onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
              <TextField
                fullWidth margin="normal" id="description" name="description" label="Description"
                multiline rows={3} value={formik.values.description} onChange={formik.handleChange}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth margin="normal" id="timezone" name="timezone" label="Timezone"
                    value={formik.values.timezone} onChange={formik.handleChange}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth margin="normal" id="currency" name="currency" label="Currency"
                    value={formik.values.currency} onChange={formik.handleChange}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex' }}>
                <Button type="submit" variant="contained" color="primary">Save Profile</Button>
              </Box>
            </form>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Booking Link & QR</Typography>
              <InfoTooltip title="Share this link or QR code with your customers for direct booking" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
              {qrCode ? <Box component="img" src={qrCode} alt="Booking QR" sx={{ maxWidth: 160, mb: 3 }} /> : <CircularProgress sx={{ mb: 3 }} />}
              <TextField fullWidth value={bookingUrl} slotProps={{ htmlInput: { readOnly: true } }} sx={{ mb: 2 }} />
              <Button
                variant="outlined"
                fullWidth
                onClick={() => { navigator.clipboard.writeText(bookingUrl); dispatch(showNotification({ message: 'Link copied!' })); }}
              >
                Copy Link
              </Button>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Services</Typography>
              <InfoTooltip title="Define the services you offer. Customers will select one during booking." />
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" size="small" onClick={() => openServiceModal()}>
                Add Service
              </Button>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Duration (min)</TableCell>
                  <TableCell>Price (₹)</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.map(s => (
                  <TableRow key={s._id}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.duration}</TableCell>
                    <TableCell>₹{s.price}</TableCell>
                    <TableCell>{s.description || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" onClick={() => openServiceModal(s)}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteService(s._id)}><DeleteIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {services.length === 0 && (
                  <TableRow><TableCell colSpan={5} align="center">No services created yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Google Calendar Integration</Typography>
              <InfoTooltip title="Connect Google Calendar to enable online bookings with auto-generated Meet links" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            {isGoogleConnected ? (
              <Alert severity="success" sx={{ mb: 3 }}>
                {user?.isDemoAccount 
                  ? 'Connected to: demo.salon@gmail.com (Simulated Demo Mode)'
                  : 'Your Google Calendar is successfully connected! Availability is synced and Google Meet links will be generated automatically.'}
              </Alert>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Connect your Google account to sync availability and auto-generate Google Meet links for bookings.
                </Alert>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={!connectingGoogle && <GoogleIcon />}
                  onClick={handleConnectGoogle}
                  disabled={connectingGoogle}
                >
                  {connectingGoogle ? <CircularProgress size={20} color="inherit" /> : 'Connect Google Calendar'}
                </Button>
              </>
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6">Booking Hours</Typography>
              <InfoTooltip title="Set your available hours. Customers can only book during these times" />
            </Box>
            <Divider sx={{ mb: 3 }} />
            {hours.map((h, i) => (
              <Grid container spacing={2} key={h.dayOfWeek} sx={{ mb: 1, alignItems: 'center' }}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Typography sx={{fontWeight: 600}}>{dayNames[h.dayOfWeek]}</Typography>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    fullWidth type="time" label="Start" value={h.startTime}
                    disabled={h.isClosed}
                    onChange={(e) => updateHour(i, 'startTime', e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <TextField
                    fullWidth type="time" label="End" value={h.endTime}
                    disabled={h.isClosed}
                    onChange={(e) => updateHour(i, 'endTime', e.target.value)}
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch checked={h.isClosed} onChange={(e) => updateHour(i, 'isClosed', e.target.checked)} />
                    }
                    label="Closed"
                  />
                </Grid>
              </Grid>
            ))}
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => formik.handleSubmit()}>
              Save Working Hours
            </Button>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={serviceModalOpen} onClose={() => setServiceModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editingServiceId ? 'Edit Service' : 'Add Service'}
          <IconButton onClick={() => setServiceModalOpen(false)} aria-label="close" size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={serviceFormik.handleSubmit} sx={{ mt: 1 }}>
            <TextField fullWidth margin="normal" id="name" name="name" label="Service Name" value={serviceFormik.values.name} onChange={serviceFormik.handleChange} error={serviceFormik.touched.name && Boolean(serviceFormik.errors.name)} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth margin="normal" id="duration" name="duration" label="Duration (min)" type="number" value={serviceFormik.values.duration} onChange={serviceFormik.handleChange} error={serviceFormik.touched.duration && Boolean(serviceFormik.errors.duration)} />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField fullWidth margin="normal" id="price" name="price" label="Price (₹)" type="number" value={serviceFormik.values.price} onChange={serviceFormik.handleChange} error={serviceFormik.touched.price && Boolean(serviceFormik.errors.price)} />
              </Grid>
            </Grid>
            <TextField fullWidth margin="normal" id="description" name="description" label="Description" multiline rows={2} value={serviceFormik.values.description} onChange={serviceFormik.handleChange} />
            <Button fullWidth variant="contained" color="primary" type="submit" sx={{ mt: 3 }}>Save Service</Button>
          </Box>
        </DialogContent>
      </Dialog>
      <Dialog open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Change Your Plan
          <IconButton onClick={() => setUpgradeModalOpen(false)} aria-label="close" size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {plansLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={3}>
              {plans.map((plan) => (
                <Grid size={{ xs: 12, md: 4 }} key={plan._id}>
                  <Card sx={{ 
                    p: 3, 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    border: data?.business?.planId?._id === plan._id ? '2px solid' : '1px solid',
                    borderColor: data?.business?.planId?._id === plan._id ? 'primary.main' : 'divider',
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{plan.name}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, my: 2 }}>
                      {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                      <Typography variant="caption" color="text.secondary">/month</Typography>
                    </Typography>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>• Up to {plan.features.maxServices >= 9999 ? 'Unlimited' : plan.features.maxServices} Services</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>• Up to {plan.features.maxAdmins >= 9999 ? 'Unlimited' : plan.features.maxAdmins} Admins</Typography>
                      {plan.features.googleMeetIntegration && <Typography variant="body2" sx={{ mb: 1 }}>• Google Meet Integration</Typography>}
                    </Box>
                    <Button 
                      variant={data?.business?.planId?._id === plan._id ? 'outlined' : 'contained'} 
                      color="primary" 
                      fullWidth 
                      sx={{ mt: 3 }}
                      disabled={data?.business?.planId?._id === plan._id}
                      onClick={() => handleUpgradePlan(plan._id)}
                    >
                      {data?.business?.planId?._id === plan._id ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
