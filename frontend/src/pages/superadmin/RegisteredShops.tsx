import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  Box, Card, Typography, Table, TableHead, TableBody, TableCell,
  TableRow, TablePagination, Chip, TextField, InputAdornment, Button,
  Skeleton, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import StoreIcon from '@mui/icons-material/Store';
import BadgeIcon from '@mui/icons-material/Badge';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchBusinesses, fetchPlans, fetchAgents } from '../../features/superadmin/superadminSlice';
import { formatIST } from '../../utils/format';
import RegisterShopModal from './registration-flow/RegisterShopModal';

const getOnboardingStage = (shop: any) => {
  if (shop.verificationStatus === 'Approved') {
    return { key: 'approved', label: 'Approved & Active', color: 'success' };
  }
  if (shop.verificationStatus === 'Rejected') {
    return { key: 'rejected', label: 'Rejected', color: 'error' };
  }
  if (shop.verificationStatus === 'ChangesRequested') {
    return { key: 'changes_requested', label: 'Changes Requested', color: 'info' };
  }

  if (!shop.demoStatus || shop.demoStatus === 'None') {
    return { key: 'demo_provisioning', label: 'Step 1: Demo Provisioning', color: 'warning' };
  }
  if (shop.demoStatus === 'Provided') {
    return { key: 'demo_conducted', label: 'Step 2: Demo Conducted Pending', color: 'secondary' };
  }
  if (shop.demoStatus === 'Conducted' && !shop.planId && shop.paymentStatus !== 'Paid') {
    return { key: 'plan_selection', label: 'Step 3: Plan Selection', color: 'warning' };
  }
  return { key: 'verification_review', label: 'Step 4: Verification Review', color: 'info' };
};

interface RegisteredShopRowProps {
  shop: any;
  agentName: string | null;
  onViewShop: (id: string) => void;
  onOpenOnboarding: (id: string) => void;
  onShowRejection: (shop: any) => void;
}

const RegisteredShopRow = memo(({
  shop,
  agentName,
  onViewShop,
  onOpenOnboarding,
  onShowRejection
}: RegisteredShopRowProps) => {
  const isApproved = shop.verificationStatus === 'Approved';
  const isRejected = shop.verificationStatus === 'Rejected';
  const stage = getOnboardingStage(shop);

  return (
    <TableRow hover>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {shop.name}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
          /{shop.slug} • {shop.category || 'General'}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {shop.ownerName || '—'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <PhoneIcon sx={{ fontSize: 11 }} /> {shop.ownerPhone || shop.phone || '—'}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <EmailIcon sx={{ fontSize: 11 }} /> {shop.ownerEmail || shop.email || '—'}
        </Typography>
      </TableCell>
      <TableCell>
        {agentName ? (
          <Chip
            icon={<BadgeIcon style={{ fontSize: 13 }} />}
            label={`Agent: ${agentName}`}
            size="small"
            sx={{ bgcolor: '#f3e8ff', color: '#6b21a8', fontWeight: 700, fontSize: '0.7rem' }}
          />
        ) : (
          <Chip
            label="Self / Public"
            size="small"
            sx={{ bgcolor: '#f1f5f9', color: '#475569', fontWeight: 600, fontSize: '0.7rem' }}
          />
        )}
      </TableCell>
      <TableCell>
        <Chip
          label={stage.label}
          size="small"
          color={stage.color as any}
          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
        />
      </TableCell>
      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
        {formatIST(shop.createdAt)}
      </TableCell>
      <TableCell align="right">
        {isApproved ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onViewShop(shop._id)}
            sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.25, fontSize: '0.75rem' }}
          >
            Shop Details
          </Button>
        ) : isRejected ? (
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => onShowRejection(shop)}
            sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.25, fontSize: '0.75rem' }}
          >
            Rejection Info
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            onClick={() => onOpenOnboarding(shop._id)}
            sx={{ textTransform: 'none', borderRadius: 1.5, py: 0.25, fontSize: '0.75rem', boxShadow: 'none' }}
          >
            Open Onboarding
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
});

RegisteredShopRow.displayName = 'RegisteredShopRow';

export default function RegisteredShops() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    businesses,
    businessesLoading: loading,
    agents
  } = useAppSelector((state) => state.superadmin);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'agent' ? 'agent_only' : 'all';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (searchParams.get('filter') === 'agent') {
      setStatusFilter('agent_only');
    }
  }, [searchParams]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [rejectionModalShop, setRejectionModalShop] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchBusinesses());
    dispatch(fetchPlans());
    dispatch(fetchAgents());
  }, [dispatch]);

  const realBusinesses = useMemo(() => {
    return (businesses || []).filter((b: any) => !b.isDemoAccount);
  }, [businesses]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    realBusinesses.forEach((b: any) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set);
  }, [realBusinesses]);

  const getAgentName = useCallback((agentOrId: any) => {
    if (!agentOrId) return null;
    if (typeof agentOrId === 'object' && agentOrId.name) return agentOrId.name;
    if (!agents?.length) return null;
    const agent = agents.find((a: any) => a._id === agentOrId || a.id === agentOrId);
    return agent ? agent.name : null;
  }, [agents]);

  const handleViewShop = useCallback((id: string) => {
    navigate(`/superadmin/shops/${id}`);
  }, [navigate]);

  const handleOpenOnboarding = useCallback((id: string) => {
    navigate(`/superadmin/registration?biz=${id}`);
  }, [navigate]);

  const handleShowRejection = useCallback((shop: any) => {
    setRejectionModalShop(shop);
  }, []);

  // Filtered list according to Status & Stage dropdown, category dropdown, and search query
  const filteredList = useMemo(() => {
    let list = realBusinesses;

    // Filter by Status & Stage
    if (statusFilter === 'approved') {
      list = list.filter((b: any) => b.verificationStatus === 'Approved');
    } else if (statusFilter === 'pipeline') {
      list = list.filter((b: any) => b.verificationStatus === 'Pending' || b.verificationStatus === 'ChangesRequested');
    } else if (statusFilter === 'agent_only') {
      list = list.filter((b: any) => !!b.registeredByAgentId || !!b.assignedAgentId);
    } else if (statusFilter === 'demo_provisioning') {
      list = list.filter((b: any) => (b.verificationStatus === 'Pending' || b.verificationStatus === 'ChangesRequested') && (!b.demoStatus || b.demoStatus === 'None'));
    } else if (statusFilter === 'demo_conducted') {
      list = list.filter((b: any) => (b.verificationStatus === 'Pending' || b.verificationStatus === 'ChangesRequested') && b.demoStatus === 'Provided');
    } else if (statusFilter === 'plan_selection') {
      list = list.filter((b: any) => (b.verificationStatus === 'Pending' || b.verificationStatus === 'ChangesRequested') && b.demoStatus === 'Conducted' && !b.planId && b.paymentStatus !== 'Paid');
    } else if (statusFilter === 'verification_review') {
      list = list.filter((b: any) => (b.verificationStatus === 'Pending' || b.verificationStatus === 'ChangesRequested') && b.demoStatus === 'Conducted' && (!!b.planId || b.paymentStatus === 'Paid'));
    } else if (statusFilter === 'rejected') {
      list = list.filter((b: any) => b.verificationStatus === 'Rejected');
    }

    // Filter by Category
    if (categoryFilter !== 'all') {
      list = list.filter((b: any) => b.category === categoryFilter);
    }

    // Filter by Search Query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter((b: any) =>
        b.name?.toLowerCase().includes(q) ||
        b.slug?.toLowerCase().includes(q) ||
        b.ownerName?.toLowerCase().includes(q) ||
        b.ownerEmail?.toLowerCase().includes(q) ||
        b.ownerPhone?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [realBusinesses, statusFilter, categoryFilter, searchTerm]);

  const paginatedList = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Top Side Back Button */}
      <Box sx={{ mb: 1.5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/superadmin')}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', px: 0, '&:hover': { bgcolor: 'transparent', color: 'text.primary' } }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* Page Title (Left Side) & Right Side Filters */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Registered Shops & Applications
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            All registered shop applications and onboarding stage pipeline
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search bar */}
          <TextField
            size="small"
            placeholder="Search by shop, owner, phone..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
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

          {/* Status & Stage Filter */}
          <TextField
            select
            label="Status & Stage"
            size="small"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
              if (e.target.value !== 'agent_only' && searchParams.get('filter')) {
                setSearchParams({});
              }
            }}
            sx={{ minWidth: 190, bgcolor: '#fff' }}
            slotProps={{ select: { sx: { borderRadius: 2 } } }}
          >
            <MenuItem value="all">All Applications</MenuItem>
            <MenuItem value="agent_only">⭐ Agent Registered Only</MenuItem>
            <MenuItem value="pipeline">In Onboarding Pipeline</MenuItem>
            <MenuItem value="demo_provisioning">Step 1: Demo Provisioning</MenuItem>
            <MenuItem value="demo_conducted">Step 2: Demo Conducted</MenuItem>
            <MenuItem value="plan_selection">Step 3: Plan Selection</MenuItem>
            <MenuItem value="verification_review">Step 4: Verification Review</MenuItem>
            <MenuItem value="approved">Approved & Active</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>

          {/* Category Filter */}
          <TextField
            select
            label="Category"
            size="small"
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 150, bgcolor: '#fff' }}
            slotProps={{ select: { sx: { borderRadius: 2 } } }}
          >
            <MenuItem value="all">All Categories</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>

          {/* Register New Shop Button */}
          <Button
            variant="contained"
            size="small"
            onClick={() => setRegisterModalOpen(true)}
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: 'none', height: 40 }}
          >
            Register New Shop
          </Button>
        </Box>
      </Box>

      {/* Table Content Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading && !filteredList.length ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Shop & Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Owner Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Registered By</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status & Stage</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Applied Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      <StoreIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>No shop applications found</Typography>
                      <Typography variant="caption">Try adjusting your search or status & stage filter</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedList.map((shop: any) => (
                    <RegisteredShopRow
                      key={shop._id}
                      shop={shop}
                      agentName={getAgentName(shop.registeredByAgentId || shop.assignedAgentId)}
                      onViewShop={handleViewShop}
                      onOpenOnboarding={handleOpenOnboarding}
                      onShowRejection={handleShowRejection}
                    />
                  ))
                )}
              </TableBody>
            </Table>

            <TablePagination
              component="div"
              count={filteredList.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 15, 25, 50]}
            />
          </Box>
        )}
      </Card>

      {/* Register Shop Modal */}
      {registerModalOpen && (
        <RegisterShopModal
          open={registerModalOpen}
          onClose={() => setRegisterModalOpen(false)}
          onSuccess={() => {
            dispatch(fetchBusinesses());
          }}
        />
      )}

      {/* Rejection Details Dialog */}
      <Dialog
        open={!!rejectionModalShop}
        onClose={() => setRejectionModalShop(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Rejection Details
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {rejectionModalShop?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            Applied on {rejectionModalShop?.createdAt ? formatIST(rejectionModalShop.createdAt) : '—'}
          </Typography>
          <Typography variant="body2" sx={{ bgcolor: '#fef2f2', p: 1.5, borderRadius: 2, color: '#991b1b', border: '1px solid #fee2e2' }}>
            {rejectionModalShop?.rejectionReason || 'No specific rejection reason provided.'}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setRejectionModalShop(null)} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
