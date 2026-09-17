import React, { useEffect } from 'react';
import { Skeleton, Box, Card, Typography, Grid, useTheme, CardContent, CardHeader, Chip, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VerifiedIcon from '@mui/icons-material/Verified';
import ScienceIcon from '@mui/icons-material/Science';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchSuperadminDashboard } from '../../features/superadmin/superadminSlice';
import { formatIST } from '../../utils/format';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const COLORS = ['#659287', '#B1D3B9', '#88BDA4', '#4a6b62', '#c7e6cf'];

const MiniChart = ({ color }: { color: string }) => {
  const totalBars = 28;
  const fillCount = (color.charCodeAt(1) * 3) % totalBars || 14;
  const bars = Array.from({ length: totalBars });
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '2px', height: 18, mt: 0.75 }}>
      {bars.map((_, i) => (
        <Box 
          key={i} 
          sx={{ flex: 1, height: '100%', bgcolor: i < fillCount ? color : `${color}25`, borderRadius: '1.5px' }} 
        />
      ))}
    </Box>
  );
};

const KpiCard = ({ title, value, icon, trend = 15.2, trendUp = true, color = '#659287', loading, action }: any) => {
  if (loading) return <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />;

  return (
    <Card sx={{ 
      px: 2, py: 1.5, 
      borderRadius: 3, 
      bgcolor: 'white',
      boxShadow: '0 1px 8px rgba(31,43,39,0.06)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
      height: '100%',
    }}>
      <Avatar sx={{ bgcolor: `${color}18`, color: color, width: 36, height: 36, mt: 0.25 }}>
        {React.cloneElement(icon, { sx: { fontSize: 18 } })}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Chip 
            icon={trendUp ? <TrendingUpIcon style={{ fontSize: 11, color: 'inherit' }} /> : <TrendingDownIcon style={{ fontSize: 11, color: 'inherit' }} />} 
            label={`${Math.abs(trend)}%`} 
            size="small" 
            sx={{ 
              bgcolor: trendUp ? '#e6f4ea' : '#fce8e6',
              color: trendUp ? '#137333' : '#c5221f',
              fontWeight: 700,
              borderRadius: 1.5,
              height: 18,
              fontSize: '0.65rem',
              '& .MuiChip-icon': { ml: 0.25 },
              '& .MuiChip-label': { px: 0.5 }
            }} 
          />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 0.25 }}>{value}</Typography>
        <MiniChart color={color} />
        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500, fontSize: '0.65rem' }}>
          VS last week
        </Typography>
        {action && <Box sx={{ mt: 0.5 }}>{action}</Box>}
      </Box>
    </Card>
  );
};

export default function SuperadminDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { dashboardData: stats, dashboardLoading: loading } = useAppSelector((state) => state.superadmin);
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchSuperadminDashboard());
  }, [dispatch]);

  const onboardedShops = (stats?.registeredShops || 0) - (stats?.activeTrials || 0);

  return (
    <Box sx={{ pb: 4 }}>
      {/* â”€â”€ Row 1: KPI Cards (4 across) â”€â”€ */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Total Appointments" 
            value={stats?.totalAppointments?.toLocaleString() || 0} 
            icon={<EventIcon />} 
            trend={18.4}
            trendUp={true}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Today's Appointments" 
            value={stats?.appointmentsToday?.toLocaleString() || 0} 
            icon={<CalendarTodayIcon />} 
            color="#2196f3"
            trend={0}
            trendUp={true}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Registered Shops" 
            value={stats?.registeredShops?.toLocaleString() || 0} 
            icon={<VerifiedIcon />} 
            color="#4caf50"
            trend={12.5}
            trendUp={true}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Business Admins" 
            value={stats?.totalAdmins?.toLocaleString() || 0} 
            icon={<PeopleIcon />} 
            color="#00897b"
            trend={4.2}
            trendUp={true}
          />
        </Grid>
      </Grid>

      {/* â”€â”€ Row 2: Action KPI Cards (3 across) â”€â”€ */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard 
            loading={loading}
            title="Pending Verification" 
            value={stats?.pendingShops?.toLocaleString() || 0} 
            icon={<HourglassEmptyIcon />} 
            color="#ff9800"
            trend={0}
            trendUp={true}
            action={
              (stats?.pendingShops || 0) > 0 ? (
                <Button 
                  variant="outlined" 
                  color="warning" 
                  size="small"
                  onClick={() => navigate('/superadmin/registration')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
                >
                  Verify Now
                </Button>
              ) : null
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard 
            loading={loading}
            title="Pending Demo Requests" 
            value={stats?.pendingDemoRequests?.toLocaleString() || 0} 
            icon={<StoreIcon />} 
            color="#e91e63"
            trend={0}
            trendUp={true}
            action={
              (stats?.pendingDemoRequests || 0) > 0 ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small"
                  onClick={() => navigate('/superadmin/demo-requests')}
                  sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}
                >
                  Review Leads
                </Button>
              ) : null
            }
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard 
            loading={loading}
            title="Active Trials" 
            value={stats?.activeTrials?.toLocaleString() || 0} 
            icon={<ScienceIcon />} 
            color="#9c27b0"
            trend={0}
            trendUp={true}
          />
        </Grid>
      </Grid>

      {/* â”€â”€ Row 3: Charts + Activity â”€â”€ */}
      <Grid container spacing={2.5}>
        {/* Left: Trend Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>30-Day Appointment Trend</Typography>} 
              sx={{ pb: 0 }}
            />
            <CardContent>
              {loading ? (
                <Skeleton variant="rounded" height={260} />
              ) : (
                <Box sx={{ width: '100%', height: 260 }}>
                  <ResponsiveContainer>
                    <LineChart data={stats?.trendData || []} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip 
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

        {/* Center: Recent Activity */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recent Activity</Typography>} 
              sx={{ pb: 0 }}
            />
            <CardContent sx={{ pt: 1 }}>
              {loading ? (
                <Skeleton variant="rounded" height={260} />
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <List disablePadding>
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: activity.type === 'business' ? '#e3f2fd' : '#e8f5e9', color: activity.type === 'business' ? '#1976d2' : '#2e7d32' }}>
                            {activity.type === 'business' ? <StoreIcon sx={{ fontSize: 16 }} /> : <PeopleIcon sx={{ fontSize: 16 }} />}
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

        {/* Right: Pie Chart */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Appointment Types</Typography>} 
              sx={{ pb: 0 }}
            />
            <CardContent>
              {loading ? (
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
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* â”€â”€ Row 4: Platform Overview + Quick Actions â”€â”€ */}
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', p: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Platform Overview</Typography>
            {loading ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[
                  { label: 'Total Businesses', value: stats?.totalBusinesses || 0, color: '#659287' },
                  { label: 'Onboarded Shops', value: onboardedShops, color: '#4caf50' },
                  { label: 'Active Trials', value: stats?.activeTrials || 0, color: '#9c27b0' },
                  { label: 'Pending Reviews', value: stats?.pendingShops || 0, color: '#ff9800' },
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
                { label: 'Manage Registrations', desc: 'Review & approve pending shops', path: '/superadmin/registration', color: '#ff9800', icon: <HourglassEmptyIcon /> },
                { label: 'Demo Requests', desc: 'Provision sandboxes for leads', path: '/superadmin/demo-requests', color: '#e91e63', icon: <StoreIcon /> },
                { label: 'Onboarded Shops', desc: 'View all approved businesses', path: '/superadmin/onboarded-shops', color: '#4caf50', icon: <VerifiedIcon /> },
                { label: 'Manage Plans', desc: 'Create & update pricing plans', path: '/superadmin/plans', color: '#2196f3', icon: <ScienceIcon /> },
              ].map((item) => (
                <Grid size={{ xs: 6, sm: 3 }} key={item.label}>
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
    </Box>
  );
}
