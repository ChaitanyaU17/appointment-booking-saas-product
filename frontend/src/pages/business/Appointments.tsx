import { useEffect, useState, useMemo } from 'react';
import { Skeleton, Box, Typography, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Link,
  Dialog, DialogTitle, DialogContent, TextField, Button, Grid, IconButton, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { showNotification } from '../../features/notifications/notificationSlice';
import { formatIST } from '../../utils/format';
import { getStatusColor } from '../../utils/roleColors';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchAppointments, createAppointment, updateAppointmentStatus, recordPayment } from '../../features/appointments/appointmentsSlice';
import SearchBar from '../../components/common/SearchBar';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const tabs = [
  { label: 'Calendar View', params: {} },
  { label: 'Upcoming', params: { timeframe: 'upcoming' } },
  { label: 'All Appointments', params: {} },
];

export default function Appointments() {
  const dispatch = useAppDispatch();
  const { data: appointments, loading } = useAppSelector((state) => state.appointments);

  const [tab, setTab] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const queryParams = useMemo(() => {
    const params: any = { ...tabs[tab].params };
    if (statusFilter !== 'All') params.status = statusFilter;
    if (searchQuery) params.search = searchQuery;
    return new URLSearchParams(params).toString();
  }, [tab, statusFilter, searchQuery]);

  useEffect(() => {
    dispatch(fetchAppointments(queryParams));
  }, [queryParams, dispatch]);

  const events = useMemo(() => {
    return (appointments || []).map(a => ({
      title: `${a.title} (${a.customerName})`,
      start: new Date(a.startTime),
      end: new Date(a.endTime),
      resource: a
    }));
  }, [appointments]);

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setWalkInOpen(true);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
    setDetailOpen(true);
  };

  const eventPropGetter = (event: any) => {
    let backgroundColor = '#0288d1';
    if (event.resource.status === 'Pending') backgroundColor = '#ed6c02';
    if (event.resource.status === 'Completed') backgroundColor = '#2e7d32';
    if (event.resource.status === 'Cancelled') backgroundColor = '#9e9e9e';
    
    return { style: {backgroundColor, borderRadius: '4px', opacity: 0.9, color: 'white', border: '0px', display: 'block'}};
  };

  const formik = useFormik({
    initialValues: { customerName: '', customerEmail: '', customerPhone: '', title: 'Walk-in', price: 0 },
    validationSchema: Yup.object({
      customerName: Yup.string().required('Required'),
      customerPhone: Yup.string()
        .matches(/^([6-9]\d{9})?$/, 'Must be exactly 10 digits starting with 6-9')
        .notRequired(),
      title: Yup.string().required('Required'),
      price: Yup.number().min(0, 'Must be positive')
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!selectedSlot) return;
      try {
        await dispatch(createAppointment({
          ...values,
          startTime: selectedSlot.start.toISOString(),
          endTime: selectedSlot.end.toISOString(),
          type: 'Walk-in'
        })).unwrap();
        dispatch(showNotification({ message: 'Walk-in created successfully!' }));
        setWalkInOpen(false);
        resetForm();
        dispatch(fetchAppointments(queryParams));
      } catch (error: any) {
        const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to create Walk-in';
        dispatch(showNotification({ message: errorMsg, failure: true }));
      }
    }
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await dispatch(updateAppointmentStatus({ id, status })).unwrap();
      dispatch(showNotification({ message: `Appointment marked as ${status}` }));
      setDetailOpen(false);
      dispatch(fetchAppointments(queryParams));
    } catch (error: any) {
      const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to update status';
      dispatch(showNotification({ message: errorMsg, failure: true }));
    }
  };

  const handlePayment = async () => {
    if (!selectedEvent) return;
    try {
      dispatch(showNotification({ message: `Processing payment of ₹${selectedEvent.price}...` }));
      
      await dispatch(recordPayment({
        id: selectedEvent._id,
        data: {
          status: 'Paid',
          amount: selectedEvent.price
        }
      })).unwrap();
      
      dispatch(showNotification({ message: `Payment of ₹${selectedEvent.price} successful!` }));
      setPaymentModalOpen(false);
      setDetailOpen(false);
      dispatch(fetchAppointments(queryParams));
    } catch (error: any) {
      dispatch(showNotification({ message: error || 'Payment failed', failure: true }));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{fontWeight: 700}} color="primary" gutterBottom>
            Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View and manage your bookings. Click on the calendar to add a Walk-in.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search customer..."
          />
          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(_, val) => val && setStatusFilter(val)}
            size="small"
          >
            <ToggleButton value="All">All</ToggleButton>
            <ToggleButton value="Pending">Pending</ToggleButton>
            <ToggleButton value="Completed">Completed</ToggleButton>
            <ToggleButton value="Cancelled">Cancelled</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {tabs.map((t) => <Tab key={t.label} label={t.label} />)}
      </Tabs>

      {loading && (!appointments || appointments.length === 0) ? (
        <Skeleton variant="rounded" height={800} />
      ) : tab === 0 ? (
        <Paper sx={{ p: 2, height: 800 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            view={currentView}
            onView={(view) => setCurrentView(view)}
            views={[Views.MONTH, Views.WEEK, Views.DAY]}
            step={30}
            timeslots={2}
            eventPropGetter={eventPropGetter}
          />
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(appointments || []).map((a) => (
                <TableRow key={a._id} hover>
                  <TableCell>{formatIST(a.startTime)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{fontWeight: 600}}>{a.customerName}</Typography>
                    <Typography variant="caption" color="text.secondary">{a.customerEmail}</Typography>
                  </TableCell>
                  <TableCell>{a.title}</TableCell>
                  <TableCell>₹{a.price || 0}</TableCell>
                  <TableCell>
                    {a.type === 'Google Meet' && a.meetLink ? (
                      <Link href={a.meetLink} target="_blank" rel="noopener">Join Meet</Link>
                    ) : (
                      a.type
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={a.status} size="small" color={getStatusColor(a.status)} variant="outlined" />
                    {a.paymentStatus === 'Paid' && <Chip label="Paid" size="small" color="success" sx={{ ml: 1 }} />}
                  </TableCell>
                  <TableCell align="right">
                    {a.status !== 'Completed' && a.status !== 'Cancelled' ? (
                      <Button 
                        size="small" 
                        variant="outlined" 
                        color="success" 
                        onClick={() => handleUpdateStatus(a._id, 'Completed')}
                      >
                        Mark Completed
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(!appointments || appointments.length === 0) && (
                <TableRow><TableCell colSpan={8} align="center">No appointments found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={walkInOpen} onClose={() => setWalkInOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create Walk-in Appointment
          <IconButton onClick={() => setWalkInOpen(false)} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom color="primary">
              Time: {selectedSlot && format(selectedSlot.start, 'PPpp')}
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth id="customerName" name="customerName" label="Customer Name"
                  value={formik.values.customerName} onChange={formik.handleChange}
                  error={formik.touched.customerName && Boolean(formik.errors.customerName)}
                  helperText={formik.touched.customerName && formik.errors.customerName as string}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth id="customerEmail" name="customerEmail" label="Customer Email (Optional)"
                  value={formik.values.customerEmail} onChange={formik.handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth id="customerPhone" name="customerPhone" label="Phone (Optional)"
                  value={formik.values.customerPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    formik.setFieldValue('customerPhone', val);
                  }}
                  error={formik.touched.customerPhone && Boolean(formik.errors.customerPhone)}
                  helperText={formik.touched.customerPhone && formik.errors.customerPhone as string}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth id="title" name="title" label="Service/Title"
                  value={formik.values.title} onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title as string}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth id="price" name="price" label="Price (₹)" type="number"
                  value={formik.values.price} onChange={formik.handleChange}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setWalkInOpen(false)} disabled={formik.isSubmitting}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary" disabled={formik.isSubmitting}>
                {formik.isSubmitting ? 'Saving...' : 'Add Walk-in'}
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Appointment Details
          <IconButton onClick={() => setDetailOpen(false)} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>{selectedEvent.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatIST(selectedEvent.startTime)} - {format(new Date(selectedEvent.endTime), 'h:mm a')}
                  </Typography>
                </Box>
                <Chip label={selectedEvent.status} color={getStatusColor(selectedEvent.status) as any} />
              </Box>

              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Customer Name</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedEvent.customerName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Contact Info</Typography>
                  <Typography variant="body2">{selectedEvent.customerEmail || 'No email provided'}</Typography>
                  <Typography variant="body2">{selectedEvent.customerPhone || 'No phone provided'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Type & Location</Typography>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {selectedEvent.type === 'Walk-in' ? <DirectionsWalkIcon fontSize="small"/> : <LaptopMacIcon fontSize="small"/>}
                    {selectedEvent.type}
                  </Typography>
                  {selectedEvent.meetLink && (
                    <Button size="small" variant="outlined" href={selectedEvent.meetLink} target="_blank" sx={{ mt: 1 }}>
                      Join Google Meet
                    </Button>
                  )}
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">Payment Status</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ₹{selectedEvent.price || 0}
                    {selectedEvent.price > 0 && (
                      <Chip 
                        label={selectedEvent.paymentStatus || 'Pending'} 
                        size="small" 
                        color={selectedEvent.paymentStatus === 'Paid' ? 'success' : 'warning'} 
                        sx={{ ml: 1 }} 
                      />
                    )}
                  </Typography>
                  {selectedEvent.price > 0 && selectedEvent.paymentStatus !== 'Paid' && (
                    <Button size="small" variant="contained" color="success" sx={{ mt: 1 }} onClick={() => setPaymentModalOpen(true)}>
                      Record Payment
                    </Button>
                  )}
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {selectedEvent.status === 'Pending' && (
                  <Button variant="outlined" color="info" onClick={() => handleUpdateStatus(selectedEvent._id, 'Confirmed')}>
                    Confirm
                  </Button>
                )}
                {['Pending', 'Confirmed'].includes(selectedEvent.status) && (
                  <>
                    <Button variant="contained" color="success" onClick={() => handleUpdateStatus(selectedEvent._id, 'Completed')}>
                      Mark Completed
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleUpdateStatus(selectedEvent._id, 'Cancelled')}>
                      Cancel
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Record Payment
          <IconButton onClick={() => setPaymentModalOpen(false)} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedEvent?.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Total Amount Due
            </Typography>
            <Typography variant="h3" color="primary" sx={{ fontWeight: 700, mb: 3 }}>
              ₹{selectedEvent?.price}
            </Typography>
            
            <Button variant="contained" color="success" size="large" fullWidth onClick={handlePayment} sx={{ py: 1.5, fontSize: '1.1rem' }}>
              Confirm Cash/Card Payment
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}