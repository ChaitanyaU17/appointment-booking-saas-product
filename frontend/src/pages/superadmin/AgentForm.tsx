import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, TextField, Switch,
  Card, CardContent, Grid, CircularProgress,
  InputAdornment, IconButton, Stack, alpha,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import VideoCameraFrontRoundedIcon from '@mui/icons-material/VideoCameraFrontRounded';
import PaymentRoundedIcon from '@mui/icons-material/PaymentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useAppDispatch } from '../../hook';
import { showNotification } from '../../features/notifications/notificationSlice';
import { createAgent, updateAgent, fetchAgentById } from '../../features/superadmin/superadminSlice';
import { ACCENT, ACCENT_DARK, ACCENT_SOFT, ACCENT_BORDER, SURFACE, PAGE_BG, BORDER, MUTED, INK, SUCCESS, SUCCESS_SOFT, SUCCESS_BORDER, WARNING, WARNING_SOFT, WARNING_BORDER, ERROR, ERROR_SOFT, INFO, INFO_SOFT, INFO_BORDER, VIOLET, VIOLET_SOFT, VIOLET_BORDER, fieldSx } from '../../theme/colors';

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, mb: 0.75 }}>
    {children}{required && <Box component="span" sx={{ color: ACCENT, ml: 0.4 }}>*</Box>}
  </Typography>
);

const SectionCard = ({ icon, title, caption, children }: { icon: React.ReactNode; title: string; caption?: string; children: React.ReactNode }) => (
  <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, flexShrink: 0 }}>
          {icon}
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, letterSpacing: -0.1 }}>{title}</Typography>
          {caption && <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>{caption}</Typography>}
        </Box>
      </Box>
      {children}
    </CardContent>
  </Card>
);

const PermissionTile = ({
  icon,
  title,
  description,
  tone,
  soft,
  border,
  checked,
  onChange
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone: string;
  soft: string;
  border: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <Box
    onClick={() => onChange(!checked)}
    sx={{
      p: 2,
      borderRadius: 2,
      border: `1px solid ${checked ? border : BORDER}`,
      bgcolor: checked ? soft : '#fbfcfe',
      cursor: 'pointer',
      transition: 'all .18s ease',
      display: 'flex',
      gap: 1.5,
      alignItems: 'flex-start',
      '&:hover': {
        borderColor: checked ? tone : alpha(ACCENT, 0.4),
        bgcolor: checked ? soft : '#f8fafc',
      },
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1.25,
        bgcolor: checked ? tone : '#f1f5f9',
        color: checked ? '#fff' : MUTED,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all .18s ease',
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: checked ? INK : MUTED, lineHeight: 1.3 }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 11, color: MUTED, mt: 0.35, lineHeight: 1.45 }}>
        {description}
      </Typography>
    </Box>
    <Switch
      size="small"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': { color: tone },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: tone, opacity: 1 },
      }}
    />
  </Box>
);

export default function AgentForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [loading, setLoading] = useState(false);
  const [fetchingAgent, setFetchingAgent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  // 9 side navigation module controls
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    canAccessRegistration: true,
    canAccessOnboardedShops: true,
    canAccessExpiredShops: false,
    canAccessBusinessAdmins: false,
    canAccessPlans: true,
    canAccessCoupons: true,
    canAccessDemoRequests: false,
    canAccessPayments: false,
    canManageAppointments: true,
  });

  useEffect(() => {
    if (isEdit && id) {
      setFetchingAgent(true);
      dispatch(fetchAgentById(id))
        .unwrap()
        .then((agentData: any) => {
          if (agentData) {
            setName(agentData.name || '');
            setEmail(agentData.email || '');
            setPhone(agentData.phone || '');
            setIsActive(agentData.isActive !== false);
            if (agentData.permissions) {
              setPermissions({
                canAccessRegistration: Boolean(agentData.permissions.canAccessRegistration),
                canAccessOnboardedShops: agentData.permissions.canAccessOnboardedShops !== false,
                canAccessExpiredShops: Boolean(agentData.permissions.canAccessExpiredShops),
                canAccessBusinessAdmins: Boolean(agentData.permissions.canAccessBusinessAdmins),
                canAccessPlans: Boolean(agentData.permissions.canAccessPlans),
                canAccessCoupons: Boolean(agentData.permissions.canAccessCoupons),
                canAccessDemoRequests: Boolean(agentData.permissions.canAccessDemoRequests),
                canAccessPayments: Boolean(agentData.permissions.canAccessPayments),
                canManageAppointments: agentData.permissions.canManageAppointments !== false,
              });
            }
          }
        })
        .catch((err: any) => {
          dispatch(showNotification({ message: err || 'Failed to load agent', failure: true }));
          navigate('/superadmin/agents');
        })
        .finally(() => setFetchingAgent(false));
    }
  }, [dispatch, id, isEdit, navigate]);

  const handleToggleControl = (key: string, val: boolean) => {
    setPermissions((prev) => ({ ...prev, [key]: val }));
  };

  const handleSelectAllControls = () => {
    const allOn: Record<string, boolean> = {};
    Object.keys(permissions).forEach((k) => { allOn[k] = true; });
    setPermissions(allOn);
  };

  const handleClearAllControls = () => {
    const allOff: Record<string, boolean> = {};
    Object.keys(permissions).forEach((k) => { allOff[k] = false; });
    setPermissions(allOff);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      dispatch(showNotification({ message: 'Name and email are required', failure: true }));
      return;
    }
    if (!isEdit && !password.trim()) {
      dispatch(showNotification({ message: 'Password is required for new agents', failure: true }));
      return;
    }
    if (!isEdit && !confirmPassword.trim()) {
      dispatch(showNotification({ message: 'Please confirm the password', failure: true }));
      return;
    }
    if (password.trim() && password.trim() !== confirmPassword.trim()) {
      dispatch(showNotification({ message: 'Passwords do not match', failure: true }));
      return;
    }
    if (password.trim() && password.trim().length < 6) {
      dispatch(showNotification({ message: 'Password must be at least 6 characters', failure: true }));
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        permissions: {
          ...permissions,
          canRegisterShops: true,
          canManageShopProfile: true,
          canManageOnboarding: true,
          canManageBilling: true,
        },
        isActive,
      };
      if (password.trim()) payload.password = password.trim();

      if (isEdit && id) {
        await dispatch(updateAgent({ id, data: payload })).unwrap();
        dispatch(showNotification({ message: 'Agent updated successfully!' }));
        navigate(`/superadmin/agents/${id}`);
      } else {
        const res: any = await dispatch(createAgent(payload)).unwrap();
        dispatch(showNotification({ message: 'Agent created successfully!' }));
        const newAgentId = res?.agent?._id || res?._id;
        if (newAgentId) {
          navigate(`/superadmin/agents/${newAgentId}`);
        } else {
          navigate('/superadmin/agents');
        }
      }
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to save agent', failure: true }));
    } finally {
      setLoading(false);
    }
  };

  if (fetchingAgent) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={32} thickness={4} sx={{ color: ACCENT }} />
      </Box>
    );
  }

  const activeControlsCount = Object.values(permissions).filter(Boolean).length;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, pb: 8 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha(SURFACE, 0.85), backdropFilter: 'blur(12px)', borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ maxWidth: 1080, mx: 'auto', px: { xs: 2, md: 4 }, py: 1.75, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={() => navigate('/superadmin/agents')}
            size="small"
            sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, width: 36, height: 36, color: '#334155', '&:hover': { bgcolor: ACCENT_SOFT, borderColor: ACCENT_BORDER, color: ACCENT } }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }}>
            <PersonRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.2, color: INK, lineHeight: 1.2 }}>
              {isEdit ? `Edit Agent: ${name || 'Agent'}` : 'Create New Agent'}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>
              Configure account credentials and side navigation module controls
            </Typography>
          </Box>
          <Button
            variant="contained"
            disableElevation
            startIcon={loading ? <CircularProgress size={16} thickness={4} sx={{ color: '#fff' }} /> : <SaveRoundedIcon sx={{ fontSize: 17 }} />}
            onClick={(e) => handleSubmit(e as any)}
            disabled={loading}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}
          >
            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Agent'}
          </Button>
        </Box>
      </Box>

      <form onSubmit={handleSubmit}>
        <Box sx={{ maxWidth: 1080, mx: 'auto', px: { xs: 2, md: 4 }, pt: 3 }}>
          <Stack spacing={2.5}>
            {/* Account Info */}
            <SectionCard icon={<PersonRoundedIcon sx={{ fontSize: 17 }} />} title="Agent Account Information" caption="Basic identity and login credentials">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel required>Full Name</FieldLabel>
                  <TextField fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. John Doe" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel required>Email Address</FieldLabel>
                  <TextField fullWidth size="small" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="agent@example.com" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Phone Number</FieldLabel>
                  <TextField fullWidth size="small" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" sx={fieldSx} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel required={!isEdit}>{isEdit ? 'New Password' : 'Password'}</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!isEdit}
                    placeholder={isEdit ? 'Leave blank to keep current' : 'Enter agent password'}
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: MUTED }}>
                              {showPassword ? <VisibilityOffRoundedIcon sx={{ fontSize: 17 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 17 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel required={!isEdit || Boolean(password.trim())}>{isEdit ? 'Confirm New Password' : 'Confirm Password'}</FieldLabel>
                  <TextField
                    fullWidth
                    size="small"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isEdit || Boolean(password.trim())}
                    placeholder={isEdit ? 'Confirm new password' : 'Confirm agent password'}
                    error={Boolean(password && confirmPassword && password !== confirmPassword)}
                    helperText={password && confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
                    sx={fieldSx}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: MUTED }}>
                              {showConfirmPassword ? <VisibilityOffRoundedIcon sx={{ fontSize: 17 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 17 }} />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: 1.75, border: `1px solid ${isActive ? ACCENT_BORDER : BORDER}`, bgcolor: isActive ? ACCENT_SOFT : '#fbfcfe', transition: 'all .2s ease' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: INK }}>Account Active</Typography>
                      <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>When inactive, the agent cannot log in to the portal.</Typography>
                    </Box>
                    <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT, opacity: 1 } }} />
                  </Box>
                </Grid>
              </Grid>
            </SectionCard>

            {/* Sidenav Module Controls */}
            <SectionCard
              icon={<SecurityRoundedIcon sx={{ fontSize: 17 }} />}
              title="Superadmin Side Navigation Modules"
              caption={`Enabled sections appear directly on the agent's side navigation bar (${activeControlsCount} active)`}
            >
              <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                <Button size="small" variant="outlined" onClick={handleSelectAllControls} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, borderRadius: 1.5, px: 1.75, color: ACCENT_DARK, borderColor: ACCENT_BORDER, '&:hover': { bgcolor: ACCENT_SOFT, borderColor: ACCENT } }}>
                  Enable All
                </Button>
                <Button size="small" variant="text" onClick={handleClearAllControls} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 11.5, borderRadius: 1.5, px: 1.75, color: MUTED, '&:hover': { color: ERROR, bgcolor: ERROR_SOFT } }}>
                  Disable All
                </Button>
              </Box>

              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, mb: 1.25 }}>
                Platform Side Navigation Sections
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PermissionTile
                    icon={<HowToRegRoundedIcon sx={{ fontSize: 16 }} />}
                    title="Registration & Onboarding"
                    description="Show /agent/registration navigation for registration requests."
                    tone={INFO}
                    soft={INFO_SOFT}
                    border={INFO_BORDER}
                    checked={Boolean(permissions.canAccessRegistration)}
                    onChange={(v) => handleToggleControl('canAccessRegistration', v)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PermissionTile
                    icon={<StorefrontRoundedIcon sx={{ fontSize: 16 }} />}
                    title="Onboarded Shops"
                    description="Show /agent/shops navigation for registered active shops."
                    tone={ACCENT_DARK}
                    soft={ACCENT_SOFT}
                    border={ACCENT_BORDER}
                    checked={permissions.canAccessOnboardedShops !== false}
                    onChange={(v) => handleToggleControl('canAccessOnboardedShops', v)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PermissionTile
                    icon={<EventBusyRoundedIcon sx={{ fontSize: 16 }} />}
                    title="Expired Shops"
                    description="Show /agent/expired-shops navigation for expired subscriptions."
                    tone={WARNING}
                    soft={WARNING_SOFT}
                    border={WARNING_BORDER}
                    checked={Boolean(permissions.canAccessExpiredShops)}
                    onChange={(v) => handleToggleControl('canAccessExpiredShops', v)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PermissionTile
                    icon={<PeopleRoundedIcon sx={{ fontSize: 16 }} />}
                    title="Business Admins"
                    description="Show /agent/admins navigation for shop owner logins."
                    tone={VIOLET}
                    soft={VIOLET_SOFT}
                    border={VIOLET_BORDER}
                    checked={Boolean(permissions.canAccessBusinessAdmins)}
                    onChange={(v) => handleToggleControl('canAccessBusinessAdmins', v)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PermissionTile
                    icon={<CardMembershipRoundedIcon sx={{ fontSize: 16 }} />}
                    title="Plans & Pricing"
                    description="Show /agent/plans navigation to review available tiers."
                    tone={SUCCESS}
                    soft={SUCCESS_SOFT}
                    border={SUCCESS_BORDER}
                    checked={Boolean(permissions.canAccessPlans)}
                    onChange={(v) => handleToggleControl('canAccessPlans', v)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PermissionTile
                    icon={<LocalOfferRoundedIcon sx={{ fontSize: 16 }} />}
                    title="Coupons & Discounts"
                    description="Show /agent/coupons navigation to view promo codes."
                    tone={WARNING}
                    soft={WARNING_SOFT}
                    border={WARNING_BORDER}
                    checked={Boolean(permissions.canAccessCoupons)}
                    onChange={(v) => handleToggleControl('canAccessCoupons', v)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PermissionTile
                    icon={<VideoCameraFrontRoundedIcon sx={{ fontSize: 16 }} />}
                    title="Demo Requests"
                    description="Show /agent/demo-requests navigation to review incoming demo leads."
                    tone={INFO}
                    soft={INFO_SOFT}
                    border={INFO_BORDER}
                    checked={Boolean(permissions.canAccessDemoRequests)}
                    onChange={(v) => handleToggleControl('canAccessDemoRequests', v)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PermissionTile
                    icon={<PaymentRoundedIcon sx={{ fontSize: 16 }} />}
                    title="Payments & Invoices"
                    description="Show /agent/payments navigation for invoices and billing records."
                    tone={VIOLET}
                    soft={VIOLET_SOFT}
                    border={VIOLET_BORDER}
                    checked={Boolean(permissions.canAccessPayments)}
                    onChange={(v) => handleToggleControl('canAccessPayments', v)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <PermissionTile
                    icon={<EventNoteRoundedIcon sx={{ fontSize: 16 }} />}
                    title="Appointments Calendar"
                    description="Show /agent/appointments navigation and manage bookings."
                    tone={SUCCESS}
                    soft={SUCCESS_SOFT}
                    border={SUCCESS_BORDER}
                    checked={permissions.canManageAppointments !== false}
                    onChange={(v) => handleToggleControl('canManageAppointments', v)}
                  />
                </Grid>
              </Grid>
            </SectionCard>

            {/* Note on shop registration */}
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 20, color: ACCENT_DARK }} />
              <Typography sx={{ fontSize: 12.5, color: ACCENT_DARK, fontWeight: 600 }}>
                Shops registered by this agent will automatically appear under this agent's management. Superadmin does not need to manually assign shops.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, pt: 1, pb: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/superadmin/agents')}
                disabled={loading}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, px: 2.5, borderRadius: 1.5, color: MUTED, borderColor: BORDER, '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f1f5f9' } }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disableElevation
                disabled={loading}
                startIcon={loading ? <CircularProgress size={16} thickness={4} sx={{ color: '#fff' }} /> : <SaveRoundedIcon sx={{ fontSize: 17 }} />}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, px: 3, borderRadius: 1.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}
              >
                {loading ? 'Saving…' : isEdit ? 'Save Agent Changes' : 'Create Agent'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </form>
    </Box>
  );
}