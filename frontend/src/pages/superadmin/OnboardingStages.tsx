import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import {
  Box, Card, Typography, Table, TableHead, TableBody, TableCell,
  TableRow, TablePagination, Chip, TextField, InputAdornment, Button,
  Skeleton, MenuItem, Stack
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import StoreIcon from '@mui/icons-material/Store';
import BadgeIcon from '@mui/icons-material/Badge';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ScienceIcon from '@mui/icons-material/Science';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchBusinesses, fetchAgents } from '../../features/superadmin/superadminSlice';
import { formatIST } from '../../utils/format';

const getStageDetails = (shop: any) => {
  if (!shop.demoStatus || shop.demoStatus === 'None') {
    return {
      key: 'demoProvisioning',
      stepNum: 1,
      name: 'Demo Provisioning',
      label: 'Step 1: Demo Provisioning',
      desc: 'Pending sandbox creation & Google Meet scheduling',
      color: '#0284c7',
      bg: '#0284c715',
      icon: <ScienceIcon sx={{ fontSize: 14 }} />
    };
  }
  if (shop.demoStatus === 'Provided') {
    return {
      key: 'demoConducted',
      stepNum: 2,
      name: 'Demo Conducted',
      label: 'Step 2: Demo Conducted',
      desc: 'Sandbox ready, call pending completion',
      color: '#8b5cf6',
      bg: '#8b5cf615',
      icon: <StoreIcon sx={{ fontSize: 14 }} />
    };
  }
  if (shop.demoStatus === 'Conducted' && !shop.planId && shop.paymentStatus !== 'Paid') {
    return {
      key: 'planSelection',
      stepNum: 3,
      name: 'Plan Selection',
      label: 'Step 3: Plan Selection',
      desc: 'Demo finished, awaiting plan selection & payment',
      color: '#f59e0b',
      bg: '#f59e0b15',
      icon: <LocalOfferIcon sx={{ fontSize: 14 }} />
    };
  }
  return {
    key: 'verificationDecision',
    stepNum: 4,
    name: 'Verification & Decision',
    label: 'Step 4: Verification & Decision',
    desc: 'Plan selected/paid, ready for approval or trial',
    color: '#10b981',
    bg: '#10b98115',
    icon: <VerifiedIcon sx={{ fontSize: 14 }} />
  };
};

interface StageShopRowProps {
  shop: any;
  agentName: string | null;
  onOpenOnboarding: (id: string) => void;
}

const StageShopRow = memo(({ shop, agentName, onOpenOnboarding }: StageShopRowProps) => {
  const stage = getStageDetails(shop);

  return (
    <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
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
        <Chip
          icon={stage.icon}
          label={stage.label}
          size="small"
          sx={{ bgcolor: stage.bg, color: stage.color, fontWeight: 800, fontSize: '0.72rem', border: `1px solid ${stage.color}35`, '& .MuiChip-icon': { color: stage.color }}}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.3, fontSize: '0.7rem' }}>
          {stage.desc}
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

      <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
        {formatIST(shop.createdAt)}
      </TableCell>

      <TableCell align="right">
        <Button
          variant="contained"
          size="small"
          onClick={() => onOpenOnboarding(shop._id)}
          sx={{ bgcolor: stage.color, color: 'white', fontWeight: 700, borderRadius: 1.5, textTransform: 'none', py: 0.4, px: 1.5, fontSize: '0.75rem', boxShadow: 'none', '&:hover': { bgcolor: stage.color, filter: 'brightness(0.92)'}}}
        >
          Open Onboarding
        </Button>
      </TableCell>
    </TableRow>
  );
});

StageShopRow.displayName = 'StageShopRow';

export default function OnboardingStages() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    businesses,
    businessesLoading: loading,
    agents
  } = useAppSelector((state) => state.superadmin);

  const initialStage = searchParams.get('stage') || 'all';
  const [stageFilter, setStageFilter] = useState(initialStage);
  const [originFilter, setOriginFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(fetchBusinesses());
    dispatch(fetchAgents());
  }, [dispatch]);

  useEffect(() => {
    const stage = searchParams.get('stage');
    if (stage && stage !== stageFilter) {
      setStageFilter(stage);
      setPage(0);
    }
  }, [searchParams]);

  const handleStageChange = useCallback((newStage: string) => {
    setStageFilter(newStage);
    setPage(0);
    if (newStage === 'all') {
      searchParams.delete('stage');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ stage: newStage });
    }
  }, [searchParams, setSearchParams]);

  const getAgentName = useCallback((agentOrId: any) => {
    if (!agentOrId) return null;
    if (typeof agentOrId === 'object' && agentOrId.name) return agentOrId.name;
    if (!agents?.length) return null;
    const agent = agents.find((a: any) => a._id === agentOrId || a.id === agentOrId);
    return agent ? agent.name : null;
  }, [agents]);

  const handleOpenOnboarding = useCallback((id: string) => {
    navigate(`/superadmin/registration?biz=${id}`);
  }, [navigate]);

  const pipelineShops = useMemo(() => {
    return (businesses || []).filter(
      (b: any) => !b.isDemoAccount && (b.verificationStatus === 'Pending' || b.verificationStatus === 'ChangesRequested')
    );
  }, [businesses]);

  const stageCounts = useMemo(() => {
    const counts = {
      all: pipelineShops.length,
      demoProvisioning: 0,
      demoConducted: 0,
      planSelection: 0,
      verificationDecision: 0
    };

    pipelineShops.forEach((b: any) => {
      const stage = getStageDetails(b);
      if (stage.key in counts) {
        counts[stage.key as keyof typeof counts]++;
      }
    });

    return counts;
  }, [pipelineShops]);

  const filteredList = useMemo(() => {
    let list = pipelineShops;

    if (stageFilter !== 'all') {
      list = list.filter((b: any) => getStageDetails(b).key === stageFilter);
    }

    if (originFilter === 'agent_only') {
      list = list.filter((b: any) => !!b.registeredByAgentId || !!b.assignedAgentId);
    } else if (originFilter === 'self_only') {
      list = list.filter((b: any) => !b.registeredByAgentId && !b.assignedAgentId);
    }

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
  }, [pipelineShops, stageFilter, originFilter, searchTerm]);

  const paginatedList = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredList.slice(start, start + rowsPerPage);
  }, [filteredList, page, rowsPerPage]);

  const stageTabs = [
    { key: 'all', label: 'All Stages', count: stageCounts.all, color: '#475569', icon: <StoreIcon sx={{ fontSize: 16 }} /> },
    { key: 'demoProvisioning', label: 'Step 1: Demo Provisioning', count: stageCounts.demoProvisioning, color: '#0284c7', icon: <ScienceIcon sx={{ fontSize: 16 }} /> },
    { key: 'demoConducted', label: 'Step 2: Demo Conducted', count: stageCounts.demoConducted, color: '#8b5cf6', icon: <StoreIcon sx={{ fontSize: 16 }} /> },
    { key: 'planSelection', label: 'Step 3: Plan Selection', count: stageCounts.planSelection, color: '#f59e0b', icon: <LocalOfferIcon sx={{ fontSize: 16 }} /> },
    { key: 'verificationDecision', label: 'Step 4: Verification & Decision', count: stageCounts.verificationDecision, color: '#10b981', icon: <VerifiedIcon sx={{ fontSize: 16 }} /> },
  ];

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 1.5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/superadmin')}
          sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', px: 0, '&:hover': { bgcolor: 'transparent', color: 'text.primary' }
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
          Onboarding Pipeline Stages
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by shop, owner, phone..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
            sx={{ width: { xs: '100%', sm: 180, md: 220 }, bgcolor: '#fff' }}
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
            label="Stage"
            size="small"
            value={stageFilter}
            onChange={(e) => handleStageChange(e.target.value)}
            sx={{ minWidth: 160, bgcolor: '#fff' }}
            slotProps={{ select: { sx: { borderRadius: 2 } } }}
          >
            <MenuItem value="all">All Stages ({stageCounts.all})</MenuItem>
            <MenuItem value="demoProvisioning">Step 1: Demo Provisioning ({stageCounts.demoProvisioning})</MenuItem>
            <MenuItem value="demoConducted">Step 2: Demo Conducted ({stageCounts.demoConducted})</MenuItem>
            <MenuItem value="planSelection">Step 3: Plan Selection ({stageCounts.planSelection})</MenuItem>
            <MenuItem value="verificationDecision">Step 4: Verification & Decision ({stageCounts.verificationDecision})</MenuItem>
          </TextField>

          <TextField
            select
            label="Registration Origin"
            size="small"
            value={originFilter}
            onChange={(e) => { setOriginFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 165, bgcolor: '#fff' }}
            slotProps={{ select: { sx: { borderRadius: 2 } } }}
          >
            <MenuItem value="all">All Registrations</MenuItem>
            <MenuItem value="agent_only">⭐ Agent Registered Only</MenuItem>
            <MenuItem value="self_only">Self / Public Registered</MenuItem>
          </TextField>

          <Button
            variant="outlined"
            onClick={() => navigate('/superadmin/registration')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              borderColor: '#cbd5e1',
              color: '#334155',
              bgcolor: '#fff',
              whiteSpace: 'nowrap',
              py: 0.6,
              px: 1.5,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
            }}
          >
            Open Onboarding
          </Button>
        </Box>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, overflowX: 'auto', pb: 0.5 }}>
        {stageTabs.map((tab) => {
          const isSelected = stageFilter === tab.key;
          return (
            <Card
              key={tab.key}
              onClick={() => handleStageChange(tab.key)}
              sx={{ px: 2, py: 1.25, borderRadius: 2.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.25, bgcolor: isSelected ? '#fff' : '#f8fafc', border: '1.5px solid', borderColor: isSelected ? tab.color : '#e2e8f0', boxShadow: isSelected ? `0 2px 8px ${tab.color}25` : 'none', transition: 'all 0.18s ease-in-out', flexShrink: 0, '&:hover': { borderColor: tab.color, bgcolor: '#fff', transform: 'translateY(-1px)' }}}
            >
              <Box sx={{ color: isSelected ? tab.color : 'text.secondary', display: 'flex', alignItems: 'center' }}>
                {tab.icon}
              </Box>
              <Typography variant="body2" sx={{ fontWeight: isSelected ? 800 : 600, color: isSelected ? '#0f172a' : 'text.secondary', fontSize: '0.82rem' }} >
                {tab.label}
              </Typography>
              <Chip
                label={tab.count}
                size="small"
                sx={{ height: 20, fontSize: '0.72rem', fontWeight: 800, bgcolor: isSelected ? `${tab.color}15` : '#e2e8f0', color: isSelected ? tab.color : '#475569', borderRadius: 1.5 }}
              />
            </Card>
          );
        })}
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {loading && !filteredList.length ? (
          <Box sx={{ p: 3 }}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: 2 }} />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 700, py: 1.5, color: '#334155' }}>Shop Name & Category</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5, color: '#334155' }}>Owner Contact</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5, color: '#334155' }}>Current Onboarding Step</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5, color: '#334155' }}>Registered By</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1.5, color: '#334155' }}>Registered On</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, py: 1.5, color: '#334155' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                      <StoreIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                      <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        No shops currently waiting at this stage
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        All applications have completed this onboarding step or match your current filter criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedList.map((shop: any) => (
                    <StageShopRow
                      key={shop._id}
                      shop={shop}
                      agentName={getAgentName(shop.registeredByAgentId || shop.assignedAgentId)}
                      onOpenOnboarding={handleOpenOnboarding}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </Box>
        )}

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>
    </Box>
  );
}
