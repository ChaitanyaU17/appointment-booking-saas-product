import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Switch, Card, CardContent, Grid, Chip,
  CircularProgress, IconButton, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Avatar, Tooltip, Dialog,
  DialogTitle, DialogContent, DialogActions, alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import VideoCameraFrontRoundedIcon from '@mui/icons-material/VideoCameraFrontRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SearchBar from '../../components/common/SearchBar';
import { useAppDispatch, useAppSelector } from '../../hook';
import { showNotification } from '../../features/notifications/notificationSlice';
import { fetchAgentById, updateAgent, deleteBusiness } from '../../features/superadmin/superadminSlice';
import {
  ACCENT,
  ACCENT_DARK,
  ACCENT_SOFT,
  ACCENT_BORDER,
  SURFACE,
  PAGE_BG,
  BORDER,
  MUTED,
  INK,
  SUCCESS,
  SUCCESS_SOFT,
  SUCCESS_BORDER,
  WARNING,
  WARNING_SOFT,
  WARNING_BORDER,
  ERROR,
  ERROR_SOFT,
  ERROR_BORDER,
  INFO,
  INFO_SOFT,
  INFO_BORDER,
  VIOLET,
  VIOLET_SOFT,
  VIOLET_BORDER,
} from '../../theme/colors';

interface ControlMeta {
  key: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: string;
  soft: string;
  border: string;
  isSidenav: boolean;
}

const CONTROLS_CONFIG: ControlMeta[] = [
  {
    key: 'canAccessRegistration',
    title: 'Registration & Onboarding',
    description: 'Access pending registrations, demo sessions, and 5-step onboarding pipeline.',
    icon: <HowToRegRoundedIcon sx={{ fontSize: 18 }} />,
    tone: INFO,
    soft: INFO_SOFT,
    border: INFO_BORDER,
    isSidenav: true,
  },
  {
    key: 'canAccessOnboardedShops',
    title: 'Onboarded Shops',
    description: 'View, filter, and inspect registered active shops.',
    icon: <StorefrontRoundedIcon sx={{ fontSize: 18 }} />,
    tone: ACCENT_DARK,
    soft: ACCENT_SOFT,
    border: ACCENT_BORDER,
    isSidenav: true,
  },
  {
    key: 'canAccessExpiredShops',
    title: 'Expired Shops',
    description: 'Track expired subscriptions and facilitate plan renewal.',
    icon: <EventBusyRoundedIcon sx={{ fontSize: 18 }} />,
    tone: WARNING,
    soft: WARNING_SOFT,
    border: WARNING_BORDER,
    isSidenav: true,
  },
  {
    key: 'canAccessBusinessAdmins',
    title: 'Business Admins',
    description: 'View and manage shop owner credentials and administrative accounts.',
    icon: <PeopleRoundedIcon sx={{ fontSize: 18 }} />,
    tone: VIOLET,
    soft: VIOLET_SOFT,
    border: VIOLET_BORDER,
    isSidenav: true,
  },
  {
    key: 'canAccessPlans',
    title: 'Plans & Pricing',
    description: 'View subscription plans, feature packages, and billing structures.',
    icon: <CardMembershipRoundedIcon sx={{ fontSize: 18 }} />,
    tone: SUCCESS,
    soft: SUCCESS_SOFT,
    border: SUCCESS_BORDER,
    isSidenav: true,
  },
  {
    key: 'canAccessCoupons',
    title: 'Coupons & Discounts',
    description: 'View promotional coupons, bonus validity, and discount limits.',
    icon: <LocalOfferRoundedIcon sx={{ fontSize: 18 }} />,
    tone: '#d97706',
    soft: '#fffbeb',
    border: '#fde68a',
    isSidenav: true,
  },
  {
    key: 'canAccessDemoRequests',
    title: 'Demo Requests',
    description: 'Follow up on incoming demo leads and contact sales requests.',
    icon: <VideoCameraFrontRoundedIcon sx={{ fontSize: 18 }} />,
    tone: INFO,
    soft: INFO_SOFT,
    border: INFO_BORDER,
    isSidenav: true,
  },
  {
    key: 'canAccessPayments',
    title: 'Payments & Invoices',
    description: 'Inspect transaction receipts, billing breakdowns, and tax invoices.',
    icon: <PaymentRoundedIcon sx={{ fontSize: 18 }} />,
    tone: VIOLET,
    soft: VIOLET_SOFT,
    border: VIOLET_BORDER,
    isSidenav: true,
  },
  {
    key: 'canManageAppointments',
    title: 'Appointments Calendar',
    description: 'Inspect booking calendar and manage customer appointments.',
    icon: <EventNoteRoundedIcon sx={{ fontSize: 18 }} />,
    tone: SUCCESS,
    soft: SUCCESS_SOFT,
    border: SUCCESS_BORDER,
    isSidenav: true,
  },
];

export default function AgentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { currentAgent, currentAgentLoading } = useAppSelector((state) => state.superadmin);

  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [shopSearch, setShopSearch] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleRequestDeleteShop = (shop: any) => {
    setShopToDelete(shop);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteShop = async () => {
    if (!shopToDelete || !id) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteBusiness(shopToDelete._id)).unwrap();
      dispatch(showNotification({ message: `Shop "${shopToDelete.name || shopToDelete.ownerName || 'Shop'}" deleted successfully` }));
      setDeleteConfirmOpen(false);
      setShopToDelete(null);
      dispatch(fetchAgentById(id));
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to delete shop', failure: true }));
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchAgentById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentAgent) {
      setIsActive(currentAgent.isActive !== false);
      const perms = currentAgent.permissions || {};
      setPermissions({
        canAccessRegistration: perms.canAccessRegistration !== false,
        canAccessOnboardedShops: perms.canAccessOnboardedShops !== false,
        canAccessExpiredShops: Boolean(perms.canAccessExpiredShops),
        canAccessBusinessAdmins: Boolean(perms.canAccessBusinessAdmins),
        canAccessPlans: Boolean(perms.canAccessPlans),
        canAccessCoupons: Boolean(perms.canAccessCoupons),
        canAccessDemoRequests: Boolean(perms.canAccessDemoRequests),
        canAccessPayments: Boolean(perms.canAccessPayments),
        canManageAppointments: perms.canManageAppointments !== false,
      });
    }
  }, [currentAgent]);

  const handleToggleControl = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveControls = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await dispatch(
        updateAgent({
          id,
          data: {
            isActive,
            permissions: {
              ...permissions,
              canManageShopProfile: true,
              canRegisterShops: true,
              canManageOnboarding: true,
              canManageBilling: true,
            },
          },
        })
      ).unwrap();
      dispatch(showNotification({ message: 'Agent controls and status saved successfully!' }));
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to save controls', failure: true }));
    } finally {
      setSaving(false);
    }
  };

  const registeredShops: any[] = currentAgent?.registeredShops || [];

  const filteredShops = registeredShops.filter((shop: any) => {
    const term = shopSearch.toLowerCase();
    return (
      shop.name?.toLowerCase().includes(term) ||
      shop.ownerName?.toLowerCase().includes(term) ||
      shop.category?.toLowerCase().includes(term) ||
      shop.slug?.toLowerCase().includes(term) ||
      shop.phone?.toLowerCase().includes(term) ||
      shop.email?.toLowerCase().includes(term)
    );
  });

  const activeControlsCount = Object.values(permissions).filter(Boolean).length;

  if (currentAgentLoading || !currentAgent) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={36} thickness={4} sx={{ color: ACCENT }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, pb: 8 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha(SURFACE, 0.85), backdropFilter: 'blur(12px)', borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 1.75, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <IconButton onClick={() => navigate('/superadmin/agents')} size="small" sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, width: 36, height: 36, color: '#334155', '&:hover': { bgcolor: ACCENT_SOFT, borderColor: ACCENT_BORDER, color: ACCENT } }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: INK, letterSpacing: -0.2 }}>{currentAgent.name}</Typography>
              <Chip
                size="small"
                icon={isActive ? <CheckCircleRoundedIcon sx={{ fontSize: 12 }} /> : <CancelRoundedIcon sx={{ fontSize: 12 }} />}
                label={isActive ? 'Active' : 'Inactive'}
                sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: isActive ? SUCCESS_SOFT : '#f1f5f9', color: isActive ? SUCCESS : MUTED, border: `1px solid ${isActive ? SUCCESS_BORDER : BORDER}`, '& .MuiChip-icon': { color: isActive ? SUCCESS : MUTED } }}
              />
            </Box>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>Agent Details, Platform Controls & Registered Shops</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.25 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditRoundedIcon sx={{ fontSize: 15 }} />}
              onClick={() => navigate(`/superadmin/agents/edit/${currentAgent._id}`)}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 1.5, px: 2, color: MUTED, borderColor: BORDER, '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' } }}
            >
              Edit Credentials
            </Button>
            <Button
              variant="contained"
              disableElevation
              size="small"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={14} thickness={4} sx={{ color: '#fff' }} /> : <SaveRoundedIcon sx={{ fontSize: 15 }} />}
              onClick={handleSaveControls}
              sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}
            >
              {saving ? 'Saving…' : 'Save Controls'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, pt: 3 }}>
        <Stack spacing={3}>
          <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Grid container spacing={3} sx={{ alignItems: 'center' }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontSize: 17, fontWeight: 800, color: INK, lineHeight: 1.2 }}>{currentAgent.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.2 }}>Platform Delegated Agent</Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <EmailRoundedIcon sx={{ fontSize: 13, color: MUTED }} />
                          <Typography sx={{ fontSize: 12, color: INK, fontWeight: 500 }}>{currentAgent.email}</Typography>
                        </Box>
                        {currentAgent.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                            <PhoneRoundedIcon sx={{ fontSize: 13, color: MUTED }} />
                            <Typography sx={{ fontSize: 12, color: INK, fontWeight: 500 }}>{currentAgent.phone}</Typography>
                          </Box>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <CalendarMonthRoundedIcon sx={{ fontSize: 13, color: MUTED }} />
                          <Typography sx={{ fontSize: 12, color: MUTED }}>Created {new Date(currentAgent.createdAt).toLocaleDateString()}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' }, flexWrap: 'wrap' }}>
                    <Box sx={{ p: 1.5, px: 2.25, borderRadius: 2, bgcolor: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, textAlign: 'center', minWidth: 110 }}>
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color: ACCENT_DARK, lineHeight: 1 }}>{registeredShops.length}</Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: ACCENT_DARK, mt: 0.4 }}>Registered Shops</Typography>
                    </Box>

                    <Box sx={{ p: 1.5, px: 2.25, borderRadius: 2, bgcolor: '#fbfcfe', border: `1px solid ${BORDER}`, textAlign: 'center', minWidth: 110 }}>
                      <Typography sx={{ fontSize: 22, fontWeight: 800, color: INK, lineHeight: 1 }}>{activeControlsCount}<Box component="span" sx={{ fontSize: 13, fontWeight: 700, color: MUTED }}>/{CONTROLS_CONFIG.length}</Box></Typography>
                      <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, mt: 0.4 }}>Active Controls</Typography>
                    </Box>

                    <Box sx={{ p: 1.5, px: 2, borderRadius: 2, border: `1px solid ${isActive ? SUCCESS_BORDER : BORDER}`, bgcolor: isActive ? SUCCESS_SOFT : '#f8fafc', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: INK }}>Login Access</Typography>
                        <Typography sx={{ fontSize: 10.5, color: MUTED }}>{isActive ? 'Account active' : 'Disabled'}</Typography>
                      </Box>
                      <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} size="small" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: SUCCESS }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: SUCCESS, opacity: 1 } }} />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
                <Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK, letterSpacing: -0.1 }}>Superadmin Delegated Controls</Typography>
                  <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.25 }}>Enable or disable which Superadmin sidebar sections and operational controls this agent handles.</Typography>
                </Box>
                <Chip
                  label={`${activeControlsCount} of ${CONTROLS_CONFIG.length} Controls Enabled`}
                  size="small"
                  sx={{ height: 24, fontSize: 11, fontWeight: 700, bgcolor: ACCENT_SOFT, color: ACCENT_DARK, border: `1px solid ${ACCENT_BORDER}` }}
                />
              </Box>

              <Grid container spacing={1.5}>
                {CONTROLS_CONFIG.map((control) => {
                  const isChecked = Boolean(permissions[control.key]);
                  return (
                    <Grid key={control.key} size={{ xs: 12, sm: 6, lg: 4 }}>
                      <Box
                        onClick={() => handleToggleControl(control.key)}
                        sx={{
                          p: 1.75,
                          borderRadius: 2,
                          border: `1px solid ${isChecked ? control.border : BORDER}`,
                          bgcolor: isChecked ? control.soft : '#fbfcfe',
                          cursor: 'pointer',
                          transition: 'all .18s ease',
                          display: 'flex',
                          gap: 1.5,
                          alignItems: 'flex-start',
                          '&:hover': {
                            borderColor: isChecked ? control.tone : alpha(ACCENT, 0.4),
                            bgcolor: isChecked ? control.soft : '#f8fafc',
                          },
                        }}
                      >
                        <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: isChecked ? control.tone : '#f1f5f9', color: isChecked ? '#fff' : MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .18s ease' }}>
                          {control.icon}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.35 }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: isChecked ? INK : MUTED, lineHeight: 1.3 }}>{control.title}</Typography>
                            {control.isSidenav && isChecked && (
                              <Chip label="Sidenav" size="small" sx={{ height: 16, fontSize: 9, fontWeight: 700, bgcolor: alpha(control.tone, 0.15), color: control.tone, px: 0.2 }} />
                            )}
                          </Box>
                          <Typography sx={{ fontSize: 11, color: MUTED, lineHeight: 1.45 }}>{control.description}</Typography>
                        </Box>
                        <Switch
                          size="small"
                          checked={isChecked}
                          onChange={() => handleToggleControl(control.key)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: control.tone }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: control.tone, opacity: 1 } }}
                        />
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK, letterSpacing: -0.1 }}>Shops Registered by this Agent</Typography>
                    <Chip label={registeredShops.length} size="small" sx={{ height: 22, fontWeight: 800, fontSize: 11, bgcolor: ACCENT_SOFT, color: ACCENT_DARK, border: `1px solid ${ACCENT_BORDER}` }} />
                  </Box>
                  <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.25 }}>Shops created and managed by this agent in the Agent Portal.</Typography>
                </Box>
                <Box sx={{ minWidth: 260 }}>
                  <SearchBar value={shopSearch} onChange={setShopSearch} placeholder="Search registered shops..." />
                </Box>
              </Box>

              {registeredShops.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, bgcolor: '#fbfcfe', borderRadius: 2, border: `1px dashed ${BORDER}` }}>
                  <StorefrontRoundedIcon sx={{ fontSize: 44, color: '#cbd5e1', mb: 1.25 }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: INK }}>No shops registered yet by this agent</Typography>
                  <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.5, maxWidth: 440, mx: 'auto' }}>
                    When this agent registers a new shop from their Agent Portal, the shop will automatically be linked and displayed in this table.
                  </Typography>
                </Box>
              ) : filteredShops.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: '#fbfcfe', borderRadius: 2, border: `1px dashed ${BORDER}` }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: MUTED }}>No shops match your search filter.</Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, overflow: 'hidden' }}>
                  <Table>
                    <TableHead sx={{ '& .MuiTableCell-head': { fontWeight: 700, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', bgcolor: '#f8fafc', color: `${INK} !important`, py: 1.5 } }}>
                      <TableRow>
                        <TableCell>Shop</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Owner Contact</TableCell>
                        <TableCell>Registered On</TableCell>
                        <TableCell>Verification</TableCell>
                        <TableCell>Subscription</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredShops.map((shop: any) => {
                        const isApproved = shop.verificationStatus === 'Approved';
                        const isChanges = shop.verificationStatus === 'ChangesRequested';
                        const isRejected = shop.verificationStatus === 'Rejected';
                        const vTone = isApproved ? { c: SUCCESS, s: SUCCESS_SOFT, b: SUCCESS_BORDER } : isChanges ? { c: WARNING, s: WARNING_SOFT, b: WARNING_BORDER } : isRejected ? { c: ERROR, s: ERROR_SOFT, b: ERROR_BORDER } : { c: MUTED, s: '#f1f5f9', b: BORDER };
                        const subTone = shop.subscriptionStatus === 'active' ? { c: SUCCESS, s: SUCCESS_SOFT } : shop.subscriptionStatus === 'trial' ? { c: WARNING, s: WARNING_SOFT } : { c: ERROR, s: ERROR_SOFT };

                        return (
                          <TableRow key={shop._id} hover sx={{ '& td': { borderColor: '#f1f4f9', py: 1.5 } }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar sx={{ width: 34, height: 34, bgcolor: ACCENT_SOFT, color: ACCENT_DARK, fontSize: 13, fontWeight: 700, border: `1px solid ${ACCENT_BORDER}` }}>
                                  {(shop.name || shop.ownerName || 'S').charAt(0)?.toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: INK }}>
                                    {shop.name || (shop.ownerName ? `${shop.ownerName}'s Shop` : 'Unnamed Shop')}
                                  </Typography>
                                  <Typography sx={{ fontSize: 11, color: MUTED, fontFamily: '"SF Mono", monospace' }}>/{shop.slug}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={shop.category || 'General'} sx={{ height: 22, fontSize: 10.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', '& .MuiChip-label': { px: 1.2 } }} />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: INK }}>{shop.email || 'N/A'}</Typography>
                              {shop.phone && <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>{shop.phone}</Typography>}
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: 12, color: MUTED }}>
                                {shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={shop.verificationStatus || 'Pending'} sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: vTone.s, color: vTone.c, border: `1px solid ${vTone.b}`, '& .MuiChip-label': { px: 1.2 } }} />
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={shop.subscriptionStatus || 'trial'} sx={{ height: 22, fontSize: 10, fontWeight: 700, textTransform: 'capitalize', bgcolor: subTone.s, color: subTone.c, '& .MuiChip-label': { px: 1 } }} />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: 'flex', gap: 0.75, justifyContent: 'flex-end', alignItems: 'center' }}>
                                <Tooltip title="View Shop Details">
                                  <IconButton size="small" onClick={() => navigate(`/superadmin/shops/${shop._id}`)} sx={{ width: 30, height: 30, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 1.25, '&:hover': { color: ACCENT_DARK, borderColor: ACCENT_BORDER, bgcolor: ACCENT_SOFT } }}>
                                    <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => navigate(`/superadmin/registration?biz=${shop._id}`)}
                                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11, borderRadius: 1.25, px: 1.25, color: INFO, borderColor: INFO_BORDER, '&:hover': { bgcolor: INFO_SOFT } }}
                                >
                                  Onboarding
                                </Button>
                                <Tooltip title="Delete Shop">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleRequestDeleteShop(shop)}
                                    sx={{
                                      width: 30,
                                      height: 30,
                                      color: ERROR,
                                      border: `1px solid ${ERROR_BORDER}`,
                                      borderRadius: 1.25,
                                      '&:hover': { color: '#b91c1c', borderColor: ERROR, bgcolor: ERROR_SOFT }
                                    }}
                                  >
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Box>

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
            Are you sure you want to delete <strong>{shopToDelete?.name || (shopToDelete?.ownerName ? `${shopToDelete?.ownerName}'s Shop` : 'this shop')}</strong> registered by this agent?
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
            onClick={handleConfirmDeleteShop}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: 'none' }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete Shop'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
