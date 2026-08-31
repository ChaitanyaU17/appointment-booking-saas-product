import { useEffect, useState } from 'react';
import { Skeleton, Box, Typography, Button, Tabs, Tab, Paper, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, MenuItem, IconButton, Chip, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SearchBar from '../../components/common/SearchBar';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showNotification } from '../../features/notifications/notificationSlice';
import { formatIST } from '../../utils/format';
import { useAppDispatch, useAppSelector } from '../../hook';
import { 
  fetchBusinesses, fetchAdmins, fetchPlans, createBusiness, updateBusiness, deleteBusiness, 
  createAdmin, updateAdmin, deleteAdmin 
} from '../../features/superadmin/superadminSlice';

interface Business { _id: string; name: string; slug: string; description?: string; createdAt: string; id: string; }
interface Admin { _id: string; name: string; email: string; businessId?: { _id: string; name: string }; id: string; }

export default function Businesses() {
  const dispatch = useAppDispatch();
  const { businesses, businessesLoading, admins, adminsLoading, plans, plansLoading } = useAppSelector((state) => state.superadmin);

  const [tab, setTab] = useState(0);
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editBizId, setEditBizId] = useState<string | null>(null);
  const [editAdminId, setEditAdminId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchAll = () => {
    dispatch(fetchBusinesses());
    dispatch(fetchAdmins());
    dispatch(fetchPlans());
  };

  useEffect(() => { fetchAll(); }, [dispatch]);

  const bizFormik = useFormik({
    initialValues: { name: '', slug: '', description: '', settings: { defaultPrice: 0 }, planId: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      slug: Yup.string().required('Required').matches(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const payload: any = { ...values };
      if (!payload.planId) delete payload.planId;

      if (editBizId) {
        try {
          await dispatch(updateBusiness({ id: editBizId, data: payload })).unwrap();
          dispatch(showNotification({ message: 'Business updated' }));
          setBizModalOpen(false);
          setEditBizId(null);
          resetForm();
          dispatch(fetchBusinesses());
        } catch (error: any) {
          const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to save business';
          dispatch(showNotification({ message: errorMsg, failure: true }));
        }
      } else {
        try {
          await dispatch(createBusiness(payload)).unwrap();
          dispatch(showNotification({ message: 'Business created' }));
          setBizModalOpen(false);
          setEditBizId(null);
          resetForm();
          dispatch(fetchBusinesses());
        } catch (error: any) {
          const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to save business';
          dispatch(showNotification({ message: errorMsg, failure: true }));
        }
      }
    },
  });

  const handleEditBusiness = (biz: Business) => {
    setEditBizId(biz.id);
    bizFormik.setValues({
      name: biz.name,
      slug: biz.slug,
      description: biz.description || '',
      settings: { defaultPrice: (biz as any).settings?.defaultPrice || 0 },
      planId: (biz as any).planId?._id || ''
    });
    setBizModalOpen(true);
  };

  const adminFormik = useFormik({
    initialValues: { name: '', email: '', password: '', businessId: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      password: Yup.string().min(6, 'Min 6 characters').test('is-required', 'Required', function(value) {
        if (!editAdminId && !value) return false;
        return true;
      }),
      businessId: Yup.string().required('Select a business'),
    }),
    onSubmit: async (values) => {
      if (editAdminId) {
        const { password, ...rest } = values;
        const payload = password ? { ...rest, password } : rest;
        try {
          await dispatch(updateAdmin({ id: editAdminId, data: payload })).unwrap();
          dispatch(showNotification({ message: 'Business admin updated' }));
          setAdminModalOpen(false);
          adminFormik.resetForm();
          setShowPassword(false);
          dispatch(fetchAdmins());
        } catch (error: any) {
          const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to save admin';
          dispatch(showNotification({ message: errorMsg, failure: true }));
        }
      } else {
        try {
          await dispatch(createAdmin(values)).unwrap();
          dispatch(showNotification({ message: 'Business admin created' }));
          setAdminModalOpen(false);
          adminFormik.resetForm();
          setShowPassword(false);
          dispatch(fetchAdmins());
        } catch (error: any) {
          const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to save admin';
          dispatch(showNotification({ message: errorMsg, failure: true }));
        }
      }
    },
  });

  const handleEditAdmin = (admin: Admin) => {
    setEditAdminId(admin.id);
    adminFormik.setValues({
      name: admin.name,
      email: admin.email,
      password: '',
      businessId: admin.businessId?._id || ''
    });
    setAdminModalOpen(true);
  };

  const formattedBusinesses = businesses?.map((b: any) => ({ ...b, id: b._id })) || [];
  const formattedAdmins = admins?.map((a: any) => ({ ...a, id: a._id })) || [];

  const [searchQuery, setSearchQuery] = useState('');

  const filteredBusinesses = formattedBusinesses.filter(b => 
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    b.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredAdmins = formattedAdmins.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'business' | 'admin' } | null>(null);

  const loading = businessesLoading || adminsLoading;

  const requestDelete = (id: string, type: 'business' | 'admin') => {
    setItemToDelete({ id, type });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeleteConfirmOpen(false);
    const { id, type } = itemToDelete;
    
    try {
      if (type === 'business') {
        await dispatch(deleteBusiness(id)).unwrap();
        dispatch(showNotification({ message: 'Business deleted' }));
        dispatch(fetchBusinesses());
        dispatch(fetchAdmins());
      } else {
        await dispatch(deleteAdmin(id)).unwrap();
        dispatch(showNotification({ message: 'Admin removed' }));
        dispatch(fetchAdmins());
      }
    } catch (error: any) {
      const errorMsg = typeof error === 'string' ? error : error?.message || (type === 'business' ? 'Failed to delete business' : 'Failed to delete admin');
      dispatch(showNotification({ message: errorMsg, failure: true }));
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{fontWeight: 700}} color="primary">
          Management
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            if (tab === 0) {
              setEditBizId(null);
              bizFormik.resetForm();
              setBizModalOpen(true);
            } else {
              setEditAdminId(null);
              adminFormik.resetForm();
              setAdminModalOpen(true);
            }
          }}
        >
          {tab === 0 ? 'New Business' : 'New Admin'}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); setSearchQuery(''); }} sx={{ borderBottom: 'none' }}>
          <Tab label="Businesses" />
          <Tab label="Business Admins" />
        </Tabs>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={tab === 0 ? "search businesses..." : "search admins..."}
        />
      </Box>

      {loading ? (
        <Skeleton variant="rounded" height={400} />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                {tab === 0 ? (
                  <>
                    <TableCell>Name</TableCell>
                    <TableCell>Slug (URL)</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Assigned Business</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tab === 0 ? (
                filteredBusinesses.length > 0 ? filteredBusinesses.map((b: any) => (
                  <TableRow key={b.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{b.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={`/b/${b.slug}`} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={b.planId?.name || 'No Plan'} size="small" variant="filled" sx={{ bgcolor: 'background.default' }} />
                    </TableCell>
                    <TableCell>{formatIST(b.createdAt, 'dd MMM yyyy')}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEditBusiness(b)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => requestDelete(b.id, 'business')}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} align="center">No businesses found</TableCell></TableRow>
                )
              ) : (
                filteredAdmins.length > 0 ? filteredAdmins.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{a.businessId?.name || '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEditAdmin(a as any)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => requestDelete(a.id, 'admin')}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} align="center">No admins found</TableCell></TableRow>
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={bizModalOpen} onClose={() => setBizModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editBizId ? 'Edit Business' : 'Create New Business'}
          <IconButton onClick={() => setBizModalOpen(false)} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={bizFormik.handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth margin="normal" name="name" label="Business Name"
              value={bizFormik.values.name} onChange={bizFormik.handleChange}
              error={bizFormik.touched.name && Boolean(bizFormik.errors.name)}
              helperText={bizFormik.touched.name && bizFormik.errors.name}
            />
            <TextField
              fullWidth margin="normal" name="slug" label="URL Slug (e.g. abc-clinic)"
              value={bizFormik.values.slug} onChange={bizFormik.handleChange}
              error={bizFormik.touched.slug && Boolean(bizFormik.errors.slug)}
              helperText={bizFormik.touched.slug && bizFormik.errors.slug}
            />
            <TextField
              fullWidth margin="normal" name="description" label="Description" multiline rows={2}
              value={bizFormik.values.description} onChange={bizFormik.handleChange}
            />
            {editBizId && (
              <TextField
                fullWidth select margin="normal" name="planId" label="Subscription Plan"
                value={bizFormik.values.planId} onChange={bizFormik.handleChange}
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {plans.map((p: any) => (
                  <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                ))}
              </TextField>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setBizModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editBizId ? 'Save Changes' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={adminModalOpen} onClose={() => setAdminModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {editAdminId ? 'Edit Business Admin' : 'Create Business Admin'}
          <IconButton onClick={() => setAdminModalOpen(false)} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={adminFormik.handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth margin="normal" name="name" label="Full Name"
              value={adminFormik.values.name} onChange={adminFormik.handleChange}
              error={adminFormik.touched.name && Boolean(adminFormik.errors.name)}
              helperText={adminFormik.touched.name && adminFormik.errors.name}
            />
            <TextField
              fullWidth margin="normal" name="email" label="Email"
              value={adminFormik.values.email} onChange={adminFormik.handleChange}
              error={adminFormik.touched.email && Boolean(adminFormik.errors.email)}
              helperText={adminFormik.touched.email && adminFormik.errors.email}
            />
            <TextField
              fullWidth margin="normal" name="password" label={editAdminId ? "New Password (leave blank to keep current)" : "Temporary Password"} type={showPassword ? 'text' : 'password'}
              value={adminFormik.values.password} onChange={adminFormik.handleChange}
              error={adminFormik.touched.password && Boolean(adminFormik.errors.password)}
              helperText={adminFormik.touched.password && adminFormik.errors.password as string}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth select margin="normal" name="businessId" label="Assign Business"
              value={adminFormik.values.businessId} onChange={adminFormik.handleChange}
              error={adminFormik.touched.businessId && Boolean(adminFormik.errors.businessId)}
              helperText={adminFormik.touched.businessId && adminFormik.errors.businessId}
            >
              {formattedBusinesses.map((b: any) => (
                <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setAdminModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editAdminId ? 'Save Changes' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Confirm Delete
          <IconButton onClick={() => setDeleteConfirmOpen(false)} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            {itemToDelete?.type === 'business' 
              ? 'Are you sure you want to delete this business? This action will also permanently delete all associated admins and appointments.'
              : 'Are you sure you want to remove this business admin?'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}