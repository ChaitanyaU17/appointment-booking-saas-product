import { useEffect, useState } from 'react';
import { 
  Skeleton, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Chip, Link,
  Container, Grid, Card, Avatar, Box, Tabs, Tab, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import CancelIcon from '@mui/icons-material/Cancel';
import { formatIST } from '../../utils/format';
import { getStatusColor } from '../../utils/roleColors';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchCustomerAppointments, cancelCustomerAppointment } from '../../features/customer/customerSlice';
import { showNotification } from '../../features/notifications/notificationSlice';

export default function CustomerDashboard() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { appointments, appointmentsLoading: loading } = useAppSelector((state) => state.customer);
  const [tab, setTab] = useState(0);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchCustomerAppointments());
  }, [dispatch]);

  const upcoming = appointments.filter(a => ['Pending', 'Confirmed'].includes(a.status));
  const history = appointments.filter(a => ['Completed', 'Cancelled'].includes(a.status));
  
  const displayedAppointments = tab === 0 ? upcoming : history;

  const handleCancelClick = (appointment: any) => {
    setAppointmentToCancel(appointment);
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;
    try {
      await dispatch(cancelCustomerAppointment(appointmentToCancel._id)).unwrap();
      dispatch(showNotification({ message: 'Appointment cancelled successfully' }));
    } catch (error: any) {
      dispatch(showNotification({ message: error || 'Failed to cancel appointment', failure: true }));
    } finally {
      setCancelModalOpen(false);
      setAppointmentToCancel(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, borderRadius: 4, textAlign: 'center', boxShadow: '0 2px 12px rgba(31,43,39,0.06)' }}>
            <Avatar 
              sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.light' }}
            >
              <PersonIcon fontSize="large" />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {user?.name || 'Customer'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, wordBreak: 'break-word' }}>
              {user?.email}
            </Typography>
            <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Total Bookings
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {appointments.length}
              </Typography>
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary" gutterBottom>
            My Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            View and manage all of your bookings.
          </Typography>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
            <Tab label={`Upcoming (${upcoming.length})`} />
            <Tab label={`History (${history.length})`} />
          </Tabs>

          {loading ? (
            <Skeleton variant="rounded" height={300} />
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Business & Service</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedAppointments.length > 0 ? displayedAppointments.map((a) => (
                    <TableRow key={a._id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatIST(a.startTime)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {a.businessId?.name || 'Unknown Business'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {a.title}
                        </Typography>
                        {a.type === 'Google Meet' && a.meetLink && (
                          <Link href={a.meetLink} target="_blank" rel="noopener" variant="caption" sx={{ display: 'inline-block', mt: 0.5 }}>
                            Join Google Meet
                          </Link>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={a.status} size="small" color={getStatusColor(a.status) as any} />
                      </TableCell>
                      <TableCell align="right">
                        {tab === 0 && (
                          <Button 
                            variant="outlined" 
                            color="error" 
                            size="small"
                            onClick={() => handleCancelClick(a)}
                          >
                            Cancel
                          </Button>
                        )}
                        {tab === 1 && (
                          <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          No {tab === 0 ? 'upcoming' : 'past'} appointments found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>

      <Dialog 
        open={cancelModalOpen} 
        onClose={() => setCancelModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 0 } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Cancel Appointment
          <IconButton size="small" onClick={() => setCancelModalOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <CancelIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="body1">
              Are you sure you want to cancel your appointment for <b>{appointmentToCancel?.title}</b>?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCancelModalOpen(false)} color="inherit">Keep it</Button>
          <Button onClick={confirmCancel} variant="contained" color="error">Yes, Cancel</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
