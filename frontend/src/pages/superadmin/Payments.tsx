import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, 
  TableRow, Chip, Button 
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchPayments, fetchAdmins, fetchPlans, fetchBusinesses } from '../../features/superadmin/superadminSlice';
import SearchBar from '../../components/common/SearchBar';
import LinkIcon from '@mui/icons-material/Link';

const Payments = () => {
  const dispatch = useAppDispatch();
  const { payments = [], paymentsLoading, admins = [], plans = [], businesses = [] } = useAppSelector((state) => state.superadmin);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchAdmins());
    dispatch(fetchPlans());
    dispatch(fetchBusinesses());
  }, [dispatch]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p: any) => {
      const bizName = p.businessId?.name?.toLowerCase() || '';
      const biz = businesses.find((b: any) => b._id === p.businessId?._id || b._id === p.businessId);
      const admin = admins.find((a: any) => a.businessId?._id === p.businessId?._id || a.businessId === p.businessId?._id);
      const ownerName = p.ownerId?.name?.toLowerCase() || biz?.ownerName?.toLowerCase() || admin?.name?.toLowerCase() || '';
      const ownerPhone = p.ownerId?.phone || '';
      const planName = p.planId?.name?.toLowerCase() || p.paymentBreakdown?.planName?.toLowerCase() || '';
      
      const searchMatch = bizName.includes(searchTerm.toLowerCase()) || 
                          ownerName.includes(searchTerm.toLowerCase()) || 
                          ownerPhone.includes(searchTerm) || 
                          planName.includes(searchTerm.toLowerCase());
                          
      const statusMatch = statusFilter ? p.status === statusFilter : true;
      return searchMatch && statusMatch;
    });
  }, [payments, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    if (status === 'Success') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Failed') return 'error';
    return 'default';
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Payment Records</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
          <SearchBar 
            value={searchTerm}
            onChange={(value) => { setSearchTerm(value); setPage(0); }}
            placeholder="Search by shop, owner..."
            minWidth={250}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['', 'Success', 'Pending', 'Failed'].map((status) => (
              <Chip 
                key={status}
                label={status || 'All'}
                onClick={() => { setStatusFilter(status); setPage(0); }}
                color={statusFilter === status ? 'primary' : 'default'}
                variant={statusFilter === status ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      <Card sx={{ boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date & Time</TableCell>
                <TableCell>Shop Name</TableCell>
                <TableCell>Phone NO</TableCell>
                <TableCell>Plan Details</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Invoice Link</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentsLoading ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>Loading payments...</TableCell></TableRow>
              ) : filteredPayments.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3 }}>No payment records found.</TableCell></TableRow>
              ) : (
                filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((p: any) => {
                  const bizId = p.businessId?._id ? String(p.businessId._id) : String(p.businessId);
                  
                  const biz = businesses.find((b: any) => String(b._id) === bizId);
                  const admin = admins.find((a: any) => String(a.businessId?._id || a.businessId) === bizId || String(a.originalBusinessId?._id || a.originalBusinessId) === bizId);
                
                  const ownerPhone = p.customerSnapshot?.phone || p.businessId?.phone || p.ownerId?.phone || admin?.phone || biz?.phone || '-';
                  
                  const pId = p.planId?._id ? String(p.planId._id) : String(p.planId);
                  const plan = plans.find((pl: any) => String(pl._id) === pId);
                  
                  const vId = String(p.planVariantId);
                  const variant = plan?.variants?.find((v: any) => String(v._id) === vId);
                  const variantName = variant?.name || p.paymentBreakdown?.planVariantName || p.planVariantId;
                  
                  return (
                  <TableRow key={p._id} hover>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{new Date(p.createdAt).toLocaleDateString()}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{new Date(p.createdAt).toLocaleTimeString()}</Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{p.customerSnapshot?.name || p.businessId?.name || 'Unknown Shop'}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{ownerPhone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{p.planId?.name || p.paymentBreakdown?.planName || '-'}</Typography>
                      {p.planVariantId && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Variant: {variantName}</Typography>}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#16a34a' }}>₹{p.amount?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip label={p.status} size="small" color={getStatusColor(p.status) as any} sx={{ fontWeight: 700, height: 24 }} />
                    </TableCell>
                    <TableCell>
                      <Button size="small" startIcon={<LinkIcon />} sx={{ textTransform: 'none', minWidth: 0, px: 1 }} href={`/pay/${p._id}`} target="_blank">
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredPayments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Card>
    </Box>
  );
};

export default Payments;
