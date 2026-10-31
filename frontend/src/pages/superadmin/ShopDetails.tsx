import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, Grid, Chip, Divider, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Avatar, Stack, alpha,  LinearProgress, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import HourglassBottomRoundedIcon from '@mui/icons-material/HourglassBottomRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DesignServicesRoundedIcon from '@mui/icons-material/DesignServicesRounded';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';

import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchBusinesses, fetchPlans, updateBusiness } from '../../features/superadmin/superadminSlice';
import { fetchAssignedShops, fetchShopDetails, updateShopProfile } from '../../features/agent/agentSlice';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ACCENT, ACCENT_DARK, ACCENT_SOFT, ACCENT_BORDER, SURFACE, PAGE_BG, BORDER, MUTED, INK, SUCCESS, SUCCESS_SOFT, SUCCESS_BORDER, WARNING, WARNING_SOFT, WARNING_BORDER, INFO, NEUTRAL, NEUTRAL_SOFT, NEUTRAL_BORDER, fieldSx } from '../../theme/colors';

const ALL_CONTROLS = [
  'Google Calendar Sync',
  'Google Meet Integration',
  'Custom Branding',
  'Priority Support',
  'Analytics Access',
  'Staff Management',
  'Automated Reminders',
  'Custom Booking Page',
  'WhatsApp Notifications',
];

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: MUTED, mb: 1.5 }}>{children}</Typography>
);

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, mb: 0.75 }}>
    {children}
    {required && <Box component="span" sx={{ color: ACCENT, ml: 0.4 }}>*</Box>}
  </Typography>
);

const ActivityTile = ({
  icon, accent = ACCENT, value, unit, label, caption,
}: {
  icon: React.ReactNode;
  accent?: string;
  value: React.ReactNode;
  unit?: string;
  label: string;
  caption?: string;
}) => (
  <Card
    elevation={0}
    sx={{ position: 'relative', p: 2.5, borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'border-color .2s ease, box-shadow .2s ease, transform .2s ease', '&:hover': { borderColor: alpha(accent, 0.4), boxShadow: `0 10px 28px -16px ${alpha(accent, 0.35)}`, transform: 'translateY(-1px)' }}}
  >
    <Box sx={{ position: 'absolute', top: -30, right: -30, width: 90, height: 90, borderRadius: '50%', bgcolor: alpha(accent, 0.08), filter: 'blur(4px)', pointerEvents: 'none' }} />

    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, position: 'relative' }}>
      <Box sx={{ width: 34, height: 34, borderRadius: 1.5, bgcolor: alpha(accent, 0.11), color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${alpha(accent, 0.22)}`, flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.7, textTransform: 'uppercase', color: MUTED, lineHeight: 1.2 }}>{label}</Typography>
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6, mb: caption ? 1.25 : 0, position: 'relative' }}>
      <Typography sx={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.9, color: INK, lineHeight: 1 }}>{value}</Typography>
      {unit && <Typography sx={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: 0.3 }}>{unit}</Typography>}
    </Box>

    {caption && (
      <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 'auto', pt: 1, borderTop: `1px dashed ${BORDER}`, position: 'relative' }}>{caption}</Typography>
    )}
  </Card>
);

const FinanceCard = ({
  icon, accent = ACCENT, label, value, valueAccent, meta,
}: {
  icon: React.ReactNode;
  accent?: string;
  label: string;
  value: React.ReactNode;
  valueAccent?: string;
  meta?: React.ReactNode;
}) => (
  <Card
    elevation={0}
    sx={{ position: 'relative', p: 3, pt: 3.25, borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'box-shadow .2s ease, border-color .2s ease', '&:hover': { borderColor: alpha(accent, 0.4), boxShadow: `0 12px 32px -18px ${alpha(accent, 0.35)}` },
    }}
  >
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${accent} 0%, ${alpha(accent, 0.25)} 100%)` }} />

    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, mt: 0.5 }}>{label}</Typography>
      <Box sx={{ width: 40, height: 40, borderRadius: 1.75, bgcolor: alpha(accent, 0.1), color: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${alpha(accent, 0.22)}` }}>{icon}</Box>
    </Box>

    <Typography sx={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6, color: valueAccent || INK, lineHeight: 1.1, mb: meta ? 2 : 0 }}>{value}</Typography>

    {meta && <Box sx={{ mt: 'auto', pt: 1.75, borderTop: `1px dashed ${BORDER}` }}>{meta}</Box>}
  </Card>
);

const MetaRow = ({ label, value, valueAccent }: { label: string; value: React.ReactNode; valueAccent?: string }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.75, '&:last-of-type': { mb: 0 } }}>
    <Typography sx={{ fontSize: 11.5, color: MUTED }}>{label}</Typography>
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: valueAccent || INK }}>{value}</Typography>
  </Box>
);

const ShopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { businesses, plans } = useAppSelector((state: any) => state.superadmin);
  const { assignedShops, selectedShop } = useAppSelector((state: any) => state.agent);
  const { user } = useAppSelector((state: any) => state.auth);
  const [bizModalOpen, setBizModalOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'Agent') {
      if (id) dispatch(fetchShopDetails(id));
      dispatch(fetchAssignedShops());
      if (plans.length === 0) dispatch(fetchPlans());
    } else {
      dispatch(fetchBusinesses());
      if (plans.length === 0) dispatch(fetchPlans());
    }
  }, [dispatch, id, user?.role, plans.length]);

  const shop = businesses.find((b: any) => b._id === id || b.id === id)
    || (selectedShop?.shop?._id === id ? selectedShop.shop : null)
    || assignedShops.find((b: any) => b._id === id || b.id === id);

  useEffect(() => {
    if (shop?.paymentStatus === 'Pending') {
      const interval = setInterval(() => {
        if (user?.role === 'Agent') {
          if (id) dispatch(fetchShopDetails(id));
        } else {
          dispatch(fetchBusinesses());
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [dispatch, id, user?.role, shop?.paymentStatus]);
  
  const activePlan = plans.find((p: any) => p._id === shop?.planId || p._id === shop?.paymentBreakdown?.planId || p._id === shop?.requestedPlanId);
  const activeVariant = activePlan?.variants ? (activePlan.variants.find((v: any) => v._id === shop.planVariantId || v._id === shop.paymentBreakdown?.planVariantId) || activePlan.variants[0]) : null;
  const displayPrice = activeVariant?.price ?? activePlan?.price ?? 0;
  const displayName = activeVariant ? `${activePlan?.name} - ${activeVariant.name}` : (activePlan?.name || 'Unknown Plan');

  const getSubscriptionInfo = () => {
    if (!shop) return { endDateStr: '—', daysRemaining: null, isLifetime: false, isTrial: false };

    // 1. Explicit subscriptionEnd
    if (shop.subscriptionEnd) {
      const end = new Date(shop.subscriptionEnd);
      const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
      return { endDateStr: end.toLocaleDateString(), daysRemaining: days, isLifetime: false, isTrial: false };
    }

    // 2. Explicit planEndDate
    if (shop.planEndDate) {
      const end = new Date(shop.planEndDate);
      const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
      return { endDateStr: end.toLocaleDateString(), daysRemaining: days, isLifetime: false, isTrial: false };
    }

    // 3. Payment breakdown endDate
    if (shop.paymentBreakdown?.endDate) {
      const end = new Date(shop.paymentBreakdown.endDate);
      const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
      return { endDateStr: end.toLocaleDateString(), daysRemaining: days, isLifetime: false, isTrial: false };
    }

    // 4. Active Trial
    if (shop.trialStatus === 'Active' && shop.trialEndsAt) {
      const end = new Date(shop.trialEndsAt);
      const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
      return { endDateStr: `${end.toLocaleDateString()} (Trial)`, daysRemaining: days, isLifetime: false, isTrial: true };
    }

    // 5. Active Plan & Variant duration
    if (activePlan) {
      const variant = activePlan.variants?.find((v: any) => v._id === shop.planVariantId || v._id === shop.paymentBreakdown?.planVariantId)
        || (activePlan.variants && activePlan.variants.length > 0 ? activePlan.variants[0] : null);

      if (variant?.billingCycle === 'one-time' || (activePlan as any).isPermanent) {
        return { endDateStr: 'Lifetime', daysRemaining: null, isLifetime: true, isTrial: false };
      }

      const durationDays = variant?.durationDays || (activePlan as any).durationDays || 30;
      const start = shop.subscriptionStart 
        ? new Date(shop.subscriptionStart) 
        : (shop.planStartDate 
          ? new Date(shop.planStartDate) 
          : (shop.paymentCompletedAt 
            ? new Date(shop.paymentCompletedAt) 
            : (shop.paymentLinkGeneratedAt 
              ? new Date(shop.paymentLinkGeneratedAt) 
              : (shop.createdAt ? new Date(shop.createdAt) : new Date()))));

      const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const days = Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
      return { endDateStr: end.toLocaleDateString(), daysRemaining: days, isLifetime: false, isTrial: false };
    }

    return { endDateStr: 'No Active Plan', daysRemaining: null, isLifetime: false, isTrial: false };
  };

  const getSubscriptionEndDate = () => getSubscriptionInfo().endDateStr;

  const bizFormik = useFormik({
    initialValues: {
      name: shop?.name || '',
      slug: shop?.slug || '',
      category: shop?.category || '',
      registrationNumber: shop?.registrationNumber || '',
      description: shop?.description || '',
      email: shop?.email || '',
      phone: shop?.phone || '',
      planId: shop?.planId || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      slug: Yup.string().required('Required'),
      email: Yup.string().email('Invalid email').required('Required'),
      phone: Yup.string().required('Required'),
    }),
    onSubmit: async (values) => {
      try {
        if (user?.role === 'Agent') {
          const { planId: _omitted, ...agentData } = values;
          await dispatch(updateShopProfile({ id: shop._id || shop.id, data: agentData })).unwrap();
          if (id) dispatch(fetchShopDetails(id));
        } else {
          await dispatch(updateBusiness({ id: shop._id || shop.id, data: values })).unwrap();
          dispatch(fetchBusinesses());
        }
        dispatch(showNotification({ message: 'Shop details updated successfully' }));
        setBizModalOpen(false);
      } catch (err: any) {
        dispatch(showNotification({ message: err?.message || err || 'Failed to update', failure: true }));
      }
    },
  });

  if (!shop) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Typography sx={{ color: MUTED }}>Loading…</Typography>
      </Box>
    );
  }

  const hasFinance = shop.paymentBreakdown && shop.paymentStatus;
  const daysActive = Math.max(1, Math.ceil((new Date().getTime() - new Date(shop.createdAt).getTime()) / (1000 * 3600 * 24)));

  const isPaid = shop.paymentStatus === 'Paid';
  const isPending = shop.paymentStatus === 'Pending';
  const subInfo = getSubscriptionInfo();
  const daysRemaining = subInfo.daysRemaining;

  const statusCfg = isPaid
    ? { label: 'Paid', tone: SUCCESS, soft: SUCCESS_SOFT, border: SUCCESS_BORDER, icon: <CheckCircleRoundedIcon sx={{ fontSize: 20 }} /> }
    : isPending
    ? { label: 'Pending', tone: WARNING, soft: WARNING_SOFT, border: WARNING_BORDER, icon: <HourglassBottomRoundedIcon sx={{ fontSize: 20 }} /> }
    : { label: shop.paymentStatus || 'Not Initiated', tone: NEUTRAL, soft: NEUTRAL_SOFT, border: NEUTRAL_BORDER, icon: <HourglassEmptyRoundedIcon sx={{ fontSize: 20 }} /> };

  const subscriptionCfg = subInfo.isLifetime
    ? { tone: ACCENT, soft: ACCENT_SOFT, border: ACCENT_BORDER }
    : daysRemaining === null
    ? { tone: NEUTRAL, soft: NEUTRAL_SOFT, border: NEUTRAL_BORDER }
    : daysRemaining > 30
    ? { tone: SUCCESS, soft: SUCCESS_SOFT, border: SUCCESS_BORDER }
    : daysRemaining > 0
    ? { tone: WARNING, soft: WARNING_SOFT, border: WARNING_BORDER }
    : { tone: '#dc2626', soft: '#fef2f2', border: '#fecaca' };

  const totalDays = activeVariant?.durationDays
    || (activePlan as any)?.durationDays
    || 30;
  const elapsed = Math.max(0, totalDays - (daysRemaining ?? totalDays));
  const progressPct = subInfo.isLifetime 
    ? 100 
    : daysRemaining === null 
    ? 0 
    : Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

  const paymentBreakdown = shop.paymentBreakdown || {};
  const basePrice = paymentBreakdown.basePrice || 0;
  const discountAmount = paymentBreakdown.discountAmount || 0;
  const gstAmount = paymentBreakdown.gstAmount || 0;
  const totalAmount = paymentBreakdown.totalAmount || 0;

  const setupComplete = !!(shop.name && shop.email && shop.phone);
  const setupCaption = setupComplete ? 'All profile fields complete' : 'Some profile fields missing';
  const appointmentsCaption = shop.stats?.appointments ? `${shop.stats.appointments} booked in total` : 'No bookings yet';
  const servicesCaption = shop.stats?.services ? `${shop.stats.services} listed services` : 'No services listed yet';
  const walkinsCaption = shop.stats?.walkins ? `${shop.stats.walkins} in-store bookings` : 'No walk-in bookings';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, pb: 8 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha(SURFACE, 0.85), backdropFilter: 'blur(12px)', borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 2, md: 4 }, py: 1.75, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => { if (user?.role === 'Agent') { navigate('/agent/shops'); } else { navigate('/superadmin/shops'); } }} size="small" sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, width: 36, height: 36, color: '#334155', '&:hover': { bgcolor: ACCENT_SOFT, borderColor: ACCENT_BORDER, color: ACCENT } }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }}>
            <StorefrontRoundedIcon sx={{ fontSize: 18 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.2, color: INK, lineHeight: 1.2 }}>
              {shop.name || (shop.ownerName ? `${shop.ownerName}'s Shop` : 'Unnamed Shop')}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>Onboarded Shop · {shop.category || 'Uncategorised'}</Typography>
          </Box>

          <Chip label="ONBOARDED" size="small" sx={{ height: 24, fontWeight: 700, fontSize: 10, letterSpacing: 0.6, bgcolor: ACCENT_SOFT, color: ACCENT_DARK, border: `1px solid ${ACCENT_BORDER}`, '& .MuiChip-label': { px: 1.25 } }} />

          <Button variant="contained" disableElevation startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />} onClick={() => setBizModalOpen(true)} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, borderRadius: 1.5, px: 2, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>
            Edit Details
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1240, mx: 'auto', px: { xs: 2, md: 4 }, pt: 4 }}>
        <Stack spacing={3}>
          <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', p: { xs: 2.5, md: 3 } }}>
            <Box sx={{ display: 'flex', gap: 2.5, alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Avatar sx={{ width: 64, height: 64, bgcolor: ACCENT_SOFT, color: ACCENT_DARK, fontSize: 24, fontWeight: 800, border: `1px solid ${ACCENT_BORDER}` }}>
                {(shop.name || shop.ownerName || 'S').charAt(0).toUpperCase()}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4, color: INK, lineHeight: 1.2 }}>
                  {shop.name || (shop.ownerName ? `${shop.ownerName}'s Shop` : 'Unnamed Shop')}
                </Typography>
                <Typography sx={{ fontSize: 13, color: MUTED, mt: 0.5 }}>{shop.email} · {shop.phone} · {shop.category || '—'}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap' }} useFlexGap>
                  <Chip label={`Reg No: ${shop.registrationNumber || '—'}`} size="small" sx={{ height: 22, fontSize: 10.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', '& .MuiChip-label': { px: 1.25 } }} />
                  <Chip label={`Slug: ${shop.slug || '—'}`} size="small" sx={{ height: 22, fontSize: 10.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', fontFamily: '"SF Mono", monospace', '& .MuiChip-label': { px: 1.25 } }} />
                  {activePlan && <Chip label={`Plan: ${activePlan.name}`} size="small" sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: ACCENT, color: '#fff', '& .MuiChip-label': { px: 1.25 } }} />}
                </Stack>
              </Box>
            </Box>
          </Card>

          {hasFinance && (
            <Box>
              <SectionLabel>Finance Metrics</SectionLabel>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FinanceCard
                    icon={<CurrencyRupeeRoundedIcon sx={{ fontSize: 20 }} />}
                    accent={SUCCESS}
                    label="Total Amount Paid"
                    value={`₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    valueAccent={INK}
                    meta={
                      <>
                        <MetaRow label="Base price" value={`₹${basePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                        {discountAmount > 0 && <MetaRow label="Discount" value={`−₹${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} valueAccent={SUCCESS} />}
                        <MetaRow label="GST (18%)" value={`+₹${gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                      </>
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FinanceCard
                    icon={<ShoppingCartRoundedIcon sx={{ fontSize: 20 }} />}
                    accent={statusCfg.tone}
                    label="Payment Status"
                    value={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: statusCfg.tone, display: 'flex' }}>{statusCfg.icon}</Box>
                        <Box component="span" sx={{ color: statusCfg.tone }}>{statusCfg.label}</Box>
                      </Box>
                    }
                    meta={
                      <>
                        {isPaid && shop.paymentReferenceId && (
                          <MetaRow label="Reference" value={<Box component="span" sx={{ fontFamily: '"SF Mono", monospace', fontSize: 11 }}>{shop.paymentReferenceId}</Box>} />
                        )}
                        {isPaid && shop.paymentCompletedAt && (
                          <MetaRow label="Paid on" value={new Date(shop.paymentCompletedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} />
                        )}
                        {isPending && <MetaRow label="Awaiting" value="Customer payment" />}
                        {!isPaid && !isPending && <MetaRow label="Next step" value="Send payment link" />}
                        <MetaRow label="Method" value={isPaid ? 'Online — Card/UPI' : '—'} />
                        {shop.paymentToken && (
                          <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px dashed ${alpha(statusCfg.tone, 0.3)}` }}>
                            <Button 
                              variant="text" 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(window.location.origin + `/pay/${shop.paymentToken}`);
                                dispatch(showNotification({ message: 'Payment link copied to clipboard!' }));
                              }}
                              sx={{ 
                                color: statusCfg.tone, 
                                p: 0,
                                textTransform: 'none',
                                fontWeight: 600,
                                fontSize: 11,
                                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                              }}
                            >
                              Copy Pending Payment Link
                            </Button>
                          </Box>
                        )}
                      </>
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FinanceCard
                    icon={<CalendarMonthRoundedIcon sx={{ fontSize: 20 }} />}
                    accent={subscriptionCfg.tone}
                    label="Subscription End"
                    value={getSubscriptionEndDate()}
                    valueAccent={INK}
                    meta={
                      <>
                        {daysRemaining !== null && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography sx={{ fontSize: 11.5, color: MUTED }}>Days remaining</Typography>
                            <Chip
                              label={daysRemaining > 0 ? `${daysRemaining} days` : 'Expired'}
                              size="small"
                              sx={{ height: 20, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, bgcolor: subscriptionCfg.soft, color: subscriptionCfg.tone, border: `1px solid ${subscriptionCfg.border}`, '& .MuiChip-label': { px: 1 } }}
                            />
                          </Box>
                        )}
                        {daysRemaining !== null && (
                          <Box sx={{ mb: 1 }}>
                            <LinearProgress variant="determinate" value={progressPct} sx={{ height: 5, borderRadius: 999, bgcolor: alpha(subscriptionCfg.tone, 0.12), '& .MuiLinearProgress-bar': { bgcolor: subscriptionCfg.tone, borderRadius: 999 } }} />
                          </Box>
                        )}
                        <MetaRow
                          label="Started"
                          value={
                            shop.subscriptionStart || shop.planStartDate
                              ? new Date(shop.subscriptionStart || shop.planStartDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
                              : (shop.createdAt ? new Date(shop.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—')
                          }
                        />
                        <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px dashed ${alpha(subscriptionCfg.border, 0.5)}` }}>
                            <Button 
                              variant="outlined" 
                              fullWidth 
                              size="small"
                              onClick={() => { if (user?.role === 'Agent') { navigate(`/agent/allocate-plan/${shop._id || shop.id}`); } else { navigate(`/superadmin/allocate-plan/${shop._id || shop.id}`); } }}
                              sx={{ 
                                color: subscriptionCfg.tone, 
                                borderColor: subscriptionCfg.tone,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                  bgcolor: subscriptionCfg.soft,
                                  borderColor: subscriptionCfg.tone
                                }
                              }}
                            >
                              Manage Subscription
                            </Button>
                          </Box>
                      </>
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          )}
          <Box>
            <SectionLabel>Activity Metrics</SectionLabel>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <ActivityTile
                  icon={<TrendingUpRoundedIcon sx={{ fontSize: 17 }} />}
                  accent={ACCENT}
                  value={daysActive}
                  unit="days"
                  label="Days Active"
                  caption={`Since ${new Date(shop.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <ActivityTile
                  icon={<BadgeRoundedIcon sx={{ fontSize: 17 }} />}
                  accent={setupComplete ? SUCCESS : WARNING}
                  value={setupComplete ? '100%' : 'Incomplete'}
                  label="Profile Setup"
                  caption={setupCaption}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 2 }}>
                <ActivityTile
                  icon={<CalendarMonthOutlinedIcon sx={{ fontSize: 17 }} />}
                  accent={INFO}
                  value={shop.stats?.appointments || 0}
                  label="Appointments"
                  caption={appointmentsCaption}
                />
              </Grid>

              <Grid size={{ xs: 6, sm: 2 }}>
                <ActivityTile
                  icon={<DesignServicesRoundedIcon sx={{ fontSize: 17 }} />}
                  accent="#7c3aed"
                  value={shop.stats?.services || 0}
                  label="Services"
                  caption={servicesCaption}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 2 }}>
                <ActivityTile
                  icon={<StorefrontOutlinedIcon sx={{ fontSize: 17 }} />}
                  accent={WARNING}
                  value={shop.stats?.walkins || 0}
                  label="Walk-ins"
                  caption={walkinsCaption}
                />
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionLabel>Feature Controls</SectionLabel>
              <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', p: 3 }}>
                {activePlan ? (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: 1.25, bgcolor: ACCENT_SOFT, color: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${ACCENT_BORDER}` }}>
                          <ExtensionRoundedIcon sx={{ fontSize: 16 }} />
                        </Box>
                        <Typography sx={{ fontSize: 12.5, color: MUTED }}>Capabilities bundled with this plan</Typography>
                      </Box>
                      <Chip label={`${activePlan.controls?.length || 0} / ${ALL_CONTROLS.length}`} size="small" sx={{ height: 24, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, bgcolor: ACCENT, color: '#fff', '& .MuiChip-label': { px: 1.5 } }} />
                    </Box>

                    <Grid container spacing={1.5}>
                      {ALL_CONTROLS.map((ctrl) => {
                        const isEnabled = activePlan.controls?.includes(ctrl);
                        return (
                          <Grid size={{ xs: 12, sm: 6 }} key={ctrl}>
                            <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: isEnabled ? ACCENT_SOFT : '#fbfcfe', border: `1px solid ${isEnabled ? ACCENT_BORDER : BORDER}`, borderRadius: 1.75, transition: 'all .2s ease' }}>
                              <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: isEnabled ? INK : MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ctrl}</Typography>
                              {isEnabled ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: ACCENT }} /> : <CloseRoundedIcon sx={{ fontSize: 18, color: MUTED, opacity: 0.5 }} />}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <BusinessCenterRoundedIcon sx={{ fontSize: 44, color: '#e2e8f0', mb: 1.5 }} />
                    <Typography sx={{ fontSize: 13, color: MUTED }}>No active plan assigned yet.</Typography>
                  </Box>
                )}
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <SectionLabel>Detailed Plan Information</SectionLabel>
              {shop.paymentStatus === 'Pending' && shop.paymentBreakdown?.planId && shop.paymentBreakdown?.planId !== shop.planId && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  A payment link for a new plan has been generated. The plan below will update automatically once the business owner completes the payment.
                </Alert>
              )}
              <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', p: 3 }}>
                {activePlan ? (
                  <Stack spacing={2}>
                    <Box>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 0.5 }}>Plan Name</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>{displayName}</Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#f1f4f9' }} />
                    <Box>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 0.5 }}>Description</Typography>
                      <Typography sx={{ fontSize: 13.5, color: INK, lineHeight: 1.55 }}>{activePlan.description || 'No description provided.'}</Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#f1f4f9' }} />
                    <Box>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 0.5 }}>Base Price</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>₹{displayPrice}</Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#f1f4f9' }} />
                    <Box>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 0.5 }}>Subscription Window</Typography>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                          <CalendarTodayRoundedIcon sx={{ fontSize: 15, color: MUTED }} />
                          <Typography sx={{ fontSize: 13.5, color: INK, fontWeight: 600 }}>
                            {shop.subscriptionStart || shop.planStartDate 
                              ? new Date(shop.subscriptionStart || shop.planStartDate).toLocaleDateString() 
                              : (shop.createdAt ? new Date(shop.createdAt).toLocaleDateString() : 'N/A')} — {subInfo.endDateStr}
                          </Typography>
                        </Stack>
                        {daysRemaining !== null && (
                          <Chip
                            label={daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: 11,
                              fontWeight: 700,
                              bgcolor: subscriptionCfg.soft,
                              color: subscriptionCfg.tone,
                              border: `1px solid ${subscriptionCfg.border}`
                            }}
                          />
                        )}
                      </Stack>
                      {daysRemaining !== null && (
                        <Box sx={{ mt: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={progressPct} 
                            sx={{ 
                              height: 5, 
                              borderRadius: 999, 
                              bgcolor: alpha(subscriptionCfg.tone, 0.12), 
                              '& .MuiLinearProgress-bar': { bgcolor: subscriptionCfg.tone, borderRadius: 999 } 
                            }} 
                          />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, p: 1.5, borderRadius: 1.5, bgcolor: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, mt: 1 }}>
                      <InfoOutlinedIcon sx={{ fontSize: 15, color: ACCENT, mt: 0.15, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 11.5, color: ACCENT_DARK, lineHeight: 1.5 }}>
                        Plan assignment can be changed via the Edit Details action above.
                      </Typography>
                    </Box>
                  </Stack>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 5 }}>
                    <BusinessCenterRoundedIcon sx={{ fontSize: 44, color: '#e2e8f0', mb: 1.5 }} />
                    <Typography sx={{ fontSize: 13, color: MUTED }}>This shop does not have an active plan assigned yet.</Typography>
                  </Box>
                )}
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </Box>

      <Dialog
        open={bizModalOpen}
        onClose={() => setBizModalOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{ paper: { sx: { borderRadius: 2.5, border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px -24px rgba(15,23,42,0.25)' } } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2.5, borderBottom: `1px solid ${BORDER}` }}>
          <Box>
            <Typography sx={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.2, color: INK }}>Edit Shop Details</Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>
              {user?.role === 'Agent' ? 'Update the profile and contact information' : 'Update the profile, contact, and plan information'}
            </Typography>
          </Box>
          <IconButton onClick={() => setBizModalOpen(false)} size="small" sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, width: 32, height: 32, color: MUTED, '&:hover': { bgcolor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626' } }}>
            <CloseRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={bizFormik.handleSubmit}>
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel required>Business Name</FieldLabel>
                <TextField fullWidth size="small" name="name" value={bizFormik.values.name} onChange={bizFormik.handleChange} onBlur={bizFormik.handleBlur} error={bizFormik.touched.name && Boolean(bizFormik.errors.name)} helperText={bizFormik.touched.name && (bizFormik.errors.name as string)} sx={fieldSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel required>URL Slug</FieldLabel>
                <TextField fullWidth size="small" name="slug" placeholder="abc-clinic" value={bizFormik.values.slug} onChange={bizFormik.handleChange} onBlur={bizFormik.handleBlur} error={bizFormik.touched.slug && Boolean(bizFormik.errors.slug)} helperText={bizFormik.touched.slug && (bizFormik.errors.slug as string)} sx={{ ...fieldSx, '& .MuiOutlinedInput-input': { py: 1, fontFamily: '"SF Mono", monospace' } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel required>Contact Email</FieldLabel>
                <TextField fullWidth size="small" type="email" name="email" value={bizFormik.values.email} onChange={bizFormik.handleChange} onBlur={bizFormik.handleBlur} error={bizFormik.touched.email && Boolean(bizFormik.errors.email)} helperText={bizFormik.touched.email && (bizFormik.errors.email as string)} sx={fieldSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel required>Contact Phone</FieldLabel>
                <TextField fullWidth size="small" name="phone" value={bizFormik.values.phone} onChange={bizFormik.handleChange} onBlur={bizFormik.handleBlur} error={bizFormik.touched.phone && Boolean(bizFormik.errors.phone)} helperText={bizFormik.touched.phone && (bizFormik.errors.phone as string)} sx={fieldSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel>Category</FieldLabel>
                <TextField fullWidth size="small" name="category" value={bizFormik.values.category} onChange={bizFormik.handleChange} sx={fieldSx} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FieldLabel>Registration Number</FieldLabel>
                <TextField fullWidth size="small" name="registrationNumber" value={bizFormik.values.registrationNumber} onChange={bizFormik.handleChange} sx={fieldSx} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FieldLabel>Description</FieldLabel>
                <TextField fullWidth size="small" name="description" multiline rows={2} value={bizFormik.values.description} onChange={bizFormik.handleChange} sx={fieldSx} />
              </Grid>
              {user?.role !== 'Agent' && (
                <Grid size={{ xs: 12 }}>
                  <FieldLabel>Subscription Plan</FieldLabel>
                  <TextField fullWidth select size="small" name="planId" value={bizFormik.values.planId} onChange={bizFormik.handleChange} sx={fieldSx}>
                    <MenuItem value="" sx={{ fontSize: 13.5 }}><em>None</em></MenuItem>
                    {plans.map((p: any) => (
                      <MenuItem key={p._id} value={p._id} sx={{ fontSize: 13.5 }}>{p.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: `1px solid ${BORDER}`, gap: 1 }}>
            <Button onClick={() => setBizModalOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, color: MUTED, borderRadius: 1.5, px: 2 }}>Cancel</Button>
            <Button type="submit" variant="contained" disableElevation startIcon={<SaveRoundedIcon sx={{ fontSize: 16 }} />} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>
              Save Changes
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ShopDetails;