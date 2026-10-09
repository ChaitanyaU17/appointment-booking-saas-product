import React, { useEffect } from 'react';
import { Skeleton, Box, Card, Typography, Grid, useTheme, CardContent, CardHeader, Chip, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, Button, Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EventIcon from '@mui/icons-material/Event';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import VerifiedIcon from '@mui/icons-material/Verified';
import ScienceIcon from '@mui/icons-material/Science';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LinkIcon from '@mui/icons-material/Link';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchSuperadminDashboard, fetchBusinesses, fetchPlans } from '../../features/superadmin/superadminSlice';
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
        <Box key={i} sx={{ flex: 1, height: '100%', bgcolor: i < fillCount ? color : `${color}25`, borderRadius: '1.5px' }} />
      ))}
    </Box>
  );
};

const KpiCard = ({ title, value, icon, trend = 15.2, trendUp = true, color = '#659287', loading, action }: any) => {
  if (loading) return <Skeleton variant="rounded" height={110} sx={{ borderRadius: 3 }} />;

  return (
    <Card sx={{ px: 2, py: 1.5, borderRadius: 3, bgcolor: 'white', boxShadow: '0 1px 8px rgba(31,43,39,0.06)', display: 'flex', alignItems: 'flex-start', gap: 1.5, height: '100%'}}>
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
            sx={{ bgcolor: trendUp ? '#e6f4ea' : '#fce8e6', color: trendUp ? '#137333' : '#c5221f', fontWeight: 700, borderRadius: 1.5, height: 18, fontSize: '0.65rem', '& .MuiChip-icon': { ml: 0.25 }, '& .MuiChip-label': { px: 0.5 }}} 
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
  const { dashboardData: stats, dashboardLoading: loading, businesses, plans } = useAppSelector((state) => state.superadmin);
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchSuperadminDashboard());
    dispatch(fetchBusinesses());
    dispatch(fetchPlans());
  }, [dispatch]);

  const onboardedShops = (stats?.registeredShops || 0) - (stats?.activeTrials || 0);

  const getDaysRemaining = (shop: any, activePlan: any) => {
    if (shop.subscriptionEnd) return Math.ceil((new Date(shop.subscriptionEnd).getTime() - Date.now()) / (1000 * 3600 * 24));
    if (shop.planEndDate) return Math.ceil((new Date(shop.planEndDate).getTime() - Date.now()) / (1000 * 3600 * 24));
    if (shop.paymentBreakdown?.planVariantId && activePlan) {
      const variant = activePlan.variants?.find((v: any) => v._id === shop.paymentBreakdown.planVariantId);
      if (variant && variant.durationDays) {
        const start = shop.planStartDate ? new Date(shop.planStartDate) : (shop.paymentLinkGeneratedAt ? new Date(shop.paymentLinkGeneratedAt) : new Date(shop.createdAt));
        const end = new Date(start.getTime() + variant.durationDays * 24 * 60 * 60 * 1000);
        return Math.ceil((end.getTime() - Date.now()) / (1000 * 3600 * 24));
      }
    }
    return null;
  };

  const approvedBusinesses = businesses.filter((b: any) => b.verificationStatus === 'Approved');
  
  const nearExpiryCount = approvedBusinesses.filter((b: any) => {
    const activePlan = plans.find((p: any) => p._id === b.planId || p._id === b.paymentBreakdown?.planId || p._id === b.requestedPlanId);
    const daysRemaining = getDaysRemaining(b, activePlan);
    return daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 7;
  }).length;
  
  const expiredCount = approvedBusinesses.filter((b: any) => {
    const activePlan = plans.find((p: any) => p._id === b.planId || p._id === b.paymentBreakdown?.planId || p._id === b.requestedPlanId);
    const daysRemaining = getDaysRemaining(b, activePlan);
    return daysRemaining === null || daysRemaining <= 0;
  }).length;
  
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

  return (
    <Box sx={{ pb: 4 }}>
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Net Revenue" 
            value={stats?.totalRevenue !== undefined ? `\u20B9 ${stats.totalRevenue.toFixed(2)}` : '\u20B9 0.00'} 
            icon={<AccountBalanceWalletIcon />} 
            color="#16a34a"
            trend={stats?.revenueTrend ? Math.abs(stats.revenueTrend).toFixed(1) : 0}
            trendUp={stats?.revenueTrend >= 0}
            action={<Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>excludes GST</Typography>}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Gross Collections" 
            value={stats?.grossCollections !== undefined ? `\u20B9 ${stats.grossCollections.toFixed(2)}` : '\u20B9 0.00'} 
            icon={<CreditCardIcon />} 
            color="#0284c7"
            trend={0}
            trendUp={true}
            action={<Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>includes GST</Typography>}
          />
        </Grid>
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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
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
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Nearing Expiry" 
            value={nearExpiryCount} 
            icon={<HourglassEmptyIcon />} 
            color="#f59e0b"
            trend={0}
            trendUp={true}
            action={nearExpiryCount > 0 ? <Button variant="outlined" color="warning" size="small" onClick={() => navigate('/superadmin/shops')} sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}>View</Button> : null}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard 
            loading={loading}
            title="Expired Shops" 
            value={expiredCount} 
            icon={<StoreIcon />} 
            color="#dc2626"
            trend={0}
            trendUp={true}
            action={expiredCount > 0 ? <Button variant="outlined" color="error" size="small" onClick={() => navigate('/superadmin/expired-shops')} sx={{ borderRadius: 2, textTransform: 'none', fontSize: '0.75rem', py: 0.25 }}>Allocate</Button> : null}
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

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardHeader 
              title={<Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Recent Activity</Typography>} 
              sx={{ pb: 0 }}
            />
            <CardContent sx={{ pt: 1, height: 275, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(0,0,0,0.1)', borderRadius: '4px' } }}>
              {loading ? (
                <Skeleton variant="rounded" height={260} />
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <List disablePadding>
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <React.Fragment key={activity.id}>
                      <ListItem alignItems="flex-start" sx={{ px: 0, py: 1 }}>
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: activity.type === 'payment' ? '#dcfce7' : (activity.type === 'business' ? '#e3f2fd' : '#f1f5f9'), color: activity.type === 'payment' ? '#166534' : (activity.type === 'business' ? '#1976d2' : '#475569') }}>
                            {activity.type === 'payment' ? <CreditCardIcon sx={{ fontSize: 16 }} /> : (activity.type === 'business' ? <StoreIcon sx={{ fontSize: 16 }} /> : <PeopleIcon sx={{ fontSize: 16 }} />)}
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
            
            {loading ? (
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
                { label: 'Create Coupon', desc: 'Generate new discounts', path: '/superadmin/coupons/create', color: '#9c27b0', icon: <LocalOfferIcon /> },
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
    </Box>
  );
}
