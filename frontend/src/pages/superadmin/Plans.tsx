import { useEffect, useState } from 'react';
import {
  Skeleton, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Chip, Switch, FormControlLabel, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Grid, Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import SearchBar from '../../components/common/SearchBar';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useAppDispatch, useAppSelector } from '../../hook';
import {
  fetchPlans, createPlan, updatePlan, deletePlan, togglePlan
} from '../../features/superadmin/superadminSlice';

const featureLabels: { key: string; label: string }[] = [
  { key: 'googleCalendarSync', label: 'Google Calendar Sync' },
  { key: 'googleMeetIntegration', label: 'Google Meet Integration' },
  { key: 'customBranding', label: 'Custom Branding' },
  { key: 'prioritySupport', label: 'Priority Support' },
  { key: 'analyticsAccess', label: 'Analytics Access' },
];

export default function Plans() {
  const dispatch = useAppDispatch();
  const { plans, plansLoading } = useAppSelector((state) => state.superadmin);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: '',
      slug: '',
      price: 0,
      billingCycle: 'monthly' as string,
      variants: [] as any[],
      displayOrder: 0,
      isActive: true,
      isDefault: false,
      features: {
        maxBookingsPerMonth: 50,
        maxServices: 5,
        maxAdmins: 1,
        googleCalendarSync: false,
        googleMeetIntegration: false,
        customBranding: false,
        prioritySupport: false,
        analyticsAccess: false,
      },
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      slug: Yup.string().required('Required').matches(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
      price: Yup.number().min(0, 'Must be 0 or more').required('Required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (editId) {
        try {
          await dispatch(updatePlan({ id: editId, data: values })).unwrap();
          dispatch(showNotification({ message: 'Plan updated successfully!' }));
          closeModal();
          resetForm();
        } catch (error: any) {
          dispatch(showNotification({ message: error || 'Failed to update plan', failure: true }));
        }
      } else {
        try {
          await dispatch(createPlan(values)).unwrap();
          dispatch(showNotification({ message: 'Plan created successfully!' }));
          closeModal();
          resetForm();
        } catch (error: any) {
          dispatch(showNotification({ message: error || 'Failed to create plan', failure: true }));
        }
      }
    },
    enableReinitialize: true,
  });

  const openCreateModal = () => {
    setEditId(null);
    formik.resetForm();
    setModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setEditId(plan._id);
    formik.setValues({
      name: plan.name,
      slug: plan.slug,
      price: plan.price,
      billingCycle: plan.billingCycle || 'monthly',
      variants: plan.variants || [],
      displayOrder: plan.displayOrder || 0,
      isActive: plan.isActive,
      isDefault: plan.isDefault,
      features: {
        maxBookingsPerMonth: plan.features?.maxBookingsPerMonth || 50,
        maxServices: plan.features?.maxServices || 5,
        maxAdmins: plan.features?.maxAdmins || 1,
        googleCalendarSync: plan.features?.googleCalendarSync || false,
        googleMeetIntegration: plan.features?.googleMeetIntegration || false,
        customBranding: plan.features?.customBranding || false,
        prioritySupport: plan.features?.prioritySupport || false,
        analyticsAccess: plan.features?.analyticsAccess || false,
      },
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  const handleToggle = async (plan: any) => {
    try {
      await dispatch(togglePlan(plan._id)).unwrap();
      dispatch(showNotification({ message: `Plan ${plan.isActive ? 'disabled' : 'enabled'} successfully!` }));
    } catch (error: any) {
      dispatch(showNotification({ message: error || 'Failed to toggle plan', failure: true }));
    }
  };

  const confirmDelete = async () => {
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

  const filtered = plans.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const formatPrice = (price: number) => price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Plans</Typography>
          <Typography variant="body2" color="text.secondary">Manage subscription plans for businesses</Typography>
        </Box>
        <Button variant="contained" onClick={openCreateModal} sx={{ borderRadius: '6px' }}>
          Create Plan
        </Button>
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
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {filtered.map((plan: any) => (
            <Grid size={{ xs: 12, md: 4 }} key={plan._id}>
              <Card sx={{ 
                height: '100%', position: 'relative', 
                opacity: plan.isActive ? 1 : 0.6, 
                border: plan.isDefault ? '2px solid' : '1px solid',
                borderColor: plan.isDefault ? 'primary.main' : 'divider',
              }}>
                {plan.isDefault && (
                  <Chip 
                    icon={<StarIcon sx={{ fontSize: 14 }} />} 
                    label="Default" 
                    color="primary" 
                    size="small" 
                    sx={{ position: 'absolute', top: 12, right: 12 }} 
                  />
                )}
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>{plan.name}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                    {formatPrice(plan.variants && plan.variants.length > 0 ? Math.min(...plan.variants.map(v => v.price)) : (plan.price || 0))}
                    {plan.variants && plan.variants.length > 0 && <Typography component="span" variant="body2" color="text.secondary">/onwards</Typography>}
                  </Typography>
                  <Chip 
                    label={plan.isActive ? 'Active' : 'Inactive'} 
                    color={plan.isActive ? 'success' : 'default'} 
                    size="small" 
                    sx={{ mb: 2 }} 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {plan.businessCount || 0} business(es) on this plan
                  </Typography>

                  <Divider sx={{ my: 1.5 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      {plan.features?.maxBookingsPerMonth >= 9999 ? 'Unlimited' : plan.features?.maxBookingsPerMonth} bookings/mo
                      {' · '}{plan.features?.maxServices >= 9999 ? 'Unlimited' : plan.features?.maxServices} services
                      {' · '}{plan.features?.maxAdmins >= 9999 ? 'Unlimited' : plan.features?.maxAdmins} admin(s)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                      {featureLabels.map((f) => (
                        plan.features?.[f.key] && (
                          <Chip key={f.key} label={f.label} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.7rem' }} />
                        )
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                    <Tooltip title={plan.isActive ? 'Disable plan' : 'Enable plan'}>
                      <IconButton size="small" onClick={() => handleToggle(plan)} color={plan.isActive ? 'success' : 'default'}>
                        {plan.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                      </IconButton>
                    </Tooltip>
                    <IconButton size="small" onClick={() => openEditModal(plan)}><EditIcon /></IconButton>
                    <Tooltip title={plan.businessCount > 0 ? 'Reassign businesses before deleting' : 'Delete plan'}>
                      <span>
                        <IconButton size="small" color="error" disabled={plan.businessCount > 0} onClick={() => { setItemToDelete(plan); setDeleteDialogOpen(true); }}>
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>All Plans</Typography>
        <SearchBar value={search} onChange={(val: string) => setSearch(val)} placeholder="Search plans..." />
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plan Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Businesses</TableCell>
              <TableCell>Max Bookings</TableCell>
              <TableCell>Max Services</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plansLoading ? (
              [...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(8)].map((__, j) => (
                    <TableCell key={j}><Skeleton /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">No plans found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((plan: any) => (
                <TableRow key={plan._id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {plan.name}
                      {plan.isDefault && <StarIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
                    </Box>
                  </TableCell>
                  <TableCell><Chip label={plan.slug} size="small" /></TableCell>
                  <TableCell>{formatPrice(plan.variants && plan.variants.length > 0 ? Math.min(...plan.variants.map(v => v.price)) : (plan.price || 0))}{plan.price > 0 ? `/${plan.billingCycle === 'yearly' ? 'yr' : 'mo'}` : ''}</TableCell>
                  <TableCell>{plan.businessCount || 0}</TableCell>
                  <TableCell>{plan.features?.maxBookingsPerMonth >= 9999 ? 'Unlimited' : plan.features?.maxBookingsPerMonth}</TableCell>
                  <TableCell>{plan.features?.maxServices >= 9999 ? 'Unlimited' : plan.features?.maxServices}</TableCell>
                  <TableCell>
                    <Chip label={plan.isActive ? 'Active' : 'Inactive'} color={plan.isActive ? 'success' : 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEditModal(plan)}><EditIcon /></IconButton>
                    <Tooltip title={plan.businessCount > 0 ? 'Reassign businesses first' : 'Delete'}>
                      <span>
                        <IconButton size="small" color="error" disabled={plan.businessCount > 0} onClick={() => { setItemToDelete(plan); setDeleteDialogOpen(true); }}>
                          <DeleteIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={modalOpen} onClose={closeModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editId ? 'Edit Plan' : 'Create Plan'}
          <IconButton onClick={closeModal}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box component="form" onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth margin="normal" label="Plan Name"
              name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              fullWidth margin="normal" label="Slug"
              name="slug" value={formik.values.slug} onChange={formik.handleChange} onBlur={formik.handleBlur}
              error={formik.touched.slug && Boolean(formik.errors.slug)}
              helperText={formik.touched.slug && formik.errors.slug}
            />
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Plan Variants</Typography>
              <Button size="small" variant="contained" color="success" onClick={() => {
                formik.setFieldValue('variants', [
                  ...formik.values.variants,
                  { name: '', billingCycle: 'monthly', durationDays: 30, price: 0 }
                ]);
              }}>+ Add Variant</Button>
            </Box>
            
            {formik.values.variants.map((v, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1, p: 1, border: '1px solid #e2e8f0', borderRadius: 1 }}>
                <TextField size="small" label="Title (e.g. Monthly [1 Month])" value={v.name} onChange={(e) => formik.setFieldValue(`variants[${i}].name`, e.target.value)} sx={{ flex: 1.5 }} />
                <TextField size="small" select label="Cycle" value={v.billingCycle} onChange={(e) => formik.setFieldValue(`variants[${i}].billingCycle`, e.target.value)} sx={{ flex: 1 }}>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="half-yearly">Half Yearly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                  <MenuItem value="one-time">One Time</MenuItem>
                </TextField>
                <TextField size="small" type="number" label="Days" value={v.durationDays} onChange={(e) => formik.setFieldValue(`variants[${i}].durationDays`, Number(e.target.value))} sx={{ flex: 1 }} />
                <TextField size="small" type="number" label="Price (₹)" value={v.price} onChange={(e) => formik.setFieldValue(`variants[${i}].price`, Number(e.target.value))} sx={{ flex: 1 }} />
                <IconButton color="error" onClick={() => {
                  const newV = [...formik.values.variants];
                  newV.splice(i, 1);
                  formik.setFieldValue('variants', newV);
                }}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            
            {formik.values.variants.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>No variants added. Click "Add Variant" to define billing cycles.</Typography>
            )}

            <TextField
              fullWidth margin="normal" label="Display Order" type="number"
              name="displayOrder" value={formik.values.displayOrder} onChange={formik.handleChange}
            />

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Plan Limits</Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth margin="normal" label="Max Bookings/Mo" type="number"
                  name="features.maxBookingsPerMonth"
                  value={formik.values.features.maxBookingsPerMonth}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth margin="normal" label="Max Services" type="number"
                  name="features.maxServices"
                  value={formik.values.features.maxServices}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth margin="normal" label="Max Admins" type="number"
                  name="features.maxAdmins"
                  value={formik.values.features.maxAdmins}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Feature Toggles</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {featureLabels.map((f) => (
                <FormControlLabel
                  key={f.key}
                  control={
                    <Switch
                      checked={(formik.values.features as any)[f.key]}
                      onChange={(e) => formik.setFieldValue(`features.${f.key}`, e.target.checked)}
                      color="primary"
                    />
                  }
                  label={f.label}
                />
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={<Switch checked={formik.values.isActive} onChange={(e) => formik.setFieldValue('isActive', e.target.checked)} color="success" />}
                label="Active"
              />
              <FormControlLabel
                control={<Switch checked={formik.values.isDefault} onChange={(e) => formik.setFieldValue('isDefault', e.target.checked)} color="primary" />}
                label="Default Plan"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={closeModal}>Cancel</Button>
          <Button variant="contained" onClick={() => formik.handleSubmit()}>
            {editId ? 'Update Plan' : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => { setDeleteDialogOpen(false); setItemToDelete(null); }}>
        <DialogTitle>Delete Plan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the plan <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); setItemToDelete(null); }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
