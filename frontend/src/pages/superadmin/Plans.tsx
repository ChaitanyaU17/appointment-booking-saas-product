import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Skeleton, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Card, CardContent, Divider, Tooltip, Grid, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';

import SearchBar from '../../components/common/SearchBar';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchPlans, deletePlan } from '../../features/superadmin/superadminSlice';

export default function Plans() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plans, plansLoading } = useAppSelector((state) => state.superadmin);
  const { user } = useAppSelector((state) => state.auth);
  const isSuperadmin = user?.role === 'Superadmin';

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [search, setSearch] = useState('');
  
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const filtered = plans.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await dispatch(deletePlan(itemToDelete._id)).unwrap();
      dispatch(showNotification({ message: 'Plan deleted successfully!' }));
    } catch (error: any) {
      dispatch(showNotification({ message: error || 'Failed to delete plan', failure: true }));
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const formatPrice = (price: number) => price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`;

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Plans</Typography>
          <Typography variant="body2" color="text.secondary">Manage subscription plans for businesses</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search plans..." />
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
            <Button variant="contained" color="primary" disableElevation onClick={() => navigate('/superadmin/plan-create')} sx={{ px: 3, py: 1, fontWeight: 800, borderRadius: 2 }}>
              Create New Plan
            </Button>
          )}
        </Box>
      </Box>

      {plansLoading ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <Skeleton variant="rounded" height={220} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {!plansLoading && filtered.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
              <Typography sx={{ color: '#64748b', fontWeight: 600 }}>No plans found.</Typography>
            </Box>
          )}

          {viewMode === 'card' && filtered.length > 0 && (
            <Grid container spacing={3} sx={{ mb: 4, alignItems: 'stretch' }}>
              {filtered.map((plan: any) => {
                const hasVariants = plan.variants && plan.variants.length > 0;
                const minPrice = hasVariants ? Math.min(...plan.variants.map((v: any) => v.price)) : (plan.price || 0);

                return (
                  <Grid size={{ xs: 12, md: 6, lg: 4 }} key={plan._id} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Card onClick={isSuperadmin ? () => navigate(`/superadmin/plan-edit/${plan._id}`) : undefined} sx={{ cursor: isSuperadmin ? 'pointer' : 'default', 
                      flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', 
                    }}>
                      <Box sx={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 1, alignItems: 'center', zIndex: 2 }}>
                        {plan.planType === 'PRIMARY' && (
                          <Chip icon={<StarIcon sx={{ fontSize: 14 }} />} label="Primary" color="primary" size="small" />
                        )}
                        {isSuperadmin && (
                          <Tooltip title={plan.businessCount > 0 ? 'Reassign businesses before deleting' : 'Delete plan'}>
                            <span>
                              <IconButton size="small" color="error" disabled={plan.businessCount > 0} onClick={(e) => { e.stopPropagation(); setItemToDelete(plan); setDeleteDialogOpen(true); }} sx={{ bgcolor: 'rgba(255,255,255,0.8)', '&:hover': { bgcolor: '#fee2e2' } }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Box>
                      <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, pr: 4 }}>{plan.name}</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                          {formatPrice(minPrice)}
                          {hasVariants && <Typography component="span" variant="body2" color="text.secondary">/onwards</Typography>}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip label={plan.isPublic ? 'Public' : 'Hidden'} color={plan.isPublic ? 'success' : 'default'} size="small" />
                          <Chip label={`GST ${plan.gstSettings?.rate || 18}%`} size="small" variant="outlined" color="warning" />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {plan.businessCount || 0} business on this plan
                        </Typography>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {plan.planLimits?.maxBookingsPerMonth >= 9999 ? 'Unlimited' : plan.planLimits?.maxBookingsPerMonth} bookings/mo
                            {' • '}{plan.planLimits?.maxServices >= 9999 ? 'Unlimited' : plan.planLimits?.maxServices} services
                            {' • '}{plan.planLimits?.maxAdmins >= 9999 ? 'Unlimited' : plan.planLimits?.maxAdmins} admin
                          </Typography>
                          
                          {plan.controls && plan.controls.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                              {plan.controls.slice(0, 4).map((ctrl: string, idx: number) => (
                                <Chip key={idx} label={ctrl} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.7rem' }} />
                              ))}
                              {plan.controls.length > 4 && (
                                <Chip label={`+${plan.controls.length - 4} more`} size="small" variant="outlined" color="default" sx={{ fontSize: '0.7rem' }} />
                              )}
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {viewMode === 'table' && filtered.length > 0 && (
            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>PLAN NAME</TableCell>
                      <TableCell>PRICE / VARIANTS</TableCell>
                      <TableCell>TYPE / VISIBILITY</TableCell>
                      <TableCell>LIMITS</TableCell>
                      <TableCell>BUSINESSES</TableCell>
                      {isSuperadmin && <TableCell align="right">ACTIONS</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((plan: any) => {
                      const hasVariants = plan.variants && plan.variants.length > 0;
                      const minPrice = hasVariants ? Math.min(...plan.variants.map((v: any) => v.price)) : (plan.price || 0);

                      return (
                        <TableRow key={plan._id} hover>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700, color: '#1e293b' }}>{plan.name}</Typography>
                            {plan.planType === 'PRIMARY' && <Chip icon={<StarIcon sx={{ fontSize: 12 }} />} label="Primary" color="primary" size="small" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }} />}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 800, color: '#0f172a' }}>
                              {formatPrice(minPrice)} {hasVariants && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>/ onwards</span>}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {hasVariants ? `${plan.variants.length} Variant(s)` : 'Fixed Price'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Chip label={plan.isPublic ? 'Public' : 'Hidden'} color={plan.isPublic ? 'success' : 'default'} size="small" />
                              <Chip label={`GST ${plan.gstSettings?.rate || 18}%`} size="small" variant="outlined" color="warning" />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>Bookings: {plan.planLimits?.maxBookingsPerMonth >= 9999 ? 'Unlimited' : plan.planLimits?.maxBookingsPerMonth}</Typography>
                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>Services: {plan.planLimits?.maxServices >= 9999 ? 'Unlimited' : plan.planLimits?.maxServices}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontWeight: 600 }}>{plan.businessCount || 0}</Typography>
                          </TableCell>
                          {isSuperadmin && (
                            <TableCell align="right">
                              <Tooltip title="Edit">
                                <IconButton size="small" color="primary" onClick={() => navigate(`/superadmin/plan-edit/${plan._id}`)}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={plan.businessCount > 0 ? 'Reassign businesses before deleting' : 'Delete'}>
                                <span>
                                  <IconButton size="small" color="error" disabled={plan.businessCount > 0} onClick={() => { setItemToDelete(plan); setDeleteDialogOpen(true); }}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          )}
        </>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Plan?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete {itemToDelete?.name}? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
