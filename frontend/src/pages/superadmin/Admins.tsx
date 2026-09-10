import { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, InputAdornment, Skeleton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SearchBar from '../../components/common/SearchBar';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchAdmins, fetchBusinesses, createAdmin, updateAdmin, deleteAdmin } from '../../features/superadmin/superadminSlice';
import { showNotification } from '../../features/notifications/notificationSlice';

const Admins = () => {
  const dispatch = useAppDispatch();
  const { admins, adminsLoading, businesses } = useAppSelector((state) => state.superadmin);

  const [searchTerm, setSearchTerm] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [editAdminId, setEditAdminId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAdmins());
    dispatch(fetchBusinesses());
  }, [dispatch]);

  const filteredAdmins = admins.filter(a => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!a.name.toLowerCase().includes(term) && !a.email.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const formattedBusinesses = businesses.filter((b: any) => b.verificationStatus === 'Approved').map((b: any) => ({
    _id: b.id || b._id,
    name: b.name
  }));

  const adminFormik = useFormik({
    initialValues: { name: '', email: '', password: '', businessId: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: editAdminId ? Yup.string() : Yup.string().required('Password is required'),
      businessId: Yup.string().required('Must assign to a business'),
    }),
    onSubmit: (values) => {
      const action = editAdminId ? updateAdmin({ id: editAdminId, data: values }) : createAdmin(values);
      dispatch(action)
        .unwrap()
        .then(() => {
          dispatch(showNotification({ message: editAdminId ? 'Admin updated successfully' : 'Admin created successfully' }));
          setAdminModalOpen(false);
          dispatch(fetchAdmins());
        })
        .catch((error: any) => {
          dispatch(showNotification({ message: error?.message || 'Failed to save admin', failure: true }));
        });
    },
  });

  const handleOpenAdminDialog = (admin?: any) => {
    if (admin) {
      setEditAdminId(admin._id || admin.id);
      adminFormik.setValues({
        name: admin.name,
        email: admin.email,
        password: '',
        businessId: admin.businessId?._id || admin.businessId || ''
      });
    } else {
      setEditAdminId(null);
      adminFormik.resetForm();
    }
    setShowPassword(false);
    setAdminModalOpen(true);
  };

  const requestDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    dispatch(deleteAdmin(itemToDelete))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: 'Admin deleted successfully' }));
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        dispatch(fetchAdmins());
      })
      .catch((error: any) => {
        dispatch(showNotification({ message: error?.message || 'Failed to delete admin', failure: true }));
      });
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' }, 
        gap: 2,
        mb: 3 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Business Admins</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
          <SearchBar 
            placeholder="Search admins..." 
            value={searchTerm} 
            onChange={(val) => setSearchTerm(val)} 
            minWidth={300} 
          />
          <Button variant="contained" onClick={() => handleOpenAdminDialog()} sx={{ whiteSpace: 'nowrap' }}>
            Create Admin
          </Button>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        {adminsLoading ? (
          <Skeleton variant="rectangular" height={300} />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Assigned Business</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">No business admins found.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdmins.map((a: any) => (
                    <TableRow key={a.id || a._id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{a.name}</TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>{a.businessId?.name || '—'}</TableCell>
                      <TableCell align="right">
                        <IconButton color="primary" onClick={() => handleOpenAdminDialog(a)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={() => requestDelete(a.id || a._id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog open={adminModalOpen} onClose={() => setAdminModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
          {editAdminId ? 'Edit Business Admin' : 'Create Business Admin'}
          <IconButton onClick={() => setAdminModalOpen(false)} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={adminFormik.handleSubmit}>
          <DialogContent dividers>
            <TextField
              fullWidth margin="normal" name="name" label="Full Name"
              value={adminFormik.values.name} onChange={adminFormik.handleChange}
              error={adminFormik.touched.name && Boolean(adminFormik.errors.name)}
              helperText={adminFormik.touched.name && adminFormik.errors.name as string}
            />
            <TextField
              fullWidth margin="normal" name="email" label="Email"
              value={adminFormik.values.email} onChange={adminFormik.handleChange}
              error={adminFormik.touched.email && Boolean(adminFormik.errors.email)}
              helperText={adminFormik.touched.email && adminFormik.errors.email as string}
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
                }
              }}
            />
            <TextField
              fullWidth select margin="normal" name="businessId" label="Assign Business"
              value={adminFormik.values.businessId} onChange={adminFormik.handleChange}
              error={adminFormik.touched.businessId && Boolean(adminFormik.errors.businessId)}
              helperText={adminFormik.touched.businessId && adminFormik.errors.businessId as string}
            >
              {formattedBusinesses.map((b: any) => (
                <MenuItem key={b._id} value={b._id}>{b.name}</MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setAdminModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editAdminId ? 'Save Changes' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to remove this business admin? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admins;
