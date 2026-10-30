import { useEffect, useState, useMemo } from 'react';
import {
  Box, Card, Typography, Table, TableHead, TableBody, TableCell,
  TableRow, TablePagination, Chip, TextField, InputAdornment, Button,
  Skeleton, MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import StoreIcon from '@mui/icons-material/Store';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EventIcon from '@mui/icons-material/Event';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchSuperadminAppointments } from '../../features/superadmin/superadminSlice';
import { formatIST } from '../../utils/format';

export default function SuperadminAppointments() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    appointments,
    appointmentsLoading: loading
  } = useAppSelector((state) => state.superadmin);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchSuperadminAppointments({
      status: statusFilter,
      type: typeFilter,
      search: searchTerm
    }));
  }, [dispatch, statusFilter, typeFilter, searchTerm]);

  const filteredList = useMemo(() => {
    return appointments || [];
  }, [appointments]);

  const paginatedList = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 1.5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/superadmin')}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', px: 0, '&:hover': { bgcolor: 'transparent', color: 'text.primary' } }}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Platform Appointments
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            All appointment booking records across platform shops
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by customer, shop, phone..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            sx={{ minWidth: 260, bgcolor: '#fff' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }
            }}
          />

          <TextField
            select
            label="Status"
            size="small"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 150, bgcolor: '#fff' }}
            slotProps={{ select: { sx: { borderRadius: 2 } } }}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="Confirmed">Confirmed</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Completed">Completed</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </TextField>

          <TextField
            select
            label="Type"
            size="small"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 150, bgcolor: '#fff' }}
            slotProps={{ select: { sx: { borderRadius: 2 } } }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="In-Store">In-Store</MenuItem>
            <MenuItem value="Home Visit">Home Visit</MenuItem>
            <MenuItem value="Walk-in">Walk-in</MenuItem>
            <MenuItem value="Online Consultation">Online Consultation</MenuItem>
          </TextField>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading && !filteredList.length ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Shop / Business</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      <EventIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>No appointments found</Typography>
                      <Typography variant="caption">Try adjusting your search or filter</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedList.map((appt: any) => {
                    const shop = appt.businessId;
                    const serviceName = appt.serviceId?.name || appt.title || 'General Service';
                    const duration = appt.serviceId?.duration ? `${appt.serviceId.duration} mins` : '';
                    const price = appt.serviceId?.price !== undefined ? `₹${appt.serviceId.price}` : '';

                    return (
                      <TableRow key={appt._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {appt.customerName || 'Anonymous Customer'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {appt.customerPhone || '—'}
                          </Typography>
                          {appt.customerEmail && (
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                               {appt.customerEmail}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {shop?.name || 'Unknown Shop'}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {shop?.category || 'General'}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {serviceName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {duration} {duration && price ? '•' : ''} {price}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                          {appt.startTime ? formatIST(appt.startTime) : formatIST(appt.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={appt.type || 'Standard'}
                            size="small"
                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#f1f5f9' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={appt.status}
                            size="small"
                            color={
                              appt.status === 'Confirmed' ? 'success' :
                              appt.status === 'Pending' ? 'warning' :
                              appt.status === 'Completed' ? 'primary' : 'error'
                            }
                            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {shop?._id && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => navigate(`/superadmin/shops/${shop._id}`)}
                              sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.25, fontSize: '0.75rem' }}
                            >
                              Shop Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filteredList.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 15, 25, 50]}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}
