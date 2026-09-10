import React, { useEffect } from 'react';
import { Skeleton, Box, Card, Typography, Grid, useTheme, CardContent, CardHeader, Chip, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchSuperadminDashboard } from '../../features/superadmin/superadminSlice';
import { formatIST } from '../../utils/format';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const COLORS = ['#659287', '#B1D3B9', '#88BDA4', '#4a6b62', '#c7e6cf'];

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

const KpiCard = ({ title, value, icon, trend = 15.2, trendUp = true, color = '#659287', loading, action }: any) => {
  if (loading) return <Skeleton variant="rounded" height={160} sx={{ borderRadius: 4 }} />;

  return (
    <Card sx={{ 
      p: 2.5, 
      borderRadius: 4, 
      bgcolor: 'white',
      color: 'text.primary',
      boxShadow: '0 2px 12px rgba(31,43,39,0.06)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: color, mb: 1.5 }}>
        {React.cloneElement(icon, { fontSize: 'small' })}
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.85rem' }}>{title}</Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: action ? 1.5 : 0, flexGrow: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
        <Chip 
          icon={trendUp ? <TrendingUpIcon style={{ fontSize: 14, color: 'inherit' }} /> : <TrendingDownIcon style={{ fontSize: 14, color: 'inherit' }} />} 
          label={`${Math.abs(trend)}%`} 
          size="small" 
          sx={{ 
            bgcolor: trendUp ? '#e6f4ea' : '#fce8e6',
            color: trendUp ? '#137333' : '#c5221f',
            fontWeight: 700,
            borderRadius: 2,
            px: 0.5,
            height: 24,
            fontSize: '0.75rem',
            '& .MuiChip-icon': { ml: 0.5 }
          }} 
        />
      </Box>

      <MiniChart color={color} />
      
      <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
        VS last week
      </Typography>
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
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

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 3, 
        mb: 4,
        '& > *': { 
          flexGrow: 1,
          flexBasis: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.33% - 24px)' },
          maxWidth: { xs: '100%', sm: 'calc(50% - 24px)', md: 'calc(33.33% - 24px)' }
        }
      }}>
        <Box>
          <KpiCard 
            loading={loading}
            title="Total Appointments" 
            value={stats?.totalAppointments?.toLocaleString() || 0} 
            icon={<EventIcon />} 
            isPrimary={true}
            trend={18.4}
            trendUp={true}
          />
        </Box>
        <Box>
          <KpiCard 
            loading={loading}
            title="Registered Shops" 
            value={stats?.registeredShops?.toLocaleString() || 0} 
            icon={<StoreIcon />} 
            color="#2196f3"
            trend={12.5}
            trendUp={true}
          />
        </Box>
        <Box>
          <KpiCard 
            loading={loading}
            title="Pending Verification" 
            value={stats?.pendingShops?.toLocaleString() || 0} 
            icon={<StoreIcon />} 
            color="#ff9800"
            trend={0}
            trendUp={true}
            action={
              (stats?.pendingShops || 0) > 0 ? (
                <Button 
                  variant="outlined" 
                  color="warning" 
                  size="small" 
                  fullWidth 
                  onClick={() => navigate('/superadmin/registration')}
                  sx={{ borderRadius: 2 }}
                >
                  Verify Now
                </Button>
              ) : null
            }
          />
        </Box>
        <Box>
          <KpiCard 
            loading={loading}
            title="Pending Demo Requests" 
            value={stats?.pendingDemoRequests?.toLocaleString() || 0} 
            icon={<PeopleIcon />} 
            color="#e91e63"
            trend={0}
            trendUp={true}
            action={
              (stats?.pendingDemoRequests || 0) > 0 ? (
                <Button 
                  variant="outlined" 
                  color="error" 
                  size="small" 
                  fullWidth 
                  onClick={() => navigate('/superadmin/demo-requests')}
                  sx={{ borderRadius: 2 }}
                >
                  Review Leads
                </Button>
              ) : null
            }
          />
        </Box>
        <Box>
          <KpiCard 
            loading={loading}
            title="Business Admins" 
            value={stats?.totalAdmins?.toLocaleString() || 0} 
            icon={<PeopleIcon />} 
            color="#4caf50"
            trend={4.2}
            trendUp={true}
          />
        </Box>
        <Box>
          <KpiCard 
            loading={loading}
            title="Active Trials" 
            value={stats?.activeTrials?.toLocaleString() || 0} 
            icon={<StoreIcon />} 
            color="#9c27b0"
            trend={0}
            trendUp={true}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
            <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 600 }}>30-Day Appointment Trend</Typography>} />
            <CardContent>
              {loading ? (
                <Skeleton variant="rounded" height={300} />
              ) : (
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <LineChart data={stats?.trendData || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#659287', fontWeight: 600 }}
                      />
                      <Line type="monotone" dataKey="count" name="Appointments" stroke="#659287" strokeWidth={4} dot={{ r: 4, fill: '#659287', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Appointment Types</Typography>} />
            <CardContent>
              {loading ? (
                <Skeleton variant="rounded" height={300} />
              ) : (
                <Box sx={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={stats?.typeData || []}
                        innerRadius={70}
                        outerRadius={90}
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

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader title={<Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Activity</Typography>} />
            <CardContent sx={{ pt: 0 }}>
              {loading ? (
                <Skeleton variant="rounded" height={250} />
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <List disablePadding>
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0, py: 1.5 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: activity.type === 'business' ? '#e3f2fd' : '#e8f5e9', color: activity.type === 'business' ? '#1976d2' : '#2e7d32' }}>
                            {activity.type === 'business' ? <StoreIcon /> : <PeopleIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={<Typography variant="body1" sx={{ fontWeight: 500 }}>{activity.message}</Typography>}
                          secondary={<Typography variant="caption" color="text.secondary">{formatIST(activity.date)}</Typography>}
                        />
                      </ListItem>
                      {index < stats.recentActivity.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No recent activity to display.</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}