import React, { useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Button, Chip, Skeleton, Avatar, Stack, Divider, Alert, alpha } from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchAgentDashboardStats } from '../../features/agent/agentSlice';
import { ACCENT, ACCENT_DARK, ACCENT_SOFT, ACCENT_BORDER, SURFACE, BORDER, MUTED, INK, SUCCESS, SUCCESS_SOFT, SUCCESS_BORDER, WARNING, WARNING_SOFT, WARNING_BORDER, VIOLET, VIOLET_SOFT, VIOLET_BORDER, INFO, INFO_SOFT, INFO_BORDER } from '../../theme/colors';

const KpiCard = memo(({
  icon, label, value, tone, soft, border, caption, onClick, loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: string;
  soft: string;
  border: string;
  caption: string;
  onClick: () => void;
  loading?: boolean;
}) => (
  <Card
    elevation={0}
    onClick={onClick}
    sx={{ position: 'relative', borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', cursor: 'pointer', overflow: 'hidden', height: '100%', transition: 'border-color .22s ease, box-shadow .22s ease, transform .22s ease',
    '&:hover': { borderColor: alpha(tone, 0.45), boxShadow: `0 14px 32px -18px ${alpha(tone, 0.4)}`, transform: 'translateY(-2px)', '& .kpi-arrow': { opacity: 1, transform: 'translateX(0)' }, '& .kpi-icon-tile': { bgcolor: tone, color: '#fff' }}}}
  >
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${tone} 0%, ${alpha(tone, 0.25)} 100%)` }} />
    <Box sx={{ position: 'absolute', top: -24, right: -24, width: 88, height: 88, borderRadius: '50%', bgcolor: alpha(tone, 0.06), filter: 'blur(8px)', pointerEvents: 'none' }} />

    <CardContent sx={{ p: 2.25, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.75 }}>
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, lineHeight: 1.35, mt: 0.5 }}>{label}</Typography>
        <Box className="kpi-icon-tile" sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: soft, color: tone, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .22s ease' }}>{icon}</Box>
      </Box>

      {loading ? (
        <Skeleton width={60} height={32} sx={{ borderRadius: 1 }} />
      ) : (
        <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.8, color: INK, lineHeight: 1, mb: 1.5 }}>{value}</Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, pt: 1.25, borderTop: `1px dashed ${BORDER}` }}>
        <Typography sx={{ fontSize: 10.5, color: MUTED, fontWeight: 500 }}>{caption}</Typography>
        <ArrowForwardRoundedIcon className="kpi-arrow" sx={{ fontSize: 13, color: tone, opacity: 0, transform: 'translateX(-4px)', transition: 'all .22s ease' }} />
      </Box>
    </CardContent>
  </Card>
));

KpiCard.displayName = 'KpiCard';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { dashboardStats, dashboardLoading, profile } = useAppSelector((state) => state.agent);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAgentDashboardStats());
  }, [dispatch]);

  const kpis = [
    { label: 'Assigned Shops', value: dashboardStats?.totalAssignedShops || 0, icon: <StorefrontRoundedIcon sx={{ fontSize: 17 }} />, tone: ACCENT, soft: ACCENT_SOFT, border: ACCENT_BORDER, caption: 'Total managed', action: () => navigate('/agent/shops') },
    { label: 'Active / Approved', value: dashboardStats?.activeShops || 0, icon: <CheckCircleRoundedIcon sx={{ fontSize: 17 }} />, tone: SUCCESS, soft: SUCCESS_SOFT, border: SUCCESS_BORDER, caption: 'Verified & running', action: () => navigate('/agent/shops') },
    { label: 'Pending Onboarding', value: dashboardStats?.pendingShops || 0, icon: <PendingActionsRoundedIcon sx={{ fontSize: 17 }} />, tone: WARNING, soft: WARNING_SOFT, border: WARNING_BORDER, caption: 'Awaiting action', action: () => navigate('/agent/shops') },
    { label: "Today's Appointments", value: dashboardStats?.todayAppointments || 0, icon: <TodayRoundedIcon sx={{ fontSize: 17 }} />, tone: VIOLET, soft: VIOLET_SOFT, border: VIOLET_BORDER, caption: 'Scheduled today', action: () => navigate('/agent/appointments') },
    { label: 'Total Appointments', value: dashboardStats?.totalAppointments || 0, icon: <EventAvailableRoundedIcon sx={{ fontSize: 17 }} />, tone: INFO, soft: INFO_SOFT, border: INFO_BORDER, caption: 'All-time bookings', action: () => navigate('/agent/appointments') },
  ];

  const perms = user?.permissions || profile?.permissions || dashboardStats?.permissions;
  const permissionsList: string[] = [];
  if (perms?.canManageShopProfile !== false) permissionsList.push('Shop Profile Management');
  if (perms?.canManageOnboarding) permissionsList.push('Onboarding & Demo');
  if (perms?.canManageAppointments !== false) permissionsList.push('Appointments Management');
  if (perms?.canManageBilling) permissionsList.push('Billing Access');

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Card sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', p: { xs: 2.5, md: 3.5 }, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: ACCENT, width: 56, height: 56, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <SupportAgentRoundedIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Welcome, {user?.name || 'Agent'}!</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>Slotify Agent Operations Workspace &bull; Managing {dashboardStats?.totalAssignedShops || 0} registered shops</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="contained" onClick={() => navigate('/agent/shops')} sx={{ bgcolor: 'white', color: '#0f172a', fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: '#f1f5f9' } }}>View Registered Shops</Button>
          </Box>
        </Box>

        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <SecurityRoundedIcon sx={{ fontSize: 18, color: '#38bdf8' }} />
          <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, mr: 1 }}>ACTIVE CONTROLS:</Typography>
          {permissionsList.map((p) => (
            <Chip key={p} label={p} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 600, fontSize: '0.72rem' }} />
          ))}
        </Box>
      </Card>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {kpis.map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 2.4 }}>
            <KpiCard icon={kpi.icon} label={kpi.label} value={kpi.value} tone={kpi.tone} soft={kpi.soft} border={kpi.border} caption={kpi.caption} onClick={kpi.action} loading={dashboardLoading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>My Registered Shops</Typography>
                <Button size="small" onClick={() => navigate('/agent/shops')} sx={{ textTransform: 'none', fontWeight: 600, color: ACCENT_DARK }}>View All</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {dashboardLoading ? (
                <Stack spacing={1.5}>{[1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" height={60} />)}</Stack>
              ) : !dashboardStats?.shops || dashboardStats.shops.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>No shops assigned to your account yet. Contact your Superadmin to assign shops.</Alert>
              ) : (
                <Stack spacing={1.5}>
                  {dashboardStats.shops.map((shop: any) => (
                    <Box key={shop._id} onClick={() => navigate(`/agent/shops/${shop._id || shop.id}`)} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { bgcolor: '#f8fafc', borderColor: ACCENT_BORDER } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{shop.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{shop.category || 'General'} &bull; /{shop.slug}</Typography>
                        </Box>
                      </Box>
                      <Chip size="small" label={shop.verificationStatus || 'Pending'} color={shop.verificationStatus === 'Approved' ? 'success' : 'default'} sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 3, border: `1px solid ${BORDER}`, boxShadow: 'none', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Appointments</Typography>
                <Button size="small" onClick={() => navigate('/agent/appointments')} sx={{ textTransform: 'none', fontWeight: 600, color: ACCENT_DARK }}>View All</Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {dashboardLoading ? (
                <Stack spacing={1.5}>{[1, 2, 3].map((n) => <Skeleton key={n} variant="rounded" height={60} />)}</Stack>
              ) : !dashboardStats?.recentAppointments || dashboardStats.recentAppointments.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>No customer appointments found for your registered shops yet.</Alert>
              ) : (
                <Stack spacing={1.5}>
                  {dashboardStats.recentAppointments.map((apt: any) => (
                    <Box key={apt._id} sx={{ p: 1.5, borderRadius: 2, border: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{apt.customerName || 'Customer'}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {apt.businessId?.name || 'Assigned Shop'} &bull; {new Date(apt.startTime).toLocaleDateString()} {new Date(apt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                      <Chip size="small" label={apt.status || 'Pending'} color={apt.status === 'Confirmed' ? 'success' : apt.status === 'Completed' ? 'primary' : apt.status === 'Cancelled' ? 'error' : 'warning'} sx={{ fontWeight: 600, fontSize: '0.72rem' }} />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}