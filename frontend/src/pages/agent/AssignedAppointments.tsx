import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box, Typography, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Avatar, FormControl, InputLabel, Select, MenuItem,
  Skeleton, Dialog, DialogTitle, DialogContent, DialogActions,
  Stack
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useAppDispatch, useAppSelector } from '../../hook';
import { showNotification } from '../../features/notifications/notificationSlice';
import { fetchAgentAppointments, fetchAssignedShops, updateAgentAppointmentStatus } from '../../features/agent/agentSlice';

export default function AssignedAppointments() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialShopId = searchParams.get('shopId') || 'all';

  const { appointments, appointmentsLoading, assignedShops } = useAppSelector((state) => state.agent);
  const { user } = useAppSelector((state) => state.auth);

  const [selectedShopId, setSelectedShopId] = useState(initialShopId);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('Pending');

  const canManageAppointments = user?.permissions?.canManageAppointments !== false;

  useEffect(() => {
    dispatch(fetchAssignedShops());
  }, [dispatch]);

  useEffect(() => {
    const params: any = {};
    if (selectedShopId !== 'all') params.businessId = selectedShopId;
    if (selectedStatus !== 'all') params.status = selectedStatus;
    dispatch(fetchAgentAppointments(params));
  }, [dispatch, selectedShopId, selectedStatus]);

  const handleOpenStatusDialog = (apt: any) => {
    setActiveAppointment(apt);
    const currentStatus = apt.status === 'Confirmed' ? 'Pending' : (apt.status || 'Pending');
    setNewStatus(currentStatus);
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!activeAppointment) return;
    try {
      await dispatch(
        updateAgentAppointmentStatus({
          appointmentId: activeAppointment._id,
          status: newStatus,
        })
      ).unwrap();
      dispatch(showNotification({ message: 'Appointment status updated successfully!' }));
      setStatusDialogOpen(false);
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to update status', failure: true }));
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Assigned Bookings
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            View and manage customer appointments for your assigned shops.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'background.paper' }}>
            <InputLabel>Filter by Shop</InputLabel>
            <Select
              value={selectedShopId}
              label="Filter by Shop"
              onChange={(e) => {
                setSelectedShopId(e.target.value);
                setSearchParams(e.target.value === 'all' ? {} : { shopId: e.target.value });
              }}
            >
              <MenuItem value="all">All Assigned Shops</MenuItem>
              {assignedShops.map((shop: any) => (
                <MenuItem key={shop._id} value={shop._id}>
                  {shop.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'background.paper' }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {appointmentsLoading ? (
        <Stack spacing={1.5}>
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} variant="rounded" height={60} />
          ))}
        </Stack>
      ) : appointments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed #cbd5e1' }}>
          <EventIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }} color="text.secondary">
            No appointments found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            There are currently no customer bookings matching your filter criteria.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: 'none', overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#659287', '& .MuiTableCell-head': { color: '#ffffff !important', fontWeight: 700, borderColor: 'rgba(255,255,255,0.15)' } }}>
              <TableRow>
                <TableCell>Customer</TableCell>
                <TableCell>Shop</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((apt: any) => (
                <TableRow key={apt._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: 'primary.light', width: 34, height: 34, fontSize: '0.85rem' }}>
                        {apt.customerName?.charAt(0)?.toUpperCase() || 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {apt.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {apt.customerPhone || apt.customerEmail || 'No contact'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <StorefrontIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {apt.businessId?.name || (apt.businessId?.ownerName ? `${apt.businessId?.ownerName}'s Shop` : 'Shop')}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {apt.title || apt.serviceId?.name || 'Appointment'}
                    </Typography>
                    {apt.price !== undefined && (
                      <Typography variant="caption" color="text.secondary">
                        ₹{apt.price}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(apt.startTime).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(apt.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      label={apt.status || 'Pending'}
                      color={
                        apt.status === 'Confirmed'
                          ? 'success'
                          : apt.status === 'Completed'
                          ? 'primary'
                          : apt.status === 'Cancelled'
                          ? 'error'
                          : 'warning'
                      }
                      sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    {canManageAppointments ? (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleOpenStatusDialog(apt)}
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
                      >
                        Update Status
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        Read Only
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Update Booking Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Change status for <strong>{activeAppointment?.customerName}</strong> at{' '}
            <strong>{activeAppointment?.businessId?.name}</strong>:
          </Typography>

          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={newStatus}
              label="Status"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setStatusDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} variant="contained">
            Save Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
