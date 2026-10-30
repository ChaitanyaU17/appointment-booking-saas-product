import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Skeleton,
  Grid, CardContent, Divider, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SearchBar from '../../components/common/SearchBar';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchCoupons, deleteCoupon } from '../../features/superadmin/couponSlice';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useNavigate } from 'react-router-dom';

const Coupons: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { coupons, loading } = useAppSelector((state) => state.coupons);
  const { user } = useAppSelector((state) => state.auth);
  const isSuperadmin = user?.role === 'Superadmin';

  const [searchTerm, setSearchTerm] = useState('');
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Coupons
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b', mt: 0.5 }}>
            Manage discount codes and validity extensions.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <SearchBar 
            placeholder="Search coupons..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newView) => { if (newView) setViewMode(newView); }}
            size="small"
            sx={{ bgcolor: '#fff' }}
          >
            <ToggleButton value="card" aria-label="card view">
              <ViewModuleIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <ViewListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
          {isSuperadmin && (
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
                px: 3,
                py: 1
              }}
            >
              Create Coupon
            </Button>
          )}
        </Box>
      </Box>

      {viewMode === 'table' && (
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
                  {isSuperadmin && <TableCell align="right">ACTIONS</TableCell>}
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
                      {isSuperadmin && (
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
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {viewMode === 'card' && (
        <Grid container spacing={3}>
          {loading ? (
            [1, 2, 3].map((i) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                <Skeleton variant="rounded" height={180} />
              </Grid>
            ))
          ) : filteredCoupons.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                <Typography sx={{ color: '#64748b', fontWeight: 600 }}>
                  {searchTerm ? 'No coupons match your search.' : 'No coupons created yet.'}
                </Typography>
              </Box>
            </Grid>
          ) : (
            filteredCoupons.map((coupon: any) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={coupon._id} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                  {isSuperadmin && (
                    <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1, zIndex: 2 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/superadmin/coupons/edit/${coupon._id}`)} sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => { setSelectedCoupon(coupon); setOpenDelete(true); }} sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  )}
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, pr: 6 }}>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
                        {coupon.code}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(coupon.code)}>
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 20 }}>
                      {coupon.description || 'No description provided'}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Chip 
                        label={coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`} 
                        color="primary" 
                        size="small" 
                        sx={{ fontWeight: 700 }}
                      />
                      {coupon.validityBonusDays > 0 && (
                        <Chip label={`+${coupon.validityBonusDays} Days Bonus`} size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
                      )}
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Usage: {coupon.currentUsageCount} {coupon.maxUsageLimit ? `/ ${coupon.maxUsageLimit}` : ''}
                      </Typography>
                      <Chip 
                        label={coupon.isActive ? 'Active' : 'Inactive'} 
                        color={coupon.isActive ? 'success' : 'default'} 
                        size="small"
                        sx={{ fontWeight: 600, height: 24, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

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
