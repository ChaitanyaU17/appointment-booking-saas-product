import React, { useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { 
  Skeleton, Box, Card, Typography, Grid, useTheme, CardContent, CardHeader, 
  Chip, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Button, 
  Table, TableHead, TableBody, TableCell, TableRow, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VerifiedIcon from '@mui/icons-material/Verified';
import ScienceIcon from '@mui/icons-material/Science';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LinkIcon from '@mui/icons-material/Link';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BadgeIcon from '@mui/icons-material/Badge';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hook';
import { 
  fetchSuperadminDashboard, fetchBusinesses, fetchPlans, fetchAgents 
} from '../../features/superadmin/superadminSlice';
import { formatIST } from '../../utils/format';
import { playNotificationSound } from '../../utils/audio';
import { showNotification } from '../../features/notifications/notificationSlice';

const COLORS = ['#659287', '#B1D3B9', '#88BDA4', '#4a6b62', '#c7e6cf'];

interface ProgressLineSegment {
  value: number;
  color: string;
}

interface ProgressLegendItem {
  label: string;
  count?: number | string;
  color: string;
}

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactElement;
  chipLabel?: string;
  trend?: number | string;
  trendUp?: boolean;
  color?: string;
  loading?: boolean;
  action?: React.ReactNode;
  onClick?: () => void;
  clickableHint?: string;
  progressSegments?: ProgressLineSegment[];
  progressLegends?: ProgressLegendItem[];
}

const KpiCard = React.memo(({ 
  title, 
  value, 
  icon, 
  chipLabel,
  trend, 
  trendUp = true, 
  color = '#659287', 
  loading, 
  action, 
  onClick, 
  clickableHint,
  progressSegments = [],
  progressLegends = []
}: KpiCardProps) => {
  if (loading) return <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} />;

  return (
    <Card 
      onClick={onClick}
      sx={{ px: 2, py: 1.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 8px rgba(31,43,39,0.06)', display: 'flex', alignItems: 'flex-start', gap: 1.5, height: '100%', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', border: '1px solid transparent','&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(31,43,39,0.12)', borderColor: `${color}40`} : {}
      }}
    >
      <Avatar sx={{ bgcolor: `${color}18`, color: color, width: 36, height: 36, mt: 0.25 }}>
        {React.cloneElement(icon, { sx: { fontSize: 18 } } as any)}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
            {title}
          </Typography>
          {chipLabel ? (
            <Chip 
              label={chipLabel} 
              size="small" 
              sx={{ bgcolor: `${color}15`, color: color, fontWeight: 700, borderRadius: 1.5, height: 18, fontSize: '0.62rem', '& .MuiChip-label': { px: 0.5 } }} 
            />
          ) : trend !== undefined ? (
            <Chip 
              icon={trendUp ? <TrendingUpIcon style={{ fontSize: 11, color: 'inherit' }} /> : <TrendingDownIcon style={{ fontSize: 11, color: 'inherit' }} />} 
              label={`${Math.abs(Number(trend))}%`} 
              size="small" 
              sx={{ bgcolor: trendUp ? '#e6f4ea' : '#fce8e6', color: trendUp ? '#137333' : '#c5221f', fontWeight: 700, borderRadius: 1.5, height: 18, fontSize: '0.65rem', '& .MuiChip-icon': { ml: 0.25 }, '& .MuiChip-label': { px: 0.5 }}} 
            />
          ) : null}
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 0.25 }}>{value}</Typography>

        {progressSegments.length > 0 && (
          <Box sx={{ width: '100%', height: 7, bgcolor: '#f1f5f9', borderRadius: 4, overflow: 'hidden', display: 'flex', mt: 0.75 }}>
            {progressSegments.map((seg, i) => (
              <Box 
                key={i} 
                sx={{ 
                  width: `${Math.max(0, Math.min(100, seg.value))}%`, 
                  bgcolor: seg.color, 
                  transition: 'width 0.4s ease' 
                }} 
              />
            ))}
          </Box>
        )}

        {progressLegends.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.75, flexWrap: 'wrap', gap: 0.5 }}>
            {progressLegends.map((leg, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: leg.color, flexShrink: 0 }} />
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 700 }}>
                  {leg.count !== undefined ? `${leg.count} ` : ''}{leg.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
          {action ? action : <Box />}
          {clickableHint && (
            <Typography variant="caption" sx={{ color: color, fontWeight: 700, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 0.25 }}>
              {clickableHint} <ArrowForwardIcon sx={{ fontSize: 10 }} />
            </Typography>
          )}
        </Box>
      </Box>
    </Card>
  );
});

KpiCard.displayName = 'KpiCard';

interface DashboardUiState {
  isRefreshing: boolean;
  agentRegistrationsModalOpen: boolean;
  recentAlert: {
    shopName?: string;
    userName?: string;
    agentName?: string | null;
    stage?: string;
    shopId: string;
    time: Date;
  } | null;
}

type DashboardUiAction =
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_AGENT_MODAL'; payload: boolean }
  | { type: 'SET_ALERT'; payload: DashboardUiState['recentAlert'] }
  | { type: 'CLEAR_ALERT' };

const initialDashboardUiState: DashboardUiState = {
  isRefreshing: false,
  agentRegistrationsModalOpen: false,
  recentAlert: null
};

function dashboardUiReducer(state: DashboardUiState, action: DashboardUiAction): DashboardUiState {
  switch (action.type) {
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.payload };
    case 'SET_AGENT_MODAL':
      return { ...state, agentRegistrationsModalOpen: action.payload };
    case 'SET_ALERT':
      return { ...state, recentAlert: action.payload };
    case 'CLEAR_ALERT':
      return { ...state, recentAlert: null };
    default:
      return state;
  }
}

interface ExpiryKpiCardProps {
  title: string;
  count: number;
  subtitle: string;
  color: string;
  onClick: () => void;
  loading?: boolean;
}

const ExpiryKpiCard = React.memo(({
  title,
  count,
  subtitle,
  color,
  onClick,
  loading
}: ExpiryKpiCardProps) => {
  if (loading) return <Skeleton variant="rounded" height={145} sx={{ borderRadius: 3 }} />;

  return (
    <Card
      onClick={onClick}
      sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 8px rgba(31,43,39,0.06)', border: '1px solid', borderColor: `${color}30`, cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${color}20`, borderColor: color }}}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', bgcolor: color }} />
      <Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', pl: 0.5 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.25, pl: 0.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: color, lineHeight: 1.1 }}>
            {count}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {count === 1 ? 'shop' : 'shops'}
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', display: 'block', mt: 0.5, pl: 0.5 }}>
          {subtitle}
        </Typography>
      </Box>

      <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px solid', borderColor: '#f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 0.5 }}>
        <Typography variant="caption" sx={{ color: color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          View in Table <ArrowForwardIcon sx={{ fontSize: 11 }} />
        </Typography>
        {count > 0 && (
          <Chip 
            label="View" 
            size="small" 
            sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700, bgcolor: `${color}10`, color: color }} 
          />
        )}
      </Box>
    </Card>
  );
});

ExpiryKpiCard.displayName = 'ExpiryKpiCard';

export default function SuperadminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { 
    dashboardData: stats, 
    dashboardLoading: loading, 
    businesses, 
    plans, 
    agents 
  } = useAppSelector((state) => state.superadmin);
  const theme = useTheme();

  const [uiState, uiDispatch] = useReducer(dashboardUiReducer, initialDashboardUiState);
  const knownBusinessIdsRef = useRef<Set<string> | null>(null);
  const isPollingRef = useRef(false);
  const alertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quickRefresh = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    try {
      await Promise.all([
        dispatch(fetchBusinesses()).unwrap(),
        dispatch(fetchSuperadminDashboard()).unwrap()
      ]);
    } catch {
    } finally {
      isPollingRef.current = false;
    }
  }, [dispatch]);

  const refreshAllSilently = useCallback(async (manual = false) => {
    if (manual) uiDispatch({ type: 'SET_REFRESHING', payload: true });
    try {
      await Promise.all([
        dispatch(fetchSuperadminDashboard()).unwrap(),
        dispatch(fetchBusinesses()).unwrap(),
        dispatch(fetchPlans()).unwrap(),
        dispatch(fetchAgents()).unwrap()
      ]);
    } catch {
    } finally {
      if (manual) uiDispatch({ type: 'SET_REFRESHING', payload: false });
    }
  }, [dispatch]);

  useEffect(() => {
    refreshAllSilently();

    const interval = setInterval(() => {
      if (!document.hidden) {
        quickRefresh();
      }
    }, 3000);

    const fullInterval = setInterval(() => {
      if (!document.hidden) {
        refreshAllSilently(false);
      }
    }, 30000);

    const handleFocus = () => {
      if (!document.hidden) {
        quickRefresh();
      }
    };
    window.addEventListener('focus', handleFocus);

    let broadcastChannel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('slotify_registrations');
      broadcastChannel.onmessage = (e) => {
        if (e.data?.type === 'SHOP_REGISTERED') {
          quickRefresh();
        }
      };
    }

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === 'slotify_last_registration') {
        quickRefresh();
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      clearInterval(interval);
      clearInterval(fullInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorageEvent);
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [refreshAllSilently, quickRefresh]);

  useEffect(() => {
    if (!businesses || businesses.length === 0) return;

    if (knownBusinessIdsRef.current === null) {
      knownBusinessIdsRef.current = new Set(businesses.map((b: any) => String(b._id || b.id)));
      return;
    }

    const newShops = businesses.filter((b: any) => !b.isDemoAccount && !knownBusinessIdsRef.current!.has(String(b._id || b.id)));
    if (newShops.length > 0) {
      newShops.forEach((b: any) => knownBusinessIdsRef.current!.add(String(b._id || b.id)));
      playNotificationSound();

      const newest = newShops[0];
      const agentName = getAgentName(newest.registeredByAgentId || newest.assignedAgentId);
      const registeredUserName = (newest.ownerName && newest.ownerName.trim()) 
        || (newest.name && newest.name.trim()) 
        || (newest.businessName && newest.businessName.trim()) 
        || 'New User';

      const alertMsg = agentName 
        ? `New Registration: Agent ${agentName} registered user "${registeredUserName}"!`
        : `New Registration: User "${registeredUserName}" registered via public portal!`;

      dispatch(showNotification({ message: alertMsg, failure: false }));
      uiDispatch({
        type: 'SET_ALERT',
        payload: {
          userName: registeredUserName,
          shopName: registeredUserName,
          agentName,
          stage: newest.demoStatus || 'Demo Provisioning',
          shopId: newest._id || newest.id,
          time: new Date()
        }
      });
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
      alertTimeoutRef.current = setTimeout(() => {
        uiDispatch({ type: 'CLEAR_ALERT' });
      }, 3000);
    }
  }, [businesses, agents, dispatch]);

  const realBusinesses = useMemo(() => {
    return businesses.filter((b: any) => !b.isDemoAccount);
  }, [businesses]);

  const agentRegisteredBusinesses = useMemo(() => {
    return realBusinesses.filter((b: any) => !!b.registeredByAgentId || !!b.assignedAgentId);
  }, [realBusinesses]);

  const agentTotalCount = stats?.agentRegisteredStats?.total ?? agentRegisteredBusinesses.length;
  const agentPendingCount = stats?.agentRegisteredStats?.pending ?? agentRegisteredBusinesses.filter((b: any) => b.verificationStatus !== 'Approved' && b.verificationStatus !== 'Rejected').length;
  const agentApprovedCount = stats?.agentRegisteredStats?.approved ?? agentRegisteredBusinesses.filter((b: any) => b.verificationStatus === 'Approved').length;

  const agentApprovedPct = agentTotalCount > 0 ? ((agentApprovedCount / agentTotalCount) * 100).toFixed(1) : '0';
  const agentPipelinePct = agentTotalCount > 0 ? ((agentPendingCount / agentTotalCount) * 100).toFixed(1) : '0';

  const demoTotalCount = stats?.demoRequestStats?.total ?? stats?.pendingDemoRequests ?? 0;
  const demoPendingCount = stats?.demoRequestStats?.pending ?? stats?.pendingDemoRequests ?? 0;
  const demoApprovedCount = stats?.demoRequestStats?.approved ?? 0;
  const demoRejectedCount = stats?.demoRequestStats?.rejected ?? 0;

  const demoPendingPct = demoTotalCount > 0 ? ((demoPendingCount / demoTotalCount) * 100).toFixed(1) : '0';
  const demoApprovedPct = demoTotalCount > 0 ? ((demoApprovedCount / demoTotalCount) * 100).toFixed(1) : '0';
  const demoRejectedPct = demoTotalCount > 0 ? ((demoRejectedCount / demoTotalCount) * 100).toFixed(1) : '0';

  const demoSegments = useMemo(() => {
    if (!demoTotalCount) return [];
    const segments = [
      { value: Number(demoPendingPct), color: '#e11d48' },
      { value: Number(demoApprovedPct), color: '#10b981' }
    ];
    if (demoRejectedCount > 0) {
      segments.push({ value: Number(demoRejectedPct), color: '#94a3b8' });
    }
    return segments;
  }, [demoTotalCount, demoPendingPct, demoApprovedPct, demoRejectedPct, demoRejectedCount]);

  const demoLegends = useMemo(() => {
    const list = [
      { count: demoPendingCount, label: 'Pending', color: '#e11d48' },
      { count: demoApprovedCount, label: 'Approved', color: '#10b981' }
    ];
    if (demoRejectedCount > 0) {
      list.push({ count: demoRejectedCount, label: 'Closed', color: '#94a3b8' });
    }
    return list;
  }, [demoPendingCount, demoApprovedCount, demoRejectedCount]);

  const approvedBusinesses = useMemo(() => {
    return realBusinesses.filter((b: any) => b.verificationStatus === 'Approved');
  }, [realBusinesses]);

  const pendingOnboardingBusinesses = useMemo(() => {
    return realBusinesses.filter((b: any) => b.verificationStatus === 'Pending' || b.verificationStatus === 'ChangesRequested');
  }, [realBusinesses]);

  const rejectedBusinesses = useMemo(() => {
    return realBusinesses.filter((b: any) => b.verificationStatus === 'Rejected');
  }, [realBusinesses]);

  const totalAppsCount = realBusinesses.length || stats?.totalBusinesses || 0;
  const approvedCount = approvedBusinesses.length || stats?.registeredShops || 0;
  const inPipelineCount = pendingOnboardingBusinesses.length || stats?.pendingShops || 0;
  const rejectedCount = rejectedBusinesses.length || stats?.rejectedShops || 0;

  const approvedPct = totalAppsCount > 0 ? ((approvedCount / totalAppsCount) * 100).toFixed(1) : '0';
  const inPipelinePct = totalAppsCount > 0 ? ((inPipelineCount / totalAppsCount) * 100).toFixed(1) : '0';
  const rejectedPct = totalAppsCount > 0 ? ((rejectedCount / totalAppsCount) * 100).toFixed(1) : '0';

  const onboardedShops = (stats?.registeredShops || 0) - (stats?.activeTrials || 0);

  const getDaysRemaining = (shop: any, activePlan: any) => {
    if (shop.subscriptionEnd) return Math.ceil((new Date(shop.subscriptionEnd).getTime() - Date.now()) / (1000 * 3600 * 24));
    if (shop.planEndDate) return Math.ceil((new Date(shop.planEndDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    if (shop.paymentBreakdown?.endDate) return Math.ceil((new Date(shop.paymentBreakdown.endDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    if (shop.trialStatus === 'Active' && shop.trialEndsAt) {
      return Math.ceil((new Date(shop.trialEndsAt).getTime() - Date.now()) / (1000 * 3600 * 24));
    }
    if (activePlan) {
      const variant = activePlan.variants?.find((v: any) => v._id === shop.planVariantId || v._id === shop.paymentBreakdown?.planVariantId)
        || (activePlan.variants && activePlan.variants.length > 0 ? activePlan.variants[0] : null);
      if (variant?.billingCycle === 'one-time' || (activePlan as any).isPermanent) return null;
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
      return Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
    }
    return null;
  };

  const getExpiryDate = (shop: any, activePlan: any): Date | null => {
    if (shop.subscriptionEnd) return new Date(shop.subscriptionEnd);
    if (shop.planEndDate) return new Date(shop.planEndDate);
    if (shop.paymentBreakdown?.endDate) return new Date(shop.paymentBreakdown.endDate);
    if (shop.trialStatus === 'Active' && shop.trialEndsAt) return new Date(shop.trialEndsAt);
    if (activePlan) {
      const variant = activePlan.variants?.find((v: any) => v._id === shop.planVariantId || v._id === shop.paymentBreakdown?.planVariantId)
        || (activePlan.variants && activePlan.variants.length > 0 ? activePlan.variants[0] : null);
      if (variant?.billingCycle === 'one-time' || (activePlan as any).isPermanent) return null;
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
      return new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);
    }
    return null;
  };

  const expiryTracking = useMemo(() => {
    const expiring1Day: any[] = [];
    const expiring3Days: any[] = [];
    const expiring5Days: any[] = [];
    const expiredShops: any[] = [];
    const allNearExpiry: any[] = [];

    approvedBusinesses.forEach((b: any) => {
      const activePlan = plans.find((p: any) => p._id === b.planId || p._id === b.paymentBreakdown?.planId || p._id === b.requestedPlanId);
      const days = getDaysRemaining(b, activePlan);
      const expiryDate = getExpiryDate(b, activePlan);
      const enriched = {
        ...b,
        computedDaysRemaining: days,
        computedExpiryDate: expiryDate,
        computedPlanName: activePlan?.name || b.paymentBreakdown?.planName || 'Standard Plan'
      };

      if ((days !== null && days <= 0) || b.subscriptionStatus === 'expired') {
        expiredShops.push(enriched);
      } else if (days !== null && days > 0) {
        if (days <= 1) expiring1Day.push(enriched);
        if (days <= 3) expiring3Days.push(enriched);
        if (days <= 5) expiring5Days.push(enriched);
        if (days <= 7) allNearExpiry.push(enriched);
      }
    });

    return {
      expiring1Day,
      expiring3Days,
      expiring5Days,
      expiredShops,
      allNearExpiry
    };
  }, [approvedBusinesses, plans]);


  
  const pendingUpgradeRequests = approvedBusinesses.filter((b: any) => b.requestedPlanId);

  const exportToCSV = () => {
    const data = stats?.recentPayments || [];
    if (!data.length) return;
    const headers = ['Shop Name', 'Amount', 'Status', 'Coupon Code', 'Date', 'Invoice Link'];
    const rows = data.map((p: any) => [
      p.businessId?.name || '-',
      p.amount?.toFixed(2) || '0.00',
      p.status,
      p.paymentBreakdown?.couponCodes?.length ? p.paymentBreakdown.couponCodes.join(' ') : 'None',
      new Date(p.createdAt).toLocaleDateString(),
      `${window.location.origin}/pay/${p._id}`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n' 
      + rows.map((e: any[]) => e.map(item => `"${item}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "recent_transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAgentName = useCallback((agentOrId: any) => {
    if (!agentOrId) return null;
    if (typeof agentOrId === 'object' && agentOrId.name) return agentOrId.name;
    if (!agents?.length) return null;
    const agent = agents.find((a: any) => a._id === agentOrId || a.id === agentOrId);
    return agent ? agent.name : null;
  }, [agents]);

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Superadmin Dashboard
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Real-time platform metrics, revenue tracking, and shop onboarding pipeline
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => refreshAllSilently(true)}
            disabled={uiState.isRefreshing}
            startIcon={<RefreshIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, py: 0.35, px: 1.5, fontSize: '0.75rem', borderColor: 'divider', color: 'text.secondary' }}
          >
            {uiState.isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {uiState.recentAlert && (
        <Card sx={{ mb: 2.5, p: 2, borderRadius: 3, background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)', border: '1px solid #c4b5fd', boxShadow: '0 4px 14px rgba(124, 58, 237, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#7c3aed', color: '#fff', width: 40, height: 40 }}>
              <NotificationsActiveIcon />
            </Avatar>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#5b21b6' }}>
                  Live Registration Alert
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: '#4c1d95', mt: 0.25, fontWeight: 500 }}>
                {uiState.recentAlert.agentName ? (
                  <>Agent <strong>{uiState.recentAlert.agentName}</strong> registered user <strong>&ldquo;{uiState.recentAlert.userName || uiState.recentAlert.shopName}&rdquo;</strong></>
                ) : (
                  <>New user <strong>&ldquo;{uiState.recentAlert.userName || uiState.recentAlert.shopName}&rdquo;</strong> was registered via public portal</>
                )}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                const shopId = uiState.recentAlert?.shopId;
                uiDispatch({ type: 'CLEAR_ALERT' });
                if (shopId) navigate(`/superadmin/registration?biz=${shopId}`);
              }}
              sx={{ bgcolor: '#7c3aed', color: '#fff', fontWeight: 700, textTransform: 'none', borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: '#6d28d9' }}}
            >
              Open Onboarding
            </Button>
            <IconButton size="small" onClick={() => uiDispatch({ type: 'CLEAR_ALERT' })} sx={{ color: '#6d28d9' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Card>
      )}

      {(() => {
        const grossRev = stats?.grossCollections || 0;
        const netRev = stats?.totalRevenue || 0;
        const gstRev = Math.max(0, grossRev - netRev);
        const netRevPct = grossRev > 0 ? Number(((netRev / grossRev) * 100).toFixed(1)) : 100;
        const gstRevPct = grossRev > 0 ? Number(((gstRev / grossRev) * 100).toFixed(1)) : 0;

        const totalPay = stats?.paymentStats?.total || (stats?.recentPayments?.length || 0);
        const successPay = stats?.paymentStats?.success || (stats?.recentPayments?.filter((p: any) => p.status === 'Success').length || 0);
        const pendingPay = Math.max(0, totalPay - successPay);
        const successPayPct = totalPay > 0 ? Number(((successPay / totalPay) * 100).toFixed(1)) : 100;
        const pendingPayPct = totalPay > 0 ? Number(((pendingPay / totalPay) * 100).toFixed(1)) : 0;

        const apptConfirmed = stats?.appointmentStats?.confirmed ?? 0;
        const apptCompleted = stats?.appointmentStats?.completed ?? 0;
        const apptPending = stats?.appointmentStats?.pending ?? 0;
        const apptCancelled = stats?.appointmentStats?.cancelled ?? 0;
        const apptTotal = stats?.totalAppointments || (apptConfirmed + apptCompleted + apptPending + apptCancelled) || 0;
        const apptConfirmedPct = apptTotal > 0 ? Number(((apptConfirmed / apptTotal) * 100).toFixed(1)) : 0;
        const apptCompletedPct = apptTotal > 0 ? Number(((apptCompleted / apptTotal) * 100).toFixed(1)) : 0;
        const apptPendingPct = apptTotal > 0 ? Number(((apptPending / apptTotal) * 100).toFixed(1)) : 0;
        const apptCancelledPct = apptTotal > 0 ? Number(((apptCancelled / apptTotal) * 100).toFixed(1)) : 0;

        return (
          <Grid container spacing={2} sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard 
                loading={loading && !stats}
                title="Net Revenue" 
                value={stats?.totalRevenue !== undefined ? `\u20B9 ${stats.totalRevenue.toFixed(2)}` : '\u20B9 0.00'} 
                icon={<AccountBalanceWalletIcon />} 
                color="#16a34a"
                trend={stats?.revenueTrend ? Math.abs(stats.revenueTrend).toFixed(1) : 0}
                trendUp={stats?.revenueTrend >= 0}
                action={<Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>excludes GST</Typography>}
                progressSegments={[
                  { value: netRevPct, color: '#16a34a' },
                  { value: gstRevPct, color: '#94a3b8' }
                ]}
                progressLegends={[
                  { label: `${netRevPct}% Net`, color: '#16a34a' },
                  { label: `${gstRevPct}% GST`, color: '#94a3b8' }
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard 
                loading={loading && !stats}
                title="Gross Collections" 
                value={stats?.grossCollections !== undefined ? `\u20B9 ${stats.grossCollections.toFixed(2)}` : '\u20B9 0.00'} 
                icon={<CreditCardIcon />} 
                color="#0284c7"
                chipLabel="Collections"
                action={<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>includes GST</Typography>}
                progressSegments={[
                  { value: successPayPct, color: '#0284c7' },
                  { value: pendingPayPct, color: '#f59e0b' }
                ]}
                progressLegends={[
                  { count: successPay, label: `Paid (${successPayPct}%)`, color: '#0284c7' },
                  ...(pendingPay > 0 ? [{ count: pendingPay, label: 'Pending', color: '#f59e0b' }] : [{ label: '100% Settled', color: '#0284c7' }])
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard 
                loading={loading && !stats}
                title="Total Appointments" 
                value={apptTotal.toLocaleString()} 
                icon={<EventIcon />} 
                color="#659287"
                onClick={() => navigate('/superadmin/appointments')}
                clickableHint="Open page"
                chipLabel="Bookings"
                progressSegments={[
                  { value: apptConfirmedPct, color: '#16a34a' },
                  { value: apptCompletedPct, color: '#0284c7' },
                  { value: apptPendingPct, color: '#f59e0b' },
                  { value: apptCancelledPct, color: '#ef4444' }
                ]}
                progressLegends={[
                  { count: apptConfirmed, label: 'Confirmed', color: '#16a34a' },
                  { count: apptCompleted, label: 'Done', color: '#0284c7' },
                  { count: apptPending, label: 'Pending', color: '#f59e0b' }
                ]}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard 
                loading={loading && !stats}
                title="Registered Applications" 
                value={totalAppsCount.toLocaleString()} 
                icon={<VerifiedIcon />} 
                color="#4caf50"
                onClick={() => navigate('/superadmin/registered-shops')}
                clickableHint="Open page"
                chipLabel="All Statuses"
                progressSegments={[
                  { value: Number(approvedPct), color: '#16a34a' },
                  { value: Number(inPipelinePct), color: '#f59e0b' },
                  { value: Number(rejectedPct), color: '#ef4444' }
                ]}
                progressLegends={[
                  { count: approvedCount, label: 'Approved', color: '#16a34a' },
                  { count: inPipelineCount, label: 'Pipeline', color: '#f59e0b' },
                  ...(rejectedCount > 0 ? [{ count: rejectedCount, label: 'Rejected', color: '#ef4444' }] : [])
                ]}
              />
            </Grid>
          </Grid>
        );
      })()}

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <HourglassEmptyIcon sx={{ color: '#0284c7', fontSize: 20 }} />
              Onboarding Pipeline Stages
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              onClick={() => navigate('/superadmin/onboarding-stages?stage=demoProvisioning')}
              sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 8px rgba(31,43,39,0.06)', border: '1px solid', borderColor: '#0284c725', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(2,132,199,0.15)', borderColor: '#0284c7' }}}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                Demo Provisioning
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0284c7' }}>
                  {stats?.onboardingStages?.demoProvisioning ?? pendingOnboardingBusinesses.filter((b: any) => !b.demoStatus || b.demoStatus === 'None').length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  shops pending sandbox
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                Generate sandbox & schedule Meet
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Inspect Stage <ArrowForwardIcon sx={{ fontSize: 11 }} />
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              onClick={() => navigate('/superadmin/onboarding-stages?stage=demoConducted')}
              sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 8px rgba(31,43,39,0.06)', border: '1px solid', borderColor: '#8b5cf625', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(139,92,246,0.15)', borderColor: '#8b5cf6' }}}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                Demo Conducted
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#8b5cf6' }}>
                  {stats?.onboardingStages?.demoConducted ?? pendingOnboardingBusinesses.filter((b: any) => b.demoStatus === 'Provided').length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  awaiting call completion
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                Sandbox ready, call pending
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" sx={{ color: '#8b5cf6', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Inspect Stage <ArrowForwardIcon sx={{ fontSize: 11 }} />
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              onClick={() => navigate('/superadmin/onboarding-stages?stage=planSelection')}
              sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 8px rgba(31,43,39,0.06)', border: '1px solid', borderColor: '#f59e0b25', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(245,158,11,0.15)', borderColor: '#f59e0b' }}}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                Plan Selection
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#f59e0b' }}>
                  {stats?.onboardingStages?.planSelection ?? pendingOnboardingBusinesses.filter((b: any) => b.demoStatus === 'Conducted' && !b.planId && b.paymentStatus !== 'Paid').length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  awaiting plan & payment
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                Demo completed, assign plan
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" sx={{ color: '#f59e0b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Inspect Stage <ArrowForwardIcon sx={{ fontSize: 11 }} />
              </Typography>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              onClick={() => navigate('/superadmin/onboarding-stages?stage=verificationDecision')}
              sx={{ p: 2, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 8px rgba(31,43,39,0.06)', border: '1px solid', borderColor: '#10b98125', cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(16,185,129,0.15)', borderColor: '#10b981' }}}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block' }}>
                Verification & Decision
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
                  {stats?.onboardingStages?.verificationDecision ?? pendingOnboardingBusinesses.filter((b: any) => b.demoStatus === 'Conducted' && (!!b.planId || b.paymentStatus === 'Paid')).length}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  ready for approval
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                Review docs, activate trial/approve
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                Inspect Stage <ArrowForwardIcon sx={{ fontSize: 11 }} />
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ color: '#ea580c', fontSize: 20 }} />
              Near Expiry & Renewal Tracking
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ExpiryKpiCard
              loading={loading && !stats}
              title="1-Day Expiry"
              count={expiryTracking.expiring1Day.length}
              subtitle="Expiring today or within 24 hours"
              color="#dc2626"
              onClick={() => navigate('/superadmin/expired-shops?range=1day')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ExpiryKpiCard
              loading={loading && !stats}
              title="3-Day Expiry"
              count={expiryTracking.expiring3Days.length}
              subtitle="Expiring within the next 72 hours"
              color="#ea580c"
              onClick={() => navigate('/superadmin/expired-shops?range=3days')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ExpiryKpiCard
              loading={loading && !stats}
              title="5-Day Expiry"
              count={expiryTracking.expiring5Days.length}
              subtitle="Expiring within 5 calendar days"
              color="#d97706"
              onClick={() => navigate('/superadmin/expired-shops?range=5days')}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <ExpiryKpiCard
              loading={loading && !stats}
              title="Expired Shops"
              count={expiryTracking.expiredShops.length}
              subtitle="Plan expired, allocation needed"
              color="#991b1b"
              onClick={() => navigate('/superadmin/expired-shops?range=expired')}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading && !stats}
            title="Pending Verification" 
            value={stats?.pendingShops?.toLocaleString() || 0} 
            icon={<HourglassEmptyIcon />} 
            color="#ff9800"
            chipLabel="Review"
            onClick={() => navigate('/superadmin/registration')}
            clickableHint="Open Queue"
            progressSegments={[
              { value: Number(inPipelinePct), color: '#ff9800' }
            ]}
            progressLegends={[
              { count: inPipelineCount, label: 'Applications', color: '#ff9800' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading && !stats}
            title="Agent Registrations" 
            value={agentTotalCount.toLocaleString()} 
            icon={<BadgeIcon />} 
            color="#7c3aed"
            onClick={() => uiDispatch({ type: 'SET_AGENT_MODAL', payload: true })}
            clickableHint="View Agent Shops"
            chipLabel="Agent Channel"
            progressSegments={[
              { value: Number(agentApprovedPct), color: '#16a34a' },
              { value: Number(agentPipelinePct), color: '#7c3aed' }
            ]}
            progressLegends={[
              { count: agentApprovedCount, label: 'Approved', color: '#16a34a' },
              { count: agentPendingCount, label: 'Pipeline', color: '#7c3aed' }
            ]}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading && !stats}
            title="Demo Requests" 
            value={demoTotalCount.toLocaleString()} 
            icon={<CoPresentIcon />} 
            color="#e11d48"
            chipLabel={demoPendingCount > 0 ? `${demoPendingCount} Pending` : 'All Handled'}
            onClick={() => navigate('/superadmin/demo-requests')}
            clickableHint="Review Leads"
            progressSegments={demoSegments}
            progressLegends={demoLegends}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading && !stats}
            title="All Near Expiry" 
            value={expiryTracking.allNearExpiry.length} 
            icon={<HourglassEmptyIcon />} 
            color="#f59e0b"
            chipLabel="Within 7d"
            onClick={() => navigate('/superadmin/expired-shops?range=all_near')}
            clickableHint="View Table"
            progressSegments={[
              { value: expiryTracking.expiring1Day.length ? (expiryTracking.expiring1Day.length / (expiryTracking.allNearExpiry.length || 1)) * 100 : 0, color: '#dc2626' },
              { value: expiryTracking.expiring3Days.length ? (expiryTracking.expiring3Days.length / (expiryTracking.allNearExpiry.length || 1)) * 100 : 0, color: '#ea580c' },
              { value: expiryTracking.expiring5Days.length ? (expiryTracking.expiring5Days.length / (expiryTracking.allNearExpiry.length || 1)) * 100 : 0, color: '#d97706' }
            ]}
            progressLegends={[
              { count: expiryTracking.expiring1Day.length, label: '1d', color: '#dc2626' },
              { count: expiryTracking.expiring3Days.length, label: '3d', color: '#ea580c' },
              { count: expiryTracking.expiring5Days.length, label: '5d', color: '#d97706' }
            ]}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>30-Day Appointment Trend</Typography>} 
              sx={{ pb: 0 }}
            />
            <CardContent>
              {loading && !stats?.trendData ? (
                <Skeleton variant="rounded" height={260} />
              ) : (
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={stats?.trendData || []} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13 }}
                        itemStyle={{ color: '#659287', fontWeight: 600 }}
                      />
                      <Line type="monotone" dataKey="count" name="Appointments" stroke="#659287" strokeWidth={3} dot={{ r: 3, fill: '#659287', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recent Activity</Typography>} 
              sx={{ pb: 0 }}
            />
            <CardContent sx={{ pt: 1, height: 275, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '4px' } }}>
              {loading && !stats?.recentActivity ? (
                <Skeleton variant="rounded" height={260} />
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <List disablePadding>
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: activity.type === 'payment' ? '#dcfce7' : (activity.type === 'agent_registration' ? '#f3e8ff' : (activity.type === 'business' ? '#e3f2fd' : '#f1f5f9')), 
                            color: activity.type === 'payment' ? '#166534' : (activity.type === 'agent_registration' ? '#7c3aed' : (activity.type === 'business' ? '#1976d2' : '#475569')) 
                          }}>
                            {activity.type === 'payment' ? <CreditCardIcon sx={{ fontSize: 16 }} /> : (activity.type === 'agent_registration' ? <BadgeIcon sx={{ fontSize: 16 }} /> : (activity.type === 'business' ? <StoreIcon sx={{ fontSize: 16 }} /> : <PeopleIcon sx={{ fontSize: 16 }} />))}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>{activity.message}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>{formatIST(activity.date)}</Typography>}
                        />
                      </ListItem>
                      {index < stats.recentActivity.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No recent activity.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Appointment Types</Typography>} 
              sx={{ pb: 0 }}
            />
            <CardContent>
              {loading && !stats?.typeData ? (
                <Skeleton variant="rounded" height={260} />
              ) : (
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={stats?.typeData || []}
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(stats?.typeData || []).map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongIcon sx={{ color: 'primary.main' }} /> Recent Transactions
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={exportToCSV}
                  startIcon={<FileDownloadIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.secondary', borderColor: 'divider' }}
                >
                  Export CSV
                </Button>
                <Button 
                  variant="contained" 
                  size="small"
                  onClick={() => navigate('/superadmin/payments')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, boxShadow: 'none' }}
                >
                  View All
                </Button>
              </Box>
            </Box>
            
            {loading && !stats?.recentPayments ? (
              <Box sx={{ p: 3 }}><Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} /></Box>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Shop Name</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Coupon Code</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Invoice Link</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(stats?.recentPayments || []).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>No recent payments found.</TableCell>
                      </TableRow>
                    ) : (
                      stats.recentPayments.map((p: any) => (
                        <TableRow key={p._id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{p.customerSnapshot?.name || p.businessId?.name || 'Unknown Shop'}</TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#16a34a' }}>₹{p.amount?.toFixed(2)}</TableCell>
                          <TableCell>
                            <Chip size="small" label={p.status} color={p.status === 'Success' ? 'success' : p.status === 'Pending' ? 'warning' : 'error'} sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700 }} />
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                            {p.paymentBreakdown?.couponCodes?.length ? p.paymentBreakdown.couponCodes.join(', ') : 'None'}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button size="small" startIcon={<LinkIcon />} sx={{ textTransform: 'none', minWidth: 0, px: 1 }} href={`/pay/${p._id}`} target="_blank">
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Platform Overview</Typography>
            {loading && !stats ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Total Applications', value: totalAppsCount, color: '#659287' },
                  { label: 'Onboarded & Active Shops', value: onboardedShops, color: '#4caf50' },
                  { label: 'Active Trials', value: stats?.activeTrials || 0, color: '#9c27b0' },
                  { label: 'In Onboarding Pipeline', value: inPipelineCount, color: '#ff9800' },
                  { label: 'Rejected Applications', value: rejectedCount, color: '#ef4444' },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Quick Actions</Typography>
            <Grid container spacing={1.5}>
              {[
                { label: 'Registered Applications', desc: 'Directory of all shop applications', path: '/superadmin/registered-shops', color: '#16a34a', icon: <VerifiedIcon /> },
                { label: 'Platform Appointments', desc: 'View all shop booking records', path: '/superadmin/appointments', color: '#0284c7', icon: <EventIcon /> },
                { label: 'Manage Registrations', desc: 'Review & approve pending shops', path: '/superadmin/registration', color: '#ff9800', icon: <HourglassEmptyIcon /> },
                { label: 'Demo Requests', desc: 'Provision sandboxes for leads', path: '/superadmin/demo-requests', color: '#e91e63', icon: <StoreIcon /> },
                { label: 'Manage Plans', desc: 'Create & update pricing plans', path: '/superadmin/plans', color: '#2196f3', icon: <ScienceIcon /> },
              ].map((item) => (
                <Grid size={{ xs: 6, sm: 2.4 }} key={item.label}>
                  <Card 
                    onClick={() => navigate(item.path)}
                    sx={{ 
                      p: 1.5, borderRadius: 2, cursor: 'pointer', textAlign: 'center',
                      border: '1px solid', borderColor: 'divider',
                      boxShadow: 'none',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: item.color, boxShadow: `0 2px 8px ${item.color}20`, transform: 'translateY(-2px)' }
                    }}
                  >
                    <Avatar sx={{ bgcolor: `${item.color}15`, color: item.color, width: 36, height: 36, mx: 'auto', mb: 1 }}>
                      {React.cloneElement(item.icon, { sx: { fontSize: 18 } })}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.2, display: 'block', mt: 0.25 }}>{item.desc}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Grid>
      </Grid>

      {pendingUpgradeRequests.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: 'warning.main', display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon fontSize="small" /> Pending Upgrade / Renewal Requests
            </Typography>
            <Grid container spacing={2}>
              {pendingUpgradeRequests.map((shop: any) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={shop._id}>
                  <Card variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>{shop.name}</Typography>
                      <Typography variant="body2" color="text.secondary">Requested Plan Change</Typography>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="warning" 
                      size="small" 
                      disableElevation
                      onClick={() => navigate(`/superadmin/allocate-plan/${shop._id}`)}
                      sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
                    >
                      Process Request
                    </Button>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
        </Box>
      )}

      <Dialog
        open={uiState.agentRegistrationsModalOpen}
        onClose={() => uiDispatch({ type: 'SET_AGENT_MODAL', payload: false })}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#7c3aed18', color: '#7c3aed', width: 38, height: 38 }}>
              <BadgeIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                Agent-Registered Shops & Activity
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All business shops registered and onboarded through field agents
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => uiDispatch({ type: 'SET_AGENT_MODAL', payload: false })} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2.5, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 140, p: 1.5, borderRadius: 2, bgcolor: '#f5f3ff', border: '1px solid #ddd6fe' }}>
              <Typography variant="caption" sx={{ color: '#6d28d9', fontWeight: 700 }}>TOTAL AGENT SHOPS</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#5b21b6' }}>{agentTotalCount}</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 140, p: 1.5, borderRadius: 2, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700 }}>IN PIPELINE</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e40af' }}>{agentPendingCount}</Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 140, p: 1.5, borderRadius: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700 }}>APPROVED & ACTIVE</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534' }}>{agentApprovedCount}</Typography>
            </Box>
          </Box>

          <Box sx={{ maxHeight: 380, overflowY: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table size="small" stickyHeader>
              <TableHead sx={{ '& .MuiTableCell-head': { bgcolor: '#f1f5f9 !important', color: '#0f172a !important', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.4px',textTransform: 'uppercase',borderBottom: '1px solid #e2e8f0',py: 1.25 } }}>
                <TableRow>
                  <TableCell>Shop Name</TableCell>
                  <TableCell>Registered by Agent</TableCell>
                  <TableCell>Owner Contact</TableCell>
                  <TableCell>Current Stage / Status</TableCell>
                  <TableCell>Registered On</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {agentRegisteredBusinesses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>No agent-registered shops found.</Typography>
                      <Typography variant="caption">When agents register shops, they will appear here with live tracking.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  agentRegisteredBusinesses.map((shop: any) => {
                    const agentName = getAgentName(shop.registeredByAgentId || shop.assignedAgentId);
                    const isApproved = shop.verificationStatus === 'Approved';

                    return (
                      <TableRow key={shop._id} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                            {shop.name || shop.businessName || (shop.ownerName ? `${shop.ownerName}'s Shop` : (shop.slug ? `Shop (${shop.slug})` : 'Shop'))}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            /{shop.slug} • {shop.category || 'General'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {agentName ? (
                            <Chip 
                              icon={<BadgeIcon style={{ fontSize: 13 }} />}
                              label={agentName}
                              size="small"
                              sx={{ bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 700, fontSize: '0.72rem' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">Agent Assigned</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {shop.ownerName || '—'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {shop.ownerPhone || shop.phone || shop.ownerEmail || shop.email || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {isApproved ? (
                            <Chip label="Approved & Active" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.7rem' }} />
                          ) : (
                            <Chip 
                              label={
                                !shop.demoStatus || shop.demoStatus === 'None'
                                  ? 'Step 1: Demo Provisioning'
                                  : shop.demoStatus === 'Provided'
                                  ? 'Step 2: Demo Conducted'
                                  : !shop.planId && shop.paymentStatus !== 'Paid'
                                  ? 'Step 3: Plan Selection'
                                  : 'Step 4: Verification Review'
                              }
                              size="small"
                              sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', fontWeight: 700, fontSize: '0.7rem' }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                          {formatIST(shop.createdAt)}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              uiDispatch({ type: 'SET_AGENT_MODAL', payload: false });
                              navigate(`/superadmin/registration?biz=${shop._id}`);
                            }}
                            sx={{ bgcolor: '#7c3aed', color: 'white', fontWeight: 700, borderRadius: 1.5, textTransform: 'none', py: 0.25, fontSize: '0.75rem', boxShadow: 'none', '&:hover': { bgcolor: '#6d28d9' }}}
                          >
                            Open Onboarding
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => uiDispatch({ type: 'SET_AGENT_MODAL', payload: false })} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Close
          </Button>
          <Button 
            variant="outlined"
            onClick={() => {
              uiDispatch({ type: 'SET_AGENT_MODAL', payload: false });
              navigate('/superadmin/registered-shops?filter=agent');
            }}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            View in Registered Directory
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
}
