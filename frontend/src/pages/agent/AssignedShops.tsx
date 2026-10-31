import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Card, CardContent, Divider,
  Grid, Chip, Tooltip, IconButton, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Skeleton, Stack, alpha,
  Menu, ListItemIcon, ListItemText,
} from '@mui/material';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddBusinessRoundedIcon from '@mui/icons-material/AddBusinessRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SearchBar from '../../components/common/SearchBar';
import { useAppDispatch, useAppSelector } from '../../hook';
import { showNotification } from '../../features/notifications/notificationSlice';
import { fetchAssignedShops, fetchAgentProfile, updateShopProfile, deleteShopByAgent } from '../../features/agent/agentSlice';
import { RegisterShopModal } from '../superadmin/registration-flow/RegisterShopModal';
import { ACCENT, ACCENT_DARK, ACCENT_SOFT, ACCENT_BORDER, SURFACE, PAGE_BG, BORDER, MUTED, INK, SUCCESS, SUCCESS_SOFT, SUCCESS_BORDER, WARNING, WARNING_SOFT, WARNING_BORDER, INFO, INFO_SOFT, INFO_BORDER, ERROR, ERROR_SOFT, ERROR_BORDER, fieldSx } from '../../theme/colors';

const FieldLabel = memo(({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, mb: 0.75 }}>{children}</Typography>
));
FieldLabel.displayName = 'FieldLabel';

const MetricBox = memo(({ label, value, tone, soft, border }: { label: string; value: React.ReactNode; tone: string; soft: string; border: string }) => (
  <Box sx={{ flex: 1, p: 1.25, borderRadius: 1.5, bgcolor: soft, border: `1px solid ${border}`, textAlign: 'center' }}>
    <Typography sx={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, color: tone, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: tone, mt: 0.4 }}>{label}</Typography>
  </Box>
));
MetricBox.displayName = 'MetricBox';

const StatusChip = memo(({ status }: { status?: string }) => {
  const isApproved = status === 'Approved';
  const isChanges = status === 'ChangesRequested';
  const isRejected = status === 'Rejected';
  const tone = isApproved
    ? { c: SUCCESS, s: SUCCESS_SOFT, b: SUCCESS_BORDER }
    : isChanges
    ? { c: WARNING, s: WARNING_SOFT, b: WARNING_BORDER }
    : isRejected
    ? { c: ERROR, s: ERROR_SOFT, b: ERROR_BORDER }
    : { c: MUTED, s: '#f1f5f9', b: BORDER };
  return (
    <Chip
      size="small"
      label={status || 'Pending'}
      sx={{
        height: 22,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 0.3,
        bgcolor: tone.s,
        color: tone.c,
        border: `1px solid ${tone.b}`,
        '& .MuiChip-label': { px: 1.2 }
      }}
    />
  );
});
StatusChip.displayName = 'StatusChip';

interface ShopItemProps {
  shop: any;
  onNavigate: (id: string) => void;
  onOpenActionMenu: (e: React.MouseEvent<HTMLElement>, shop: any) => void;
}

const AssignedShopCard = memo(({ shop, onNavigate, onOpenActionMenu }: ShopItemProps) => {
  const shopId = shop._id || shop.id;
  return (
    <Card
      elevation={0}
      onClick={() => onNavigate(shopId)}
      sx={{
        borderRadius: 2.5,
        bgcolor: SURFACE,
        border: `1px solid ${BORDER}`,
        boxShadow: '0 1px 2px rgba(15,23,42,0.03)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all .2s ease',
        '&:hover': {
          borderColor: ACCENT_BORDER,
          boxShadow: `0 12px 32px -18px ${alpha(ACCENT, 0.35)}`,
          transform: 'translateY(-1px)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {shop.name || (shop.ownerName ? `${shop.ownerName}'s Shop` : 'Unnamed Shop')}
              </Typography>
              <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.15 }}>{shop.category || 'General'} · /{shop.slug}</Typography>
            </Box>
          </Box>
          <StatusChip status={shop.verificationStatus} />
        </Box>
        <Stack spacing={0.9} sx={{ p: 1.5, mb: 2, borderRadius: 1.75, bgcolor: '#fbfcfe', border: `1px solid ${BORDER}` }}>
          {shop.email && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailRoundedIcon sx={{ fontSize: 14, color: MUTED }} />
              <Typography sx={{ fontSize: 12, color: INK, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {shop.email}
              </Typography>
            </Box>
          )}
          {shop.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneRoundedIcon sx={{ fontSize: 14, color: MUTED }} />
              <Typography sx={{ fontSize: 12, color: INK, fontWeight: 500 }}>
                {shop.phone}
              </Typography>
            </Box>
          )}
        </Stack>
        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <MetricBox label="Services" value={shop.servicesCount || 0} tone={ACCENT_DARK} soft={ACCENT_SOFT} border={ACCENT_BORDER} />
          <MetricBox label="Appointments" value={shop.appointmentsCount || 0} tone={SUCCESS} soft={SUCCESS_SOFT} border={SUCCESS_BORDER} />
        </Box>
      </CardContent>
      <Divider sx={{ borderColor: BORDER }} />
      <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end', bgcolor: '#fbfcfe' }} onClick={(e) => e.stopPropagation()}>
        <Button
          size="small"
          variant="contained"
          disableElevation
          startIcon={<VisibilityRoundedIcon sx={{ fontSize: 14 }} />}
          onClick={() => onNavigate(shopId)}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 12,
            borderRadius: 1.5,
            px: 2,
            py: 0.6,
            bgcolor: ACCENT,
            boxShadow: 'none',
            '&:hover': { bgcolor: ACCENT_DARK }
          }}
        >
          View Details
        </Button>
        <Button
          size="small"
          variant="outlined"
          endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={(e) => onOpenActionMenu(e, shop)}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 12,
            borderRadius: 1.5,
            px: 1.5,
            color: INK,
            borderColor: BORDER,
            bgcolor: SURFACE,
            '&:hover': {
              borderColor: ACCENT_BORDER,
              bgcolor: ACCENT_SOFT,
              color: ACCENT_DARK
            }
          }}
        >
          Actions
        </Button>
      </Box>
    </Card>
  );
});
AssignedShopCard.displayName = 'AssignedShopCard';

const AssignedShopTableRow = memo(({ shop, onNavigate, onOpenActionMenu }: ShopItemProps) => {
  const shopId = shop._id || shop.id;
  return (
    <TableRow 
      hover 
      onClick={() => onNavigate(shopId)}
      sx={{ 
        cursor: 'pointer', 
        '& td': { borderColor: '#f1f4f9', py: 1.75 },
        transition: 'background-color 0.15s ease',
        '&:hover': { bgcolor: alpha(ACCENT_SOFT, 0.5) }
      }}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: INK }}>
              {shop.name || (shop.ownerName ? `${shop.ownerName}'s Shop` : 'Unnamed Shop')}
            </Typography>
            <Typography sx={{ fontSize: 11, color: MUTED, fontFamily: '"SF Mono", monospace' }}>/{shop.slug}</Typography>
          </Box>
        </Box>
      </TableCell>
      <TableCell><Chip size="small" label={shop.category || 'General'} sx={{ height: 22, fontSize: 10.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', '& .MuiChip-label': { px: 1.2 } }} /></TableCell>
      <TableCell>
        <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: INK }}>{shop.email || 'N/A'}</Typography>
        {shop.phone && <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>{shop.phone}</Typography>}
      </TableCell>
      <TableCell align="center"><Chip size="small" label={shop.servicesCount || 0} sx={{ height: 22, minWidth: 32, fontSize: 11, fontWeight: 700, bgcolor: ACCENT_SOFT, color: ACCENT_DARK, border: `1px solid ${ACCENT_BORDER}` }} /></TableCell>
      <TableCell align="center"><Chip size="small" label={shop.appointmentsCount || 0} sx={{ height: 22, minWidth: 32, fontSize: 11, fontWeight: 700, bgcolor: SUCCESS_SOFT, color: SUCCESS, border: `1px solid ${SUCCESS_BORDER}` }} /></TableCell>
      <TableCell><StatusChip status={shop.verificationStatus} /></TableCell>
      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            size="small"
            variant="contained"
            disableElevation
            startIcon={<VisibilityRoundedIcon sx={{ fontSize: 14 }} />}
            onClick={() => onNavigate(shopId)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 1.5,
              px: 1.5,
              py: 0.5,
              bgcolor: ACCENT,
              boxShadow: 'none',
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: ACCENT_DARK }
            }}
          >
            View Details
          </Button>
          <Button
            size="small"
            variant="outlined"
            endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={(e) => onOpenActionMenu(e, shop)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: 12,
              borderRadius: 1.5,
              px: 1.25,
              py: 0.5,
              color: INK,
              borderColor: BORDER,
              bgcolor: SURFACE,
              whiteSpace: 'nowrap',
              '&:hover': {
                borderColor: ACCENT_BORDER,
                bgcolor: ACCENT_SOFT,
                color: ACCENT_DARK
              }
            }}
          >
            Actions
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
});
AssignedShopTableRow.displayName = 'AssignedShopTableRow';

export default function AssignedShops() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { assignedShops, shopsLoading, profile } = useAppSelector((state) => state.agent);
  const { user } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Approved');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', category: '', description: '' });
  const [billingModalOpen, setBillingModalOpen] = useState(false);
  const [selectedShopForBilling, setSelectedShopForBilling] = useState<any>(null);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [actionMenuShop, setActionMenuShop] = useState<any>(null);

  const handleNavigateShop = useCallback((id: string) => {
    navigate(`/agent/shops/${id}`);
  }, [navigate]);

  const handleOpenActionMenu = useCallback((event: React.MouseEvent<HTMLElement>, shop: any) => {
    event.stopPropagation();
    setActionMenuAnchorEl(event.currentTarget);
    setActionMenuShop(shop);
  }, []);

  const handleCloseActionMenu = useCallback(() => {
    setActionMenuAnchorEl(null);
    setActionMenuShop(null);
  }, []);

  const handleRequestDelete = useCallback((shop: any) => {
    setShopToDelete(shop);
    setDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = async () => {
    if (!shopToDelete) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteShopByAgent(shopToDelete._id)).unwrap();
      dispatch(showNotification({ message: `Shop "${shopToDelete.name || shopToDelete.ownerName || 'Shop'}" deleted successfully` }));
      setDeleteConfirmOpen(false);
      setShopToDelete(null);
      dispatch(fetchAssignedShops());
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to delete shop', failure: true }));
    } finally {
      setDeleteLoading(false);
    }
  };

  const isSuperadmin = user?.role === 'Superadmin';
  const permissions = user?.permissions || profile?.permissions;
  const canRegisterShops = isSuperadmin || permissions?.canRegisterShops !== false;
  const canEditProfile = isSuperadmin || permissions?.canManageShopProfile !== false;
  const canManageAppointments = isSuperadmin || permissions?.canManageAppointments !== false;
  const canManageOnboarding = isSuperadmin || Boolean(permissions?.canManageOnboarding);
  const canManageBilling = isSuperadmin || Boolean(permissions?.canManageBilling);

  useEffect(() => {
    dispatch(fetchAssignedShops());
    if (!user?.permissions) dispatch(fetchAgentProfile());
  }, [dispatch, user?.permissions]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return assignedShops.filter((shop: any) => {
      const matchesSearch =
        shop.name?.toLowerCase().includes(term) ||
        shop.ownerName?.toLowerCase().includes(term) ||
        shop.category?.toLowerCase().includes(term) ||
        shop.phone?.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'Approved' && shop.verificationStatus === 'Approved') || (statusFilter === 'Pending' && shop.verificationStatus !== 'Approved');
      return matchesSearch && matchesStatus;
    });
  }, [assignedShops, search, statusFilter]);

  const handleOpenEdit = useCallback((shop: any) => {
    setSelectedShop(shop);
    setEditForm({ name: shop.name || '', phone: shop.phone || '', email: shop.email || '', category: shop.category || '', description: shop.description || '' });
    setEditModalOpen(true);
  }, []);

  const handleSaveProfile = async () => {
    if (!selectedShop) return;
    try {
      await dispatch(updateShopProfile({ id: selectedShop._id, data: editForm })).unwrap();
      dispatch(showNotification({ message: 'Shop profile updated successfully!' }));
      setEditModalOpen(false);
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to update shop profile', failure: true }));
    }
  };

  const handleOpenOnboarding = useCallback((shop: any) => {
    if (user?.role === 'Superadmin') {
      navigate(`/superadmin/registration?biz=${shop._id}`);
    } else {
      navigate(`/agent/registration?biz=${shop._id}`);
    }
  }, [user?.role, navigate]);

  const handleOpenBilling = useCallback((shop: any) => {
    setSelectedShopForBilling(shop);
    setBillingModalOpen(true);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, pb: 8 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha(SURFACE, 0.85), backdropFilter: 'blur(12px)', borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 1.75, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }}>
            <StorefrontRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.2, color: INK, lineHeight: 1.2 }}>
              {isSuperadmin ? 'Assigned Shops' : 'My Registered Shops'}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>
              Manage profiles, appointments, and operations for your registered shops
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search shops..." />
            <FormControl size="small" sx={{ minWidth: 130, '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13, bgcolor: SURFACE } }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="all" sx={{ fontSize: 13 }}>All Statuses</MenuItem>
                <MenuItem value="Approved" sx={{ fontSize: 13 }}>Approved</MenuItem>
                <MenuItem value="Pending" sx={{ fontSize: 13 }}>Pending</MenuItem>
              </Select>
            </FormControl>
            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => { if (v) setViewMode(v); }} size="small" sx={{ bgcolor: SURFACE, '& .MuiToggleButton-root': { border: `1px solid ${BORDER}`, borderRadius: 1.5, px: 1, py: 0.6, color: MUTED, '&.Mui-selected': { bgcolor: ACCENT_SOFT, color: ACCENT_DARK, borderColor: ACCENT_BORDER } } }}>
              <ToggleButton value="card"><Tooltip title="Card View"><ViewModuleRoundedIcon sx={{ fontSize: 17 }} /></Tooltip></ToggleButton>
              <ToggleButton value="table"><Tooltip title="Table View"><ViewListRoundedIcon sx={{ fontSize: 17 }} /></Tooltip></ToggleButton>
            </ToggleButtonGroup>
            {canRegisterShops && (
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddBusinessRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setRegisterModalOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, borderRadius: 1.5, px: 2, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK }}}
              >
                Register Shop
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, pt: 3 }}>
        {shopsLoading ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((n) => <Grid key={n} size={{ xs: 12, sm: 6, lg: 4 }}><Skeleton variant="rounded" height={240} sx={{ borderRadius: 2.5 }} /></Grid>)}
          </Grid>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: SURFACE, borderRadius: 2.5, border: `1px dashed ${BORDER}` }}>
            <StorefrontRoundedIcon sx={{ fontSize: 52, color: '#cbd5e1', mb: 1.5 }} />
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>{search ? 'No shops match your criteria' : 'No registered shops yet'}</Typography>
            <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.5, mb: canRegisterShops ? 2 : 0 }}>
              {canRegisterShops ? 'Register your first shop to start managing onboarding, appointments, and operations.' : 'Shops you register will appear here.'}
            </Typography>
            {canRegisterShops && (
              <Button
                variant="contained"
                disableElevation
                startIcon={<AddBusinessRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setRegisterModalOpen(true)}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK }}}
              >
                Register First Shop
              </Button>
            )}
          </Box>
        ) : viewMode === 'card' ? (
          <Grid container spacing={2.5}>
            {filtered.map((shop: any) => (
              <Grid key={shop._id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <AssignedShopCard
                  shop={shop}
                  onNavigate={handleNavigateShop}
                  onOpenActionMenu={handleOpenActionMenu}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{'& .MuiTableCell-head': {fontWeight: 700, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', borderBottom: `1px solid ${BORDER}`, py: 1.5 } }}>
                <TableRow>
                  <TableCell>Shop</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell align="center">Services</TableCell>
                  <TableCell align="center">Appointments</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((shop: any) => (
                  <AssignedShopTableRow
                    key={shop._id}
                    shop={shop}
                    onNavigate={handleNavigateShop}
                    onOpenActionMenu={handleOpenActionMenu}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 2.5, border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px -24px rgba(15,23,42,0.25)' } } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, borderBottom: `1px solid ${BORDER}` }}>
          <Box>
            <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: INK, letterSpacing: -0.2 }}>Edit Shop Profile</Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>{selectedShop?.name}</Typography>
          </Box>
          <IconButton onClick={() => setEditModalOpen(false)} size="small" sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, width: 32, height: 32, color: MUTED, '&:hover': { bgcolor: ERROR_SOFT, borderColor: ERROR_BORDER, color: ERROR } }}><CloseRoundedIcon sx={{ fontSize: 16 }} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}><FieldLabel>Shop Name</FieldLabel><TextField fullWidth size="small" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} sx={fieldSx} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><FieldLabel>Phone</FieldLabel><TextField fullWidth size="small" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} sx={fieldSx} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><FieldLabel>Email</FieldLabel><TextField fullWidth size="small" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} sx={fieldSx} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><FieldLabel>Category</FieldLabel><TextField fullWidth size="small" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} sx={fieldSx} /></Grid>
            <Grid size={{ xs: 12 }}><FieldLabel>Description</FieldLabel><TextField fullWidth size="small" multiline rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} sx={fieldSx} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${BORDER}`, gap: 1 }}>
          <Button onClick={() => setEditModalOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, color: MUTED, borderRadius: 1.5, px: 2 }}>Cancel</Button>
          <Button onClick={handleSaveProfile} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>Save Profile</Button>
        </DialogActions>
      </Dialog>


      <Dialog open={billingModalOpen} onClose={() => setBillingModalOpen(false)} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 2.5, border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px -24px rgba(15,23,42,0.25)', overflow: 'hidden' } } }}>
        {selectedShopForBilling && (() => {
          const shop = selectedShopForBilling;
          const breakdown = shop.paymentBreakdown;
          const basePrice = breakdown?.basePrice || shop.planId?.price || 0;
          const platformDiscount = breakdown?.platformDiscountAmount || 0;
          const couponDiscount = breakdown?.couponDiscountAmount || 0;
          const totalDiscount = breakdown?.discountAmount || (platformDiscount + couponDiscount);
          const taxableAmount = Math.max(0, basePrice - totalDiscount);
          const gstAmount = breakdown?.gstAmount !== undefined ? breakdown.gstAmount : Math.round(taxableAmount * 0.18);
          const totalAmount = breakdown?.totalAmount !== undefined ? breakdown.totalAmount : (taxableAmount + gstAmount);
          const couponCodes = breakdown?.couponCodes || [];
          const paymentRef = shop.paymentReferenceId || (shop.paymentToken ? shop.paymentToken.toUpperCase().slice(0, 10) : shop._id.slice(-8).toUpperCase());
          const receiptToken = shop.paymentReferenceId || shop.paymentToken || shop._id;
          const receiptUrl = `${window.location.origin}/pay/${receiptToken}`;
          const isPaid = shop.paymentStatus === 'Paid';
          const isTrial = shop.subscriptionStatus === 'trial' || shop.trialStatus === 'Active';
          const planName = breakdown?.planName || shop.planId?.name || 'Standard Plan';
          const startDate = breakdown?.startDate || shop.planStartDate;
          const endDate = breakdown?.endDate || shop.planEndDate;
          const statusMeta = isPaid ? { label: 'PAID IN FULL', tone: SUCCESS, soft: SUCCESS_SOFT, border: SUCCESS_BORDER } : isTrial ? { label: 'TRIAL ACTIVE', tone: WARNING, soft: WARNING_SOFT, border: WARNING_BORDER } : { label: 'PAYMENT PENDING', tone: INFO, soft: INFO_SOFT, border: INFO_BORDER };

          const handleCopyReceipt = () => {
            navigator.clipboard.writeText(receiptUrl);
            dispatch(showNotification({ message: 'Customer receipt link copied!' }));
          };

          return (
            <>
              <Box sx={{ position: 'relative', background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`, color: '#fff', px: 3, py: 2.5, overflow: 'hidden' }}>
                <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 120% at 0% 0%, ${alpha('#ffffff', 0.12)} 0%, transparent 50%)`, pointerEvents: 'none' }} />
                <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: alpha('#ffffff', 0.16), border: `1px solid ${alpha('#ffffff', 0.24)}`, backdropFilter: 'blur(10px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }}><ReceiptLongRoundedIcon sx={{ fontSize: 20, color: '#fff' }} /></Box>
                    <Box>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: alpha('#ffffff', 0.75), lineHeight: 1 }}>Invoice</Typography>
                      <Typography sx={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3, color: '#fff', mt: 0.25, lineHeight: 1.2 }}>Subscription & Billing</Typography>
                    </Box>
                  </Box>
                  <Chip label={statusMeta.label} sx={{ height: 26, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, bgcolor: alpha('#ffffff', 0.15), color: '#fff', border: `1px solid ${alpha('#ffffff', 0.25)}`, '& .MuiChip-label': { px: 1.5 } }} />
                </Box>
              </Box>

              <Box sx={{ px: 3, py: 2, bgcolor: '#fbfcfe', borderBottom: `1px solid ${BORDER}`, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                <Box><Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED }}>Invoice Ref</Typography><Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK, mt: 0.25, fontFamily: '"SF Mono", monospace' }}>#{paymentRef}</Typography></Box>
                <Box><Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED }}>Billed To</Typography><Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK, mt: 0.25 }}>{shop.name}</Typography></Box>
                <Box><Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED }}>Plan</Typography><Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK, mt: 0.25 }}>{planName}</Typography></Box>
              </Box>

              <DialogContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: SURFACE, border: `1px solid ${BORDER}` }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 1.25 }}>Billed To</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{shop.name}</Typography>
                    <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.5 }}>Slug: /{shop.slug}</Typography>
                    {shop.email && <Typography sx={{ fontSize: 12, color: MUTED }}>Email: {shop.email}</Typography>}
                    {shop.phone && <Typography sx={{ fontSize: 12, color: MUTED }}>Phone: {shop.phone}</Typography>}
                    {shop.ownerName && <Typography sx={{ fontSize: 12, color: MUTED }}>Owner: {shop.ownerName}</Typography>}
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: SURFACE, border: `1px solid ${BORDER}` }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 1.25 }}>Billing Info</Typography>
                    <Stack spacing={0.75}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}><Typography sx={{ fontSize: 12, color: MUTED }}>Method</Typography><Typography sx={{ fontSize: 12, fontWeight: 600, color: INK }}>{shop.paymentMethod || 'Online · Card / UPI'}</Typography></Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}><Typography sx={{ fontSize: 12, color: MUTED }}>Tier</Typography><Typography sx={{ fontSize: 12, fontWeight: 700, color: ACCENT_DARK }}>{planName}</Typography></Box>
                      {startDate && <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}><Typography sx={{ fontSize: 12, color: MUTED }}>Start</Typography><Typography sx={{ fontSize: 12, color: INK }}>{new Date(startDate).toLocaleDateString()}</Typography></Box>}
                      {endDate && <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}><Typography sx={{ fontSize: 12, color: MUTED }}>End</Typography><Typography sx={{ fontSize: 12, fontWeight: 600, color: INK }}>{new Date(endDate).toLocaleDateString()}</Typography></Box>}
                    </Stack>
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 1.25 }}>Itemized Breakdown</Typography>
                  <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, overflow: 'hidden' }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: 1, px: 2, py: 1.25, bgcolor: '#f8fafc', borderBottom: `1px solid ${BORDER}` }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED }}>Item</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, textAlign: 'right' }}>Base</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, textAlign: 'right' }}>Discount</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, textAlign: 'right' }}>GST</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, textAlign: 'right' }}>Total</Typography>
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr repeat(4, 1fr)', gap: 1, px: 2, py: 1.75, alignItems: 'center' }}>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: INK }}>{planName}</Typography>
                        <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.15 }}>{startDate && endDate ? `${new Date(startDate).toLocaleDateString()} — ${new Date(endDate).toLocaleDateString()}` : 'Recurring subscription'}</Typography>
                        {couponCodes.length > 0 && <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, flexWrap: 'wrap' }}>{couponCodes.map((code: string) => <Chip key={code} label={code} size="small" sx={{ height: 18, fontSize: 9.5, fontWeight: 700, bgcolor: SUCCESS_SOFT, color: SUCCESS, border: `1px solid ${SUCCESS_BORDER}`, '& .MuiChip-label': { px: 0.75 } }} />)}</Box>}
                      </Box>
                      <Typography sx={{ fontSize: 12.5, color: INK, fontWeight: 600, textAlign: 'right' }}>₹{basePrice.toFixed(2)}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: totalDiscount > 0 ? SUCCESS : MUTED, fontWeight: 600, textAlign: 'right' }}>{totalDiscount > 0 ? `−₹${totalDiscount.toFixed(2)}` : '—'}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: INK, fontWeight: 600, textAlign: 'right' }}>₹{gstAmount.toFixed(2)}</Typography>
                      <Typography sx={{ fontSize: 13, color: ACCENT_DARK, fontWeight: 800, textAlign: 'right' }}>₹{totalAmount.toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ p: 2, borderRadius: 2, bgcolor: statusMeta.soft, border: `1px solid ${statusMeta.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: statusMeta.tone, lineHeight: 1 }}>{isPaid ? 'Total Paid' : 'Amount Due'}</Typography>
                    <Typography sx={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: statusMeta.tone, lineHeight: 1.1, mt: 0.35 }}>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button size="small" variant="outlined" startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 15 }} />} onClick={handleCopyReceipt} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 1.5, px: 1.75, bgcolor: SURFACE, color: INK, borderColor: BORDER, '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f1f5f9' } }}>Copy Link</Button>
                    <Button size="small" variant="contained" disableElevation startIcon={<OpenInNewRoundedIcon sx={{ fontSize: 15 }} />} onClick={() => window.open(receiptUrl, '_blank')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 1.5, px: 1.75, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>Open Receipt</Button>
                  </Box>
                </Box>
              </DialogContent>

              <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${BORDER}`, justifyContent: 'space-between' }}>
                <Button startIcon={<PrintRoundedIcon sx={{ fontSize: 16 }} />} onClick={() => window.open(receiptUrl, '_blank')} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, color: MUTED, borderRadius: 1.5, px: 1.75 }}>Print / PDF</Button>
                <Button onClick={() => setBillingModalOpen(false)} variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, borderRadius: 1.5, px: 2.5, color: INK, borderColor: BORDER, '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f1f5f9' } }}>Close</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>

      <RegisterShopModal
        open={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={() => dispatch(fetchAssignedShops())}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !deleteLoading && setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2.5, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: INK, pb: 1 }}>Delete Shop</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: MUTED, lineHeight: 1.6 }}>
            Are you sure you want to delete <strong>{shopToDelete?.name || (shopToDelete?.ownerName ? `${shopToDelete?.ownerName}'s Shop` : 'this shop')}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: ERROR, mt: 1, fontSize: 12.5, fontWeight: 600 }}>
            This will permanently remove the shop, all its services, appointments, and owner login account.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
          <Button onClick={() => setDeleteConfirmOpen(false)} disabled={deleteLoading} sx={{ textTransform: 'none', fontWeight: 600, color: MUTED }}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: 'none' }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Shop'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Redesigned Actions Dropdown Menu */}
      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl)}
        onClose={handleCloseActionMenu}
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              borderRadius: 2.5,
              minWidth: 230,
              maxWidth: 300,
              p: 0.75,
              border: `1px solid ${BORDER}`,
              boxShadow: '0 12px 36px -8px rgba(15,23,42,0.18)',
              overflow: 'visible',
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 1.5, py: 1, borderBottom: `1px solid ${BORDER}`, mb: 0.5 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK, lineHeight: 1.2 }}>
            {actionMenuShop?.name || (actionMenuShop?.ownerName ? `${actionMenuShop?.ownerName}'s Shop` : 'Shop Actions')}
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: MUTED, mt: 0.25, fontFamily: '"SF Mono", monospace' }}>
            /{actionMenuShop?.slug || ''}
          </Typography>
        </Box>

        <MenuItem
          onClick={() => {
            const id = actionMenuShop?._id || actionMenuShop?.id;
            handleCloseActionMenu();
            navigate(`/agent/shops/${id}`);
          }}
          sx={{ borderRadius: 1.5, py: 0.9, px: 1.25, '&:hover': { bgcolor: ACCENT_SOFT } }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: ACCENT }}>
            <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Shop Details</Typography>}
            secondary={<Typography sx={{ fontSize: 10.5, color: MUTED }}>Overview, services & stats</Typography>}
          />
        </MenuItem>

        {canManageAppointments && (
          <MenuItem
            onClick={() => {
              const id = actionMenuShop?._id;
              handleCloseActionMenu();
              navigate(`/agent/appointments?shopId=${id}`);
            }}
            sx={{ borderRadius: 1.5, py: 0.9, px: 1.25, '&:hover': { bgcolor: '#f0f9ff' } }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: '#0284c7' }}>
              <EventRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Appointments</Typography>}
              secondary={<Typography sx={{ fontSize: 10.5, color: MUTED }}>Customer bookings & slots</Typography>}
            />
          </MenuItem>
        )}

        {canManageOnboarding && (
          <MenuItem
            onClick={() => {
              const shop = actionMenuShop;
              handleCloseActionMenu();
              handleOpenOnboarding(shop);
            }}
            sx={{ borderRadius: 1.5, py: 0.9, px: 1.25, '&:hover': { bgcolor: INFO_SOFT } }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: INFO }}>
              <HowToRegRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Onboarding</Typography>}
              secondary={<Typography sx={{ fontSize: 10.5, color: MUTED }}>Setup checklist & pipeline</Typography>}
            />
          </MenuItem>
        )}

        {canManageBilling && (
          <MenuItem
            onClick={() => {
              const shop = actionMenuShop;
              handleCloseActionMenu();
              handleOpenBilling(shop);
            }}
            sx={{ borderRadius: 1.5, py: 0.9, px: 1.25, '&:hover': { bgcolor: ACCENT_SOFT } }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: ACCENT_DARK }}>
              <ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Billing & Validity</Typography>}
              secondary={<Typography sx={{ fontSize: 10.5, color: MUTED }}>Subscription plan & quota</Typography>}
            />
          </MenuItem>
        )}

        {canEditProfile && (
          <MenuItem
            onClick={() => {
              const shop = actionMenuShop;
              handleCloseActionMenu();
              handleOpenEdit(shop);
            }}
            sx={{ borderRadius: 1.5, py: 0.9, px: 1.25, '&:hover': { bgcolor: '#f8fafc' } }}
          >
            <ListItemIcon sx={{ minWidth: 32, color: '#475569' }}>
              <EditRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary={<Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK }}>Edit Profile</Typography>}
              secondary={<Typography sx={{ fontSize: 10.5, color: MUTED }}>Update contact & business info</Typography>}
            />
          </MenuItem>
        )}

        <Divider sx={{ my: 0.75, borderColor: BORDER }} />

        <MenuItem
          onClick={() => {
            const shop = actionMenuShop;
            handleCloseActionMenu();
            handleRequestDelete(shop);
          }}
          sx={{
            borderRadius: 1.5,
            py: 0.9,
            px: 1.25,
            color: ERROR,
            '&:hover': { bgcolor: ERROR_SOFT }
          }}
        >
          <ListItemIcon sx={{ minWidth: 32, color: ERROR }}>
            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontSize: 12.5, fontWeight: 700, color: ERROR }}>Delete Shop</Typography>}
            secondary={<Typography sx={{ fontSize: 10.5, color: '#ef4444' }}>Permanently remove shop</Typography>}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
}