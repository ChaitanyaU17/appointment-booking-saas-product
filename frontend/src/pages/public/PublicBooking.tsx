import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton, Box, Typography, Container, Card, Grid, Button, TextField, CircularProgress, 
Dialog, DialogTitle, DialogContent, IconButton, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showNotification } from '../../features/notifications/notificationSlice';
import { format, startOfToday } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import GoogleIcon from '../../components/common/GoogleIcon';

import { useAppDispatch, useAppSelector } from '../../hook';
import { 
  fetchPublicBusiness, fetchPublicSlots, fetchMyAppointments, 
  bookAppointment, publicGoogleLogin 
} from '../../features/public/publicSlice';
import { useNavigate } from 'react-router-dom';

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  const { 
    business, businessLoading: loading, 
    slots, slotsLoading: loadingSlots, googleConnected,
    myAppointments
  } = useAppSelector((state) => state.public);

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedSlot, setSelectedSlot] = useState<{startTime: string, endTime: string} | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  useEffect(() => {
    if (slug) {
      dispatch(fetchPublicBusiness(slug));
    }
  }, [slug, dispatch]);

  useEffect(() => {
    if (!business || !slug) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    dispatch(fetchPublicSlots({ slug, dateStr }));
  }, [slug, selectedDate, business, dispatch]);

  useEffect(() => {
    if (isAuthenticated && slug) {
      dispatch(fetchMyAppointments(slug));
    }
  }, [isAuthenticated, slug, dispatch]);

  const formik = useFormik({
    initialValues: {
      customerName: user?.name || '',
      customerEmail: user?.email || '',
      customerPhone: '',
      title: 'General Consultation',
      description: '',
      type: 'Google Meet',
      serviceId: '',
      price: 0,
    },
    validationSchema: Yup.object({
      customerName: Yup.string().required('Required'),
      customerEmail: Yup.string().email('Invalid email address').required('Required'),
      customerPhone: Yup.string()
        .matches(/^[6-9]\d{9}$/, 'Must be exactly 10 digits starting with 6-9')
        .required('Required'),
      title: Yup.string().required('Required'),
      type: Yup.string().required('Required'),
      serviceId: Yup.string().test(
        'required-if-services-exist',
        'Please select a service',
        function (value) {
          if (business && business.services && business.services.length > 0) {
            return !!value;
          }
          return true;
        }
      ),
    }),
    onSubmit: async (values) => {
      if (!selectedSlot || !slug) return;
      try {
        const result = await dispatch(bookAppointment({
          slug,
          data: {
            ...values,
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime
          }
        })).unwrap();
        
        const createdAppt = result.appointment || result;
        
        dispatch(showNotification({ message: 'Appointment booked successfully!' }));
        setCreatedAppointment(createdAppt);
        setBookingSuccess(true);
        
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        dispatch(fetchPublicSlots({ slug, dateStr }));
        if (isAuthenticated) {
          dispatch(fetchMyAppointments(slug));
        }
      } catch (error: any) {
        const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to book appointment';
        dispatch(showNotification({ message: errorMsg, failure: true }));
      }
    },
  });

  const handleSlotClick = (slot: {startTime: string, endTime: string}) => {
    setSelectedSlot(slot);
    setBookingDialogOpen(true);
  };

  const handleGoogleLogin = async () => {
    if (!slug) return;
    try {
      const resData = await dispatch(publicGoogleLogin(slug)).unwrap();
      window.location.href = resData.url;
    } catch (error: any) {
      const errMsg = typeof error === 'string' ? error : error?.message || 'Failed to initiate Google Login';
      dispatch(showNotification({ message: errMsg, failure: true }));
    }
  };

  if (loading) return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Skeleton variant="rounded" height={200} />
      <Box sx={{ mt: 4 }}><Skeleton variant="rounded" height={400} /></Box>
    </Container>
  );

  if (!business) return <Typography align="center" sx={{ mt: 4 }}>Business not found</Typography>;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card sx={{ p: 4, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h3" gutterBottom>{business.name}</Typography>
        <Typography variant="h6">{business.description}</Typography>
      </Card>

      {isAuthenticated && myAppointments && myAppointments.length > 0 && (
        <Card sx={{ p: 3, mb: 4, border: '2px solid', borderColor: 'secondary.main' }}>
          <Typography variant="h5" gutterBottom color="secondary.main" sx={{ fontWeight: 600 }}>
            Your Upcoming Appointments Here
          </Typography>
          <Grid container spacing={2}>
            {myAppointments.map(appt => (
              <Grid size={{ xs: 12, sm: 6 }} key={appt._id}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{appt.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(new Date(appt.startTime), 'PPP p')} - {format(new Date(appt.endTime), 'p')}
                  </Typography>
                  {appt.meetLink && (
                    <Button 
                      variant="contained" 
                      color="secondary" 
                      size="small" 
                      href={appt.meetLink} 
                      target="_blank"
                      sx={{ mt: 1 }}
                    >
                      Join Google Meet
                    </Button>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h5" gutterBottom>Select a Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateCalendar
                value={selectedDate}
                onChange={(newDate) => {
                  if (newDate) setSelectedDate(newDate);
                }}
                disablePast
              />
            </LocalizationProvider>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Available Slots for {format(selectedDate, 'MMMM d, yyyy')}
            </Typography>
            
            {loadingSlots ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4, height: '100%', alignItems: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {slots && slots.length > 0 ? slots.map((slot, index) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={index}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      onClick={() => handleSlotClick(slot)}
                      sx={{ 
                        py: 2, 
                        borderColor: 'primary.main', 
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'success.main', color: 'black' }
                      }}
                    >
                      {format(new Date(slot.startTime), 'hh:mm a')}
                    </Button>
                  </Grid>
                )) : (
                  <Grid size={{ xs: 12 }}>
                    <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                      {!googleConnected 
                        ? "This business has not yet enabled online booking."
                        : "No slots available for this day."}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </Card>
        </Grid>
      </Grid>

      <Dialog 
        open={bookingDialogOpen} 
        onClose={() => {
          setBookingDialogOpen(false);
          if (bookingSuccess) {
            setTimeout(() => {
              setBookingSuccess(false);
              setCreatedAppointment(null);
            }, 300);
          }
        }} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        {bookingSuccess ? (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'success.main' }}>
              Booking Confirmed!
            </Typography>
            <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
              Your appointment with {business.name} is successfully scheduled.
            </Typography>

            <Card variant="outlined" sx={{ width: '100%', p: 3, mb: 4, borderRadius: 2, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>APPOINTMENT DETAILS</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{createdAppointment?.title}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 2 }}>
                <EventAvailableIcon fontSize="small" color="primary" />
                <Typography variant="body1">
                  {createdAppointment?.startTime && format(new Date(createdAppointment.startTime), 'EEEE, MMMM do, yyyy')}
                  <br />
                  {createdAppointment?.startTime && format(new Date(createdAppointment.startTime), 'h:mm a')} - {createdAppointment?.endTime && format(new Date(createdAppointment.endTime), 'h:mm a')}
                </Typography>
              </Box>
              {createdAppointment?.type === 'Google Meet' && (
                <Button 
                  variant="contained" 
                  color="secondary" 
                  fullWidth
                  href={createdAppointment.meetLink} 
                  target="_blank"
                >
                  Join Google Meet
                </Button>
              )}
            </Card>

            <Box sx={{ display: 'flex', gap: 2, width: '100%', flexDirection: isMobile ? 'column' : 'row' }}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={() => {
                  setBookingSuccess(false);
                  setCreatedAppointment(null);
                  setBookingDialogOpen(false);
                }}
              >
                Book Another
              </Button>
            </Box>
          </Box>
        ) : (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Book Appointment
              <IconButton onClick={() => setBookingDialogOpen(false)} aria-label="close" size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {!isAuthenticated ? (
                <Box sx={{ mt: 2, textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" gutterBottom sx={{ mb: 3 }}>
                    You must be signed in to book an appointment.
                  </Typography>
                  <Button variant="contained" sx={{backgroundColor: 'white', color: '#000'}} onClick={handleGoogleLogin}>
                    <GoogleIcon sx={{backgroundColor: 'transparent', mr: 1, fontSize: 20 }} />
                    Sign in with Google
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Time: <strong>
                      {selectedSlot && format(new Date(selectedSlot.startTime), 'PPP p')}
                    </strong>
                  </Typography>
                  
                  {business?.services && business.services.length > 0 ? (
                    <TextField
                      select
                      fullWidth
                      margin="normal"
                      id="serviceId"
                      name="serviceId"
                      label="Select Service"
                      value={formik.values.serviceId}
                      onChange={(e) => {
                        const selectedServiceId = e.target.value;
                        const service = business.services.find((s: any) => s._id === selectedServiceId);
                        formik.setFieldValue('serviceId', selectedServiceId);
                        if (service) {
                          formik.setFieldValue('title', service.name);
                          formik.setFieldValue('price', service.price);
                          formik.setFieldValue('duration', service.duration);
                        }
                      }}
                      error={formik.touched.serviceId && Boolean(formik.errors.serviceId)}
                      helperText={formik.touched.serviceId && formik.errors.serviceId as string}
                    >
                      {business.services.map((service: any) => (
                        <MenuItem key={service._id} value={service._id}>
                          {service.name} — {service.duration} min — ₹{service.price}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : (
                    <TextField
                      fullWidth
                      margin="normal"
                      id="title"
                      name="title"
                      label="Appointment Title"
                      value={formik.values.title}
                      onChange={formik.handleChange}
                      error={formik.touched.title && Boolean(formik.errors.title)}
                      helperText={formik.touched.title && formik.errors.title as string}
                    />
                  )}

                  <TextField
                    fullWidth
                    margin="normal"
                    id="customerName"
                    name="customerName"
                    label="Your Name"
                    value={formik.values.customerName}
                    onChange={formik.handleChange}
                    error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                    helperText={formik.touched.customerName && formik.errors.customerName as string}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    id="customerPhone"
                    name="customerPhone"
                    label="Phone Number"
                    value={formik.values.customerPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      formik.setFieldValue('customerPhone', val);
                    }}
                    error={formik.touched.customerPhone && Boolean(formik.errors.customerPhone)}
                    helperText={formik.touched.customerPhone && formik.errors.customerPhone as string}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    id="description"
                    name="description"
                    label="Notes / Description"
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                  />

                  <Box sx={{ 
                    mt: 4,
                    ...(isMobile && {
                      position: 'sticky',
                      bottom: 0,
                      bgcolor: 'background.paper',
                      p: 2,
                      borderTop: '1px solid #eee',
                      mx: -3,
                      mb: -3
                    })
                  }}>
                    <Button 
                      color="primary" 
                      variant="contained" 
                      fullWidth 
                      type="submit"
                      disabled={formik.isSubmitting}
                      size="large"
                    >
                      {formik.isSubmitting ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
}
