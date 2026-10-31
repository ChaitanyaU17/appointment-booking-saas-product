import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { 
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, 
  TableRow, TextField, MenuItem, Button, Chip
} from '@mui/material';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchBusinesses, fetchPlans } from '../../features/superadmin/superadminSlice';
import SearchBar from '../../components/common/SearchBar';

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

interface ExpiredShopRowProps {
  shop: any;
  basePath: string;
  onAllocatePlan: (id: string) => void;
  onViewShop: (id: string) => void;
}

const ExpiredShopRow = memo(({ shop, onAllocatePlan, onViewShop }: ExpiredShopRowProps) => {
  const days = shop.computedDaysRemaining;
  const isExpired = (days !== null && days <= 0) || shop.subscriptionStatus === 'expired';
  const color = isExpired ? '#dc2626' : (days <= 1 ? '#ef4444' : (days <= 3 ? '#ea580c' : '#d97706'));
  const label = isExpired 
    ? 'Expired / No Plan' 
    : (days === 1 ? 'Expires Today' : `${days} Days Remaining`);

  return (
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{shop.name}</Typography>
        <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>/{shop.slug}</Typography>
      </TableCell>
      <TableCell>
        <Typography sx={{ fontSize: 13, color: '#475569' }}>{shop.category || '-'}</Typography>
      </TableCell>
      <TableCell>
        <Typography sx={{ fontSize: 13, color: '#475569' }}>{shop.ownerName || '-'}</Typography>
      </TableCell>
      <TableCell>
        <Typography sx={{ fontSize: 13, color: '#475569' }}>{shop.ownerPhone || shop.phone || '-'}</Typography>
      </TableCell>
      <TableCell>
        <Typography sx={{ fontSize: 13, color: '#475569' }}>{shop.ownerEmail || shop.email || '-'}</Typography>
      </TableCell>
      <TableCell>
        <Chip 
          icon={isExpired ? <ErrorOutlineRoundedIcon style={{ color: '#fff', fontSize: 14 }} /> : <AccessTimeIcon style={{ color: '#fff', fontSize: 14 }} />}
          label={label} 
          size="small" 
          sx={{ bgcolor: color, color: '#fff', fontSize: 11, fontWeight: 700, height: 24, '& .MuiChip-label': { px: 1.5 }, '& .MuiChip-icon': { ml: 1 }}} 
        />
      </TableCell>
      <TableCell align="center">
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            size="small" 
            disableElevation
            onClick={() => onAllocatePlan(shop._id)}
            sx={{ bgcolor: '#16a34a', color: '#fff', textTransform: 'none', fontWeight: 600, borderRadius: 2, height: 28, '&:hover': { bgcolor: '#15803d' }}}
          >
            Allocate Plan
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => onViewShop(shop._id)}
            sx={{ borderColor: '#16a34a', color: '#16a34a', textTransform: 'none', fontWeight: 600, borderRadius: 2, height: 28, '&:hover': { bgcolor: '#f0fdf4', borderColor: '#15803d' } }}
          >
            View Shop
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
});

ExpiredShopRow.displayName = 'ExpiredShopRow';

const ExpiredShops = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { businesses, plans } = useAppSelector((state) => state.superadmin);
  const { user } = useAppSelector((state) => state.auth);
  const isAgent = user?.role === 'Agent' || window.location.pathname.startsWith('/agent');
  const basePath = isAgent ? '/agent' : '/superadmin';

  const validRanges = ['expired', '1day', '3days', '5days', 'all_near', 'all'];
  const rawRange = searchParams.get('range');
  const rangeFilter = rawRange && validRanges.includes(rawRange) ? rawRange : 'expired';

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchBusinesses());
    dispatch(fetchPlans());
  }, [dispatch]);

  const handleRangeChange = useCallback((newRange: string) => {
    setPage(0);
    setSearchParams({ range: newRange });
  }, [setSearchParams]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      if (b.isDemoAccount) return false;
      if (b.verificationStatus !== 'Approved') return false;
      
      const activePlan = plans.find((p: any) => p._id === b.planId || p._id === b.paymentBreakdown?.planId || p._id === b.requestedPlanId);
      const daysRemaining = getDaysRemaining(b, activePlan);
      const isExpired = (daysRemaining !== null && daysRemaining <= 0) || b.subscriptionStatus === 'expired';

      if (rangeFilter === 'expired') {
        if (!isExpired) return false;
      } else if (rangeFilter === '1day') {
        if (daysRemaining === null || daysRemaining <= 0 || daysRemaining > 1) return false;
      } else if (rangeFilter === '3days') {
        if (daysRemaining === null || daysRemaining <= 0 || daysRemaining > 3) return false;
      } else if (rangeFilter === '5days') {
        if (daysRemaining === null || daysRemaining <= 0 || daysRemaining > 5) return false;
      } else if (rangeFilter === 'all_near') {
        if (daysRemaining === null || daysRemaining <= 0 || daysRemaining > 7) return false;
      } else if (rangeFilter === 'all') {
        if (!isExpired && (daysRemaining === null || daysRemaining > 7)) return false;
      }

      if (categoryFilter && b.category !== categoryFilter) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!b.name?.toLowerCase().includes(term) && !b.category?.toLowerCase().includes(term) && !b.ownerName?.toLowerCase().includes(term)) {
          return false;
        }
      }
      return true;
    }).map(b => {
      const activePlan = plans.find((p: any) => p._id === b.planId || p._id === b.paymentBreakdown?.planId || p._id === b.requestedPlanId);
      return {
        ...b,
        computedDaysRemaining: getDaysRemaining(b, activePlan),
        computedPlanName: activePlan?.name || b.paymentBreakdown?.planName || 'Standard Plan'
      };
    });
  }, [businesses, plans, rangeFilter, categoryFilter, searchTerm]);

  const categories = useMemo(() => {
    return Array.from(new Set(businesses.filter(b => !b.isDemoAccount && b.verificationStatus === 'Approved').map(b => b.category).filter(Boolean)));
  }, [businesses]);

  const handleAllocatePlan = useCallback((id: string) => {
    navigate(`${basePath}/allocate-plan/${id}`);
  }, [navigate, basePath]);

  const handleViewShop = useCallback((id: string) => {
    navigate(`${basePath}/shops/${id}`);
  }, [navigate, basePath]);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedShops = useMemo(() => {
    return filteredBusinesses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredBusinesses, page, rowsPerPage]);

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 } }}>
      {/* Top Header Row: Headline on Left, Filters on Right */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          gap: 2, 
          mb: 3 
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0f172a' }}>
          Expired Shops
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', width: { xs: '100%', md: 'auto' } }}>
          <SearchBar 
            placeholder="Search by Name" 
            value={searchTerm} 
            onChange={(val: string) => { setSearchTerm(val); setPage(0); }} 
          />
          <TextField 
            select 
            size="small" 
            label="Expiry Range Filter"
            value={rangeFilter}
            onChange={(e) => handleRangeChange(e.target.value)}
            sx={{ minWidth: 220, bgcolor: 'white', '& .MuiOutlinedInput-root': { height: 40, borderRadius: 2 } }}
            slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
          >
            <MenuItem value="expired">Expired Plan Shops</MenuItem>
            <MenuItem value="1day">{"Expiring in 1 Day (\u2264 1d)"}</MenuItem>
            <MenuItem value="3days">{"Expiring in 3 Days (\u2264 3d)"}</MenuItem>
            <MenuItem value="5days">{"Expiring in 5 Days (\u2264 5d)"}</MenuItem>
            <MenuItem value="all_near">{"All Near Expiry (\u2264 7d)"}</MenuItem>
            <MenuItem value="all">All Expired &amp; Near Expiry</MenuItem>
          </TextField>

          <TextField 
            select 
            size="small" 
            label="Business Type"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 160, bgcolor: 'white', '& .MuiOutlinedInput-root': { height: 40, borderRadius: 2 } }}
            slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
          >
            <MenuItem value="">All Types</MenuItem>
            {categories.map(c => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', py: 2 }}>Shop Name</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', py: 2 }}>Shop Type</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', py: 2 }}>Owner Name</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', py: 2 }}>Phone</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', py: 2 }}>Email</TableCell>
                <TableCell sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', py: 2 }}>Plan Status</TableCell>
                <TableCell align="center" sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', py: 2 }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedShops.map((b) => (
                <ExpiredShopRow
                  key={b._id}
                  shop={b}
                  basePath={basePath}
                  onAllocatePlan={handleAllocatePlan}
                  onViewShop={handleViewShop}
                />
              ))}
              {paginatedShops.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography sx={{ color: '#64748b' }}>No shops found matching your criteria.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredBusinesses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Box>
  );
};

export default ExpiredShops;
