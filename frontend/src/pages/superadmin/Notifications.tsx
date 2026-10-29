import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Box, Card, Typography, TextField, InputAdornment, Button,
  MenuItem, IconButton, Chip, Avatar, CircularProgress, Stack, Tooltip, Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import StoreIcon from '@mui/icons-material/Store';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ScienceIcon from '@mui/icons-material/Science';
import EventIcon from '@mui/icons-material/Event';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useAppDispatch, useAppSelector } from '../../hook';
import {
  fetchSuperadminNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications
} from '../../features/superadmin/superadminSlice';
import { formatIST } from '../../utils/format';

export default function Notifications() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    notifications,
    notificationsTotal,
    unreadNotificationsCount,
    notificationsLoading: loading,
    notificationsHasMore: hasMore
  } = useAppSelector((state) => state.superadmin);

  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setPage(1);
    dispatch(fetchSuperadminNotifications({ page: 1, limit: 15, type: typeFilter, search: searchTerm }));
  }, [dispatch, typeFilter, searchTerm]);

  const loadNextPage = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      await dispatch(
        fetchSuperadminNotifications({ page: nextPage, limit: 15, type: typeFilter, search: searchTerm })
      ).unwrap();
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more notifications:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch, loadingMore, hasMore, loading, page, typeFilter, searchTerm]);

  useEffect(() => {
    if (loading) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadNextPage();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadNextPage, hasMore, loadingMore, loading]);

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    dispatch(markNotificationAsRead(id));
  };

  const handleOpenAction = (notification: any) => {
    if (!notification.read) {
      dispatch(markNotificationAsRead(notification._id));
    }
    if (notification.data?.actionUrl) {
      navigate(notification.data.actionUrl);
    }
  };

  const getTypeMeta = (type: string) => {
    switch (type) {
      case 'registration':
        return { label: 'Registration', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', icon: <StoreIcon sx={{ fontSize: 18 }} /> };
      case 'payment':
        return { label: 'Payment', color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', icon: <CreditCardIcon sx={{ fontSize: 18 }} /> };
      case 'onboarding':
        return { label: 'Onboarding', color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', icon: <ScienceIcon sx={{ fontSize: 18 }} /> };
      case 'appointment':
        return { label: 'Appointment', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: <EventIcon sx={{ fontSize: 18 }} /> };
      default:
        return { label: 'System', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: <NotificationsActiveIcon sx={{ fontSize: 18 }} /> };
    }
  };

  const getRelativeTime = (dateStr: string | Date) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatIST(dateStr);
  };

  const filterTabs = [
    { key: 'all', label: 'All Alerts' },
    { key: 'registration', label: 'Registrations' },
    { key: 'payment', label: 'Payments' },
    { key: 'onboarding', label: 'Onboarding' },
    { key: 'appointment', label: 'Appointments' }
  ];

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 1.5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/superadmin')}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', px: 0, '&:hover': { bgcolor: 'transparent', color: 'text.primary' }}}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Notifications & Activity Alerts
            </Typography>
            {unreadNotificationsCount > 0 ? (
              <Chip
                label={`${unreadNotificationsCount} Unread`}
                size="small"
                sx={{ bgcolor: '#fee2e2', color: '#b91c1c', fontWeight: 800, borderRadius: 2 }}
              />
            ) : (
              <Chip
                label="All Caught Up"
                size="small"
                sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, borderRadius: 2 }}
              />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
            Real-time push alerts, shop registrations, payment updates, and onboarding pipeline activity.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search alerts, shop, agent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 240, bgcolor: '#fff' }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }
            }}
          />

          <TextField
            select
            label="Type"
            size="small"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            sx={{ minWidth: 170, bgcolor: '#fff' }}
            slotProps={{ select: { sx: { borderRadius: 2 } } }}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="registration">Shop Registrations</MenuItem>
            <MenuItem value="payment">Payments</MenuItem>
            <MenuItem value="onboarding">Onboarding</MenuItem>
            <MenuItem value="appointment">Appointments</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={() => dispatch(markAllNotificationsAsRead())}
            disabled={unreadNotificationsCount === 0}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, borderColor: '#cbd5e1', color: '#334155', bgcolor: '#fff', '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }}}
          >
            Mark all read
          </Button>

          <Tooltip title="Clear all notifications">
            <IconButton
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all notifications?')) {
                  dispatch(clearAllNotifications());
                }
              }}
              sx={{ border: '1px solid #e2e8f0', borderRadius: 2, color: '#64748b', bgcolor: '#fff', '&:hover': { bgcolor: '#fef2f2', color: '#dc2626', borderColor: '#fca5a5' }}}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 2.5, overflowX: 'auto', pb: 0.5 }}>
        {filterTabs.map((tab) => {
          const isSelected = typeFilter === tab.key;
          return (
            <Chip
              key={tab.key}
              label={tab.label}
              onClick={() => setTypeFilter(tab.key)}
              sx={{ fontWeight: isSelected ? 800 : 600, fontSize: '0.8rem', py: 2, px: 0.5, borderRadius: 2, cursor: 'pointer', bgcolor: isSelected ? '#1e293b' : '#fff', color: isSelected ? '#fff' : '#475569', border: '1px solid', borderColor: isSelected ? '#1e293b' : '#e2e8f0', '&:hover': { bgcolor: isSelected ? '#0f172a' : '#f8fafc' }}}
            />
          );
        })}
      </Stack>

      <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        {loading && page === 1 ? (
          <Box sx={{ p: 3 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Box key={i} sx={{ display: 'flex', gap: 2, py: 2, borderBottom: '1px solid #f1f5f9' }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="30%" height={24} />
                  <Skeleton variant="text" width="60%" height={18} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <NotificationsActiveIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#334155' }}>
              No notifications found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mx: 'auto', mt: 0.5 }}>
              There are no activity alerts matching your criteria. New shop registrations and system events will appear here in real time.
            </Typography>
          </Box>
        ) : (
          <Box>
            {notifications.map((n: any, idx: number) => {
              const meta = getTypeMeta(n.type);
              const isUnread = !n.read;

              return (
                <Box
                  key={n._id || idx}
                  onClick={() => handleOpenAction(n)}
                  sx={{ p: 2.25, display: 'flex', alignItems: 'flex-start', gap: 2, cursor: n.data?.actionUrl ? 'pointer' : 'default', bgcolor: isUnread ? 'rgba(245, 243, 255, 0.45)' : '#fff', borderBottom: '1px solid #f1f5f9', transition: 'all 0.15s ease-in-out', position: 'relative', '&:hover': { bgcolor: isUnread ? 'rgba(245, 243, 255, 0.75)' : '#f8fafc'}}}
                >
                  <Box sx={{ width: 8, display: 'flex', justifyContent: 'center', pt: 1.5 }}>
                    {isUnread && (
                      <FiberManualRecordIcon sx={{ fontSize: 10, color: '#7c3aed' }} />
                    )}
                  </Box>
                  <Avatar sx={{ width: 42, height: 42, bgcolor: meta.bg, color: meta.color, border: `1px solid ${meta.border}`, flexShrink: 0 }}>
                    {meta.icon}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.25 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: isUnread ? 800 : 700, color: '#0f172a' }}>
                        {n.title}
                      </Typography>
                      <Chip
                        label={meta.label}
                        size="small"
                        sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: meta.bg, color: meta.color, border: `1px solid ${meta.border}`}}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto', fontWeight: 500, fontSize: '0.72rem' }}>
                        {getRelativeTime(n.createdAt)}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: isUnread ? '#1e293b' : '#475569', fontSize: '0.86rem', lineHeight: 1.45 }}>
                      {n.message}
                    </Typography>

                    {n.data && (n.data.shopName || n.data.agentName || n.data.amount) && (
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                        {n.data.shopName && (
                          <Chip
                            label={`Shop: ${n.data.shopName}`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#f1f5f9', color: '#334155', fontWeight: 600 }}
                          />
                        )}
                        {n.data.agentName && (
                          <Chip
                            label={`Agent: ${n.data.agentName}`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 700 }}
                          />
                        )}
                        {n.data.amount !== undefined && (
                          <Chip
                            label={`Amount: ₹${n.data.amount}`}
                            size="small"
                            sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#ecfdf5', color: '#047857', fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, pt: 0.5 }}>
                    {isUnread && (
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMarkAsRead(n._id, e)}
                          sx={{ color: '#94a3b8', '&:hover': { color: '#0284c7' } }}
                        >
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {n.data?.actionUrl && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenAction(n);
                        }}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.75rem', borderRadius: 1.5, py: 0.25, px: 1.25, borderColor: meta.border, color: meta.color, bgcolor: meta.bg, '&:hover': { bgcolor: meta.bg, borderColor: meta.color }}}
                      >
                        Action
                      </Button>
                    )}
                  </Box>
                </Box>
              );
            })}
            <Box ref={sentinelRef} sx={{ py: 3, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: '#fafafa', borderTop: '1px solid #f1f5f9' }}>
              {loadingMore ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={20} sx={{ color: 'primary.main' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Loading more notifications...
                  </Typography>
                </Box>
              ) : hasMore ? (
                <Button
                  variant="text"
                  size="small"
                  onClick={loadNextPage}
                  sx={{ textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                >
                  Load More Notifications
                </Button>
              ) : notifications.length > 0 ? (
                <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                  You have reached the end of notifications ({notificationsTotal} total)
                </Typography>
              ) : null}
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}
