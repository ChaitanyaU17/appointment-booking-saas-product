import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchBar from '../../components/common/SearchBar';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchCoupons, deleteCoupon } from '../../features/superadmin/couponSlice';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useNavigate } from 'react-router-dom';

const Coupons: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { coupons, loading } = useAppSelector((state) => state.coupons);

  const [searchTerm, setSearchTerm] = useState('');
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  const filteredCoupons = coupons.filter((c: any) => 
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    if (!selectedCoupon) return;
    try {
      await dispatch(deleteCoupon(selectedCoupon._id)).unwrap();
      dispatch(showNotification({ message: 'Coupon deleted successfully', failure: false }));
      setOpenDelete(false);
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to delete coupon', failure: true }));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    dispatch(showNotification({ message: 'Coupon code copied!', failure: false }));
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Coupons
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mt: 0.5 }}>
            Manage discount codes and validity extensions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/superadmin/coupons/create')}
          sx={{
            bgcolor: '#659287',
            '&:hover': { bgcolor: '#4a6b62' },
            boxShadow: '0 4px 12px rgba(101, 146, 135, 0.2)',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            px: 3
          }}
        >
          Create Coupon
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchBar 
          placeholder="Search coupons by code..."
          value={searchTerm}
          onChange={(val) => setSearchTerm(val)}
        />
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>CODE</TableCell>
                <TableCell>DESCRIPTION</TableCell>
                <TableCell>DISCOUNT</TableCell>
                <TableCell>VALIDITY BONUS</TableCell>
                <TableCell>USAGE</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(3)).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={50} /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={60} height={32} sx={{ ml: 'auto' }} /></TableCell>
                  </TableRow>
                ))
              ) : filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748b' }}>
                    {searchTerm ? 'No coupons match your search.' : 'No coupons created yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon: any) => (
                  <TableRow key={coupon._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>
                          {coupon.code}
                        </Typography>
                        <IconButton size="small" onClick={() => copyToClipboard(coupon.code)}>
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {coupon.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} OFF
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {coupon.validityBonusDays > 0 ? (
                        <Chip label={`+${coupon.validityBonusDays} Days`} size="small" color="warning" variant="outlined" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {coupon.currentUsageCount} {coupon.maxUsageLimit ? `/ ${coupon.maxUsageLimit}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={coupon.isActive ? 'Active' : 'Inactive'} 
                        color={coupon.isActive ? 'success' : 'default'} 
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/superadmin/coupons/edit/${coupon._id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => { setSelectedCoupon(coupon); setOpenDelete(true); }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Coupon?</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the coupon <strong>{selectedCoupon?.code}</strong>? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Coupons;
