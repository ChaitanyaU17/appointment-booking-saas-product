import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, 
  TableRow, TextField, MenuItem, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchBusinesses, fetchAdmins, createBusiness, updateBusiness, deleteBusiness, fetchPlans, fetchAgents } from '../../features/superadmin/superadminSlice';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import SearchBar from '../../components/common/SearchBar';
import RegisterShopModal from './registration-flow/RegisterShopModal';

const OnboardedShops = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businesses, plans, admins, agents } = useAppSelector((state) => state.superadmin);

  const getAgentName = (agentOrId: any) => {
    if (!agentOrId) return null;
    if (typeof agentOrId === 'object' && agentOrId.name) return agentOrId.name;
    if (!agents?.length) return null;
    const agent = agents.find((a: any) => a._id === agentOrId || a.id === agentOrId);
    return agent ? agent.name : null;
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [registerShopModalOpen, setRegisterShopModalOpen] = useState(false);
  const [editBizId, setEditBizId] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchBusinesses());
    dispatch(fetchAdmins());
    dispatch(fetchPlans());
    dispatch(fetchAgents());
  }, [dispatch]);

  

  const activeBusinesses = businesses.filter(b => {
    if (b.isDemoAccount) return false;
    if (b.verificationStatus !== 'Approved') return false;
    if (categoryFilter && b.category !== categoryFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!b.name.toLowerCase().includes(term) && !b.category?.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  const categories = Array.from(new Set(businesses.filter(b => !b.isDemoAccount && b.verificationStatus === 'Approved').map(b => b.category).filter(Boolean)));

  const bizFormik = useFormik({
    initialValues: { name: '', slug: '', description: '', email: '', phone: '', category: '', registrationNumber: '', planId: '' },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      slug: Yup.string()
        .matches(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens')
        .required('Required'),
      email: Yup.string().email('Invalid email'),
      phone: Yup.string(),
      category: Yup.string(),
      registrationNumber: Yup.string(),
      description: Yup.string(),
      planId: editBizId ? Yup.string() : Yup.string()
    }),
    onSubmit: (values) => {
      const action = editBizId ? updateBusiness({ id: editBizId, data: values }) : createBusiness(values);
      dispatch(action)
        .unwrap()
        .then(() => {
          dispatch(showNotification({ message: editBizId ? 'Business updated' : 'Business created successfully' }));
          setBizModalOpen(false);
          dispatch(fetchBusinesses());
        })
        .catch((error: any) => {
          dispatch(showNotification({ message: error?.message || 'Failed to save business', failure: true }));
        });
    },
  });

  const handleOpenBusinessDialog = (biz?: any) => {
    if (biz) {
      setEditBizId(biz._id || biz.id);
      const admin = admins?.find((a: any) => (a.businessId?._id === biz.id || a.businessId === biz.id || a.businessId?._id === biz._id || a.businessId === biz._id));
      bizFormik.setValues({
        name: biz.name || '',
        slug: biz.slug || '',
        description: biz.description || '',
        email: biz.email || admin?.email || '',
        phone: biz.phone || admin?.phone || '',
        category: biz.category || '',
        registrationNumber: biz.registrationNumber || '',
        planId: biz.planId?._id || biz.planId || ''
      });
    } else {
      setEditBizId(null);
      bizFormik.resetForm();
    }
    setBizModalOpen(true);
  };

  const requestDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    dispatch(deleteBusiness(itemToDelete))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: 'Business deleted successfully' }));
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
        dispatch(fetchBusinesses());
      })
      .catch((error: any) => {
        dispatch(showNotification({ message: error?.message || 'Failed to delete business', failure: true }));
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
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Onboarded Shops</Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
          <SearchBar
            placeholder="Search by name or category..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            minWidth={250}
          />
          <TextField
            select
            label="Category Filter"
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 180 }, bgcolor: 'white', borderRadius: 1 }}
          >
            <MenuItem value=""><em>All Categories</em></MenuItem>
            {categories.map((cat: any) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            onClick={() => setRegisterShopModalOpen(true)}
            sx={{
              bgcolor: '#659287',
              '&:hover': { bgcolor: '#4a6b62' },
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
              whiteSpace: 'nowrap'
            }}
          >
            + Register Shop Owner
          </Button>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Business Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeBusinesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary">No onboarded shops found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                activeBusinesses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: any) => {
                  const admin = admins?.find((a: any) => (a.businessId?._id === row.id || a.businessId === row.id || a.businessId?._id === row._id || a.businessId === row._id));
                  return (
                  <TableRow key={row._id || row.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                      {(() => {
                        const agentName = getAgentName(row.registeredByAgentId || row.assignedAgentId);
                        if (!agentName) return null;
                        return (
                          <Chip 
                            size="small" 
                            icon={<BadgeIcon style={{ fontSize: 12 }} />} 
                            label={`Agent: ${agentName}`} 
                            sx={{ mt: 0.5, bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 700, fontSize: '0.65rem', height: 20 }} 
                          />
                        );
                      })()}
                    </TableCell>
                    <TableCell>{row.phone || admin?.phone || 'N/A'}</TableCell>
                    <TableCell>{row.email || admin?.email || 'N/A'}</TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      {(() => {
                        let label = "Completed";
                        let bg = "#dcfce7";
                        let text = "#166534";
                        
                        let daysLeft: number | null = null;
                        const activePlan = plans.find((p: any) => p._id === row.planId || p._id === row.paymentBreakdown?.planId || p._id === row.requestedPlanId);
                        
                        if (row.subscriptionEnd) {
                          daysLeft = Math.ceil((new Date(row.subscriptionEnd).getTime() - Date.now()) / (1000 * 3600 * 24));
                        } else if (row.planEndDate) {
                          daysLeft = Math.ceil((new Date(row.planEndDate).getTime() - Date.now()) / (1000 * 3600 * 24));
                        } else if (row.paymentBreakdown?.endDate) {
                          daysLeft = Math.ceil((new Date(row.paymentBreakdown.endDate).getTime() - Date.now()) / (1000 * 3600 * 24));
                        } else if (row.trialStatus === 'Active' && row.trialEndsAt) {
                          daysLeft = Math.ceil((new Date(row.trialEndsAt).getTime() - Date.now()) / (1000 * 3600 * 24));
                        } else if (activePlan) {
                          const variant = activePlan.variants?.find((v: any) => v._id === row.planVariantId || v._id === row.paymentBreakdown?.planVariantId)
                            || (activePlan.variants && activePlan.variants.length > 0 ? activePlan.variants[0] : null);
                          if (variant && variant.billingCycle !== 'one-time' && !(activePlan as any).isPermanent) {
                            const durationDays = variant.durationDays || (activePlan as any).durationDays || 30;
                            const start = row.subscriptionStart 
                              ? new Date(row.subscriptionStart) 
                              : (row.planStartDate 
                                ? new Date(row.planStartDate) 
                                : (row.paymentCompletedAt 
                                  ? new Date(row.paymentCompletedAt) 
                                  : (row.paymentLinkGeneratedAt 
                                    ? new Date(row.paymentLinkGeneratedAt) 
                                    : (row.createdAt ? new Date(row.createdAt) : new Date()))));
                            const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
                            daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
                          }
                        }

                        if (daysLeft !== null) {
                          if (daysLeft <= 0) {
                            label = "Expired";
                            bg = "#fee2e2";
                            text = "#991b1b";
                          } else if (daysLeft <= 7) {
                            label = "Near Expiry";
                            bg = "#fef3c7";
                            text = "#b45309";
                          }
                        }
                        return <Chip label={label} size="small" sx={{ fontWeight: 700, fontSize: 11, bgcolor: bg, color: text, borderRadius: 1 }} />;
                      })()}
                    </TableCell>
                    
                    <TableCell align="center">
                      <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={() => navigate(`/superadmin/shops/${row._id || row.id}`)} sx={{ textTransform: "none", mr: 1, borderRadius: 1.5, fontWeight: 600 }}>
                        View
                      </Button>
                      <Button variant="outlined" size="small" color="secondary" startIcon={<PlayArrowIcon />} onClick={() => navigate(`/superadmin/registration?biz=${row._id || row.id}`)} sx={{ textTransform: "none", borderRadius: 1.5, fontWeight: 600 }}>
                        Onboarding
                      </Button>
                      <IconButton onClick={() => handleOpenBusinessDialog(row)} sx={{ ml: 1, color: '#659287' }} size="small" title="Edit Shop">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={() => requestDelete(row._id || row.id)} sx={{ ml: 0.5, color: '#ef4444' }} size="small" title="Delete Shop">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={activeBusinesses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_e: any, newPage: number) => setPage(newPage)}
          onRowsPerPageChange={(e: any) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <Dialog open={bizModalOpen} onClose={() => setBizModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
          {editBizId ? 'Edit Shop' : 'Create New Shop'}
          <IconButton onClick={() => setBizModalOpen(false)} aria-label="close" size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={bizFormik.handleSubmit}>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth margin="normal" name="name" label="Business Name"
                value={bizFormik.values.name} onChange={bizFormik.handleChange}
                error={bizFormik.touched.name && Boolean(bizFormik.errors.name)}
                helperText={bizFormik.touched.name && bizFormik.errors.name as string}
              />
              <TextField
                fullWidth margin="normal" name="slug" label="URL Slug (e.g. abc-clinic)"
                value={bizFormik.values.slug} onChange={bizFormik.handleChange}
                error={bizFormik.touched.slug && Boolean(bizFormik.errors.slug)}
                helperText={bizFormik.touched.slug && bizFormik.errors.slug as string}
              />
              <TextField
                fullWidth margin="normal" name="email" label="Contact Email" type="email"
                value={bizFormik.values.email} onChange={bizFormik.handleChange}
                error={bizFormik.touched.email && Boolean(bizFormik.errors.email)}
                helperText={bizFormik.touched.email && bizFormik.errors.email as string}
              />
              <TextField
                fullWidth margin="normal" name="phone" label="Contact Phone"
                value={bizFormik.values.phone} onChange={bizFormik.handleChange}
                error={bizFormik.touched.phone && Boolean(bizFormik.errors.phone)}
                helperText={bizFormik.touched.phone && bizFormik.errors.phone as string}
              />
              <TextField
                fullWidth margin="normal" name="category" label="Category"
                value={bizFormik.values.category} onChange={bizFormik.handleChange}
                error={bizFormik.touched.category && Boolean(bizFormik.errors.category)}
                helperText={bizFormik.touched.category && bizFormik.errors.category as string}
              />
              <TextField
                fullWidth margin="normal" name="registrationNumber" label="Registration Number"
                value={bizFormik.values.registrationNumber} onChange={bizFormik.handleChange}
                error={bizFormik.touched.registrationNumber && Boolean(bizFormik.errors.registrationNumber)}
                helperText={bizFormik.touched.registrationNumber && bizFormik.errors.registrationNumber as string}
              />
            </Box>
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
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setBizModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">{editBizId ? 'Save Changes' : 'Create'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete this business? This action will permanently delete all associated admins and appointments.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <RegisterShopModal
        open={registerShopModalOpen}
        onClose={() => setRegisterShopModalOpen(false)}
        plans={plans}
      />
    </Box>
  );
};

export default OnboardedShops;
