import React, { useEffect, useState } from 'react';
import { Skeleton, Box, Card, Typography, Grid, Alert, IconButton, Divider, Chip, List, ListItem, ListItemText, ListItemAvatar, Button } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { format } from 'date-fns';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchBusinessDashboard } from '../../features/business/businessSlice';
import InfoTooltip from '../../components/common/InfoTooltip';

const COLORS = ['#659287', '#B1D3B9', '#88BDA4', '#4a6b62'];

const MiniChart = ({ color }: { color: string }) => {
  const totalBars = 35;
  const fillCount = (color.charCodeAt(1) * 3) % totalBars || 18;
  const bars = Array.from({ length: totalBars });
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', height: 28, mt: 3, mb: 1 }}>
      {bars.map((_, i) => (
        <Box 
          key={i} 
          sx={{ flex: 1, height: '100%', bgcolor: i < fillCount ? color : `${color}25`, borderRadius: '2px' }} 
        />
      ))}
    </Box>
  );
};

const KpiCard = ({ title, value, icon, trend = 15.2, trendUp = true, color = '#659287', loading }: any) => {
  if (loading) return <Skeleton variant="rounded" height={180} sx={{ borderRadius: 4 }} />;

  return (
    <Card sx={{ 
      p: 3, 
      borderRadius: 4, 
      bgcolor: 'white',
      color: 'text.primary',
      boxShadow: '0 2px 12px rgba(31,43,39,0.06)',
      height: '100%'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: color, mb: 2 }}>
        {React.cloneElement(icon, { fontSize: 'small' })}
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>{title}</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>{value}</Typography>
        <Chip 
          icon={trendUp ? <TrendingUpIcon style={{ fontSize: 16, color: 'inherit' }} /> : <TrendingDownIcon style={{ fontSize: 16, color: 'inherit' }} />} 
          label={`${trend}%`} 
          size="small" 
          sx={{ 
            bgcolor: trendUp ? '#e6f4ea' : '#fce8e6',
            color: trendUp ? '#137333' : '#c5221f',
            fontWeight: 700,
            borderRadius: 2,
            px: 0.5,
            '& .MuiChip-icon': { ml: 0.5 }
          }} 
        />
      </Box>
      
      <MiniChart color={color} />
      
      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
        VS last week
      </Typography>
    </Card>
  );
};

export default function BusinessDashboard() {
  const dispatch = useAppDispatch();
  const { dashboardData: stats, dashboardLoading: loading } = useAppSelector((state) => state.business);
  const [isGoogleConnected, setIsGoogleConnected] = useState(true);

  useEffect(() => {
    dispatch(fetchBusinessDashboard());
  }, [dispatch]);

  useEffect(() => {
    if (stats) {
      setIsGoogleConnected(stats.isGoogleConnected);
    }
  }, [stats]);

  const copyToClipboard = () => {
    if (!stats) return;
    const url = `${window.location.origin}/b/${stats.slug}`;
    navigator.clipboard.writeText(url);
    dispatch(showNotification({ message: 'Booking URL copied!' }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Confirmed': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {stats?.trialStatus === "Active" && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          You are on a free trial of the <b>{stats.planName}</b> plan — ends in {stats.trialDaysLeft} day(s).
        </Alert>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{fontWeight: 700}} color="primary" gutterBottom>
            Business Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your appointments and revenue at a glance
          </Typography>
        </Box>
        {stats?.slug && (
          <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 3 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
                YOUR PUBLIC BOOKING LINK
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 500, color: '#166534' }}>
                {window.location.origin}/b/{stats.slug}
              </Typography>
            </Box>
            <IconButton color="primary" onClick={copyToClipboard} size="small" title="Copy Link">
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton 
              color="primary" 
              onClick={() => window.open(`/b/${stats.slug}`, '_blank')} 
              size="small" 
              title="Open Booking Page"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </Card>
        )}
      </Box>

      {!isGoogleConnected && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
          Haven't connected Google Calendar yet? Go to <b>Settings → Connect Google Calendar</b> to start receiving online bookings.
        </Alert>
      )}

      <Grid container spacing={3} id="tour-kpi">
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Total Revenue" 
            value={`₹${stats?.revenueMonth || 0}`} 
            icon={<AttachMoneyIcon />} 
            isPrimary={true}
            trend={25.4}
            trendUp={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Appointments" 
            value={stats?.totalUpcoming || 0} 
            icon={<EventIcon />} 
            color="#2196f3"
            trend={12.5}
            trendUp={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Completed" 
            value={stats?.totalCompleted || 0} 
            icon={<CheckCircleIcon />} 
            color="#4caf50"
            trend={5.2}
            trendUp={true}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Walk-in vs Online" 
            value={stats?.totalWalkins || 0} 
            icon={<DirectionsWalkIcon />} 
            color="#ff9800"
            trend={8.1}
            trendUp={false}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ p: 3, height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{fontWeight: 700}}>Today's Schedule</Typography>
              <InfoTooltip title="Your scheduled appointments for today in chronological order" />
            </Box>
            
            {loading ? <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} /> : (
              <Box sx={{ flexGrow: 1 }}>
                {stats?.todaySchedule?.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
                    <EventIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography>No appointments scheduled for today</Typography>
                  </Box>
                ) : (
                  <List sx={{ width: '100%' }}>
                    {stats?.todaySchedule?.map((app: any, idx: number) => (
                      <Box key={app._id}>
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2, minWidth: 60 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {format(new Date(app.startTime), 'h:mm a')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(app.endTime), 'h:mm a')}
                              </Typography>
                            </Box>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{app.customerName}</Typography>
                                <Chip label={app.status} size="small" color={getStatusColor(app.status) as any} sx={{ fontWeight: 600, borderRadius: 2 }} />
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {app.type === 'Walk-in' ? <DirectionsWalkIcon fontSize="small"/> : <LaptopMacIcon fontSize="small"/>}
                                {app.serviceId?.name || app.title || 'Appointment'}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {idx < stats.todaySchedule.length - 1 && <Divider component="li" />}
                      </Box>
                    ))}
                  </List>
                )}
              </Box>
            )}
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 5 }}>
          <Card id="tour-appointments" sx={{ p: 3, height: '100%', minHeight: 400, display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{fontWeight: 700}}>Recent Bookings</Typography>
              <InfoTooltip title="The last 5 bookings made by your customers" />
            </Box>
            
            {loading ? <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} /> : (
              <Box sx={{ flexGrow: 1 }}>
                <List sx={{ width: '100%' }}>
                  {stats?.recentBookings?.length > 0 ? stats.recentBookings.map((app: any, idx: number) => (
                    <Box key={app._id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{app.customerName}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {format(new Date(app.createdAt), 'MMM d, h:mm a')}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                              <span>{format(new Date(app.startTime), 'MMM d')} • {app.serviceId?.name || app.title}</span>
                              <Chip label={app.status} size="small" variant="outlined" color={getStatusColor(app.status) as any} sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600, borderRadius: 2 }} />
                            </Typography>
                          }
                        />
                      </ListItem>
                      {idx < stats.recentBookings.length - 1 && <Divider component="li" /> }
                    </Box>
                  )) : (
                    <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                      <Typography variant="body1" sx={{ mb: 2 }}>You don't have any recent bookings yet.</Typography>
                      <Button variant="outlined" color="primary" href={`/b/${stats?.slug}`} target="_blank">
                        View Your Public Page
                      </Button>
                    </Box>
                  )}
                </List>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
            <Typography variant="h6" sx={{fontWeight: 700}} gutterBottom>Bookings (Last 7 Days)</Typography>
            {loading ? <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} /> : (
              <Box sx={{ flexGrow: 1, minHeight: 0, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.bookingTrend || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)' }} />
                    <Line type="monotone" dataKey="count" stroke="#659287" strokeWidth={4} dot={{r: 5, fill: '#659287', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 7}} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
            <Typography variant="h6" sx={{fontWeight: 700}} gutterBottom>Booking Types</Typography>
            {loading ? <Skeleton variant="rounded" height={300} sx={{ borderRadius: 2 }} /> : (
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats?.typeData || []} cx="50%" cy="45%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                      {(stats?.typeData || []).map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}