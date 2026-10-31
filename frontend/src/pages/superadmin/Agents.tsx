import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Skeleton, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Card, CardContent, Divider, Tooltip, Grid, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Stack, alpha,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SearchBar from '../../components/common/SearchBar';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchAgents, deleteAgent } from '../../features/superadmin/superadminSlice';
import { ACCENT, ACCENT_DARK, ACCENT_SOFT, ACCENT_BORDER, SURFACE, PAGE_BG, BORDER, MUTED, INK, SUCCESS, SUCCESS_SOFT, SUCCESS_BORDER, ERROR, ERROR_SOFT, ERROR_BORDER, INFO, INFO_SOFT, INFO_BORDER, VIOLET, VIOLET_SOFT, VIOLET_BORDER } from '../../theme/colors';

const PERMISSION_META = [
  { key: 'canAccessRegistration', label: 'Registration', tone: INFO, soft: INFO_SOFT, border: INFO_BORDER },
  { key: 'canAccessOnboardedShops', label: 'Onboarded', tone: ACCENT_DARK, soft: ACCENT_SOFT, border: ACCENT_BORDER },
  { key: 'canAccessExpiredShops', label: 'Expired', tone: ERROR, soft: ERROR_SOFT, border: ERROR_BORDER },
  { key: 'canAccessBusinessAdmins', label: 'Admins', tone: VIOLET, soft: VIOLET_SOFT, border: VIOLET_BORDER },
  { key: 'canAccessPlans', label: 'Plans', tone: SUCCESS, soft: SUCCESS_SOFT, border: SUCCESS_BORDER },
  { key: 'canAccessCoupons', label: 'Coupons', tone: '#d97706', soft: '#fffbeb', border: '#fde68a' },
  { key: 'canAccessDemoRequests', label: 'Demo Req', tone: INFO, soft: INFO_SOFT, border: INFO_BORDER },
  { key: 'canAccessPayments', label: 'Payments', tone: VIOLET, soft: VIOLET_SOFT, border: VIOLET_BORDER },
  { key: 'canManageShopProfile', label: 'Profile', tone: ACCENT_DARK, soft: ACCENT_SOFT, border: ACCENT_BORDER },
  { key: 'canManageOnboarding', label: 'Onboarding', tone: INFO, soft: INFO_SOFT, border: INFO_BORDER },
  { key: 'canManageAppointments', label: 'Appointments', tone: SUCCESS, soft: SUCCESS_SOFT, border: SUCCESS_BORDER },
  { key: 'canManageBilling', label: 'Billing', tone: VIOLET, soft: VIOLET_SOFT, border: VIOLET_BORDER },
];

const getPermissionChips = (perms: any) => PERMISSION_META.filter((p) => perms?.[p.key]);

export default function Agents() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { agents, agentsLoading } = useAppSelector((state) => state.superadmin);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');

  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);

  const filtered = agents.filter((a: any) => {
    const term = search.toLowerCase();
    return (
      a.name?.toLowerCase().includes(term) ||
      a.email?.toLowerCase().includes(term) ||
      a.phone?.toLowerCase().includes(term) ||
      (a.assignedBusinessIds || []).some((b: any) => (typeof b === 'object' ? b.name : '').toLowerCase().includes(term))
    );
  });

  const handleDelete = async () => {
    if (!agentToDelete) return;
    try {
      await dispatch(deleteAgent(agentToDelete._id)).unwrap();
      dispatch(showNotification({ message: 'Agent removed successfully!' }));
    } catch (error: any) {
      dispatch(showNotification({ message: error || 'Failed to remove agent', failure: true }));
    } finally {
      setDeleteDialogOpen(false);
      setAgentToDelete(null);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, pb: 8 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha(SURFACE, 0.85), backdropFilter: 'blur(12px)', borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, py: 1.75, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}` }}>
            <SupportAgentRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.2, color: INK, lineHeight: 1.2 }}>Agents</Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>Manage platform agents, shops, and permissions</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search agents or shops..." />
            <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => { if (v) setViewMode(v); }} size="small" sx={{ bgcolor: SURFACE, '& .MuiToggleButton-root': { border: `1px solid ${BORDER}`, borderRadius: 1.5, px: 1, py: 0.6, color: MUTED, '&.Mui-selected': { bgcolor: ACCENT_SOFT, color: ACCENT_DARK, borderColor: ACCENT_BORDER } } }}>
              <ToggleButton value="card" aria-label="card view"><Tooltip title="Card View"><ViewModuleRoundedIcon sx={{ fontSize: 17 }} /></Tooltip></ToggleButton>
              <ToggleButton value="table" aria-label="table view"><Tooltip title="Table View"><ViewListRoundedIcon sx={{ fontSize: 17 }} /></Tooltip></ToggleButton>
            </ToggleButtonGroup>
            <Button variant="contained" disableElevation onClick={() => navigate('/superadmin/agents/create')} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, borderRadius: 1.5, px: 2, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>
              Create Agent
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, pt: 3 }}>
        {agentsLoading ? (
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((n) => (
              <Grid key={n} size={{ xs: 12, sm: 6, lg: 4 }}><Skeleton variant="rounded" height={260} sx={{ borderRadius: 2.5 }} /></Grid>
            ))}
          </Grid>
        ) : filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, bgcolor: SURFACE, borderRadius: 2.5, border: `1px dashed ${BORDER}` }}>
            <SupportAgentRoundedIcon sx={{ fontSize: 52, color: '#cbd5e1', mb: 1.5 }} />
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>{search ? 'No agents match your search' : 'No agents created yet'}</Typography>
            <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.5, mb: 2.5 }}>Create support and onboarding agents to delegate shop management with fine-grained controls.</Typography>
            <Button variant="contained" disableElevation onClick={() => navigate('/superadmin/agents/create')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>
              Create First Agent
            </Button>
          </Box>
        ) : viewMode === 'card' ? (
          <Grid container spacing={2.5}>
            {filtered.map((agent: any) => {
              const assignedCount = agent.assignedBusinessIds?.length || 0;
              const perms = getPermissionChips(agent.permissions);
              const isActive = agent.isActive !== false;
              return (
                <Grid key={agent._id} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all .2s ease', '&:hover': { borderColor: ACCENT_BORDER, boxShadow: `0 12px 32px -18px ${alpha(ACCENT, 0.35)}`, transform: 'translateY(-1px)' } }}>
                    <CardContent sx={{ p: 2.5, flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5, gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography onClick={() => navigate(`/superadmin/agents/${agent._id}`)} sx={{ fontSize: 14.5, fontWeight: 700, color: INK, cursor: 'pointer', '&:hover': { color: ACCENT }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.name}</Typography>
                            <Chip
                              size="small"
                              icon={isActive ? <CheckCircleRoundedIcon sx={{ fontSize: 11 }} /> : <CancelRoundedIcon sx={{ fontSize: 11 }} />}
                              label={isActive ? 'Active' : 'Inactive'}
                              sx={{ height: 20, mt: 0.4, fontSize: 10, fontWeight: 700, letterSpacing: 0.4, bgcolor: isActive ? SUCCESS_SOFT : '#f1f5f9', color: isActive ? SUCCESS : MUTED, border: `1px solid ${isActive ? SUCCESS_BORDER : BORDER}`, '& .MuiChip-icon': { color: isActive ? SUCCESS : MUTED, ml: 0.75 }, '& .MuiChip-label': { px: 1 } }}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Details & Controls"><IconButton size="small" onClick={() => navigate(`/superadmin/agents/${agent._id}`)} sx={{ width: 30, height: 30, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 1.25, '&:hover': { color: ACCENT_DARK, borderColor: ACCENT_BORDER, bgcolor: ACCENT_SOFT } }}><VisibilityRoundedIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/superadmin/agents/edit/${agent._id}`)} sx={{ width: 30, height: 30, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 1.25, '&:hover': { color: ACCENT_DARK, borderColor: ACCENT_BORDER, bgcolor: ACCENT_SOFT } }}><EditRoundedIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => { setAgentToDelete(agent); setDeleteDialogOpen(true); }} sx={{ width: 30, height: 30, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 1.25, '&:hover': { color: ERROR, borderColor: ERROR_BORDER, bgcolor: ERROR_SOFT } }}><DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                        </Box>
                      </Box>

                      <Stack spacing={0.9} sx={{ p: 1.5, mb: 2, borderRadius: 1.75, bgcolor: '#fbfcfe', border: `1px solid ${BORDER}` }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><EmailRoundedIcon sx={{ fontSize: 14, color: MUTED }} /><Typography sx={{ fontSize: 12, color: INK, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{agent.email}</Typography></Box>
                        {agent.phone && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><PhoneRoundedIcon sx={{ fontSize: 14, color: MUTED }} /><Typography sx={{ fontSize: 12, color: INK, fontWeight: 500 }}>{agent.phone}</Typography></Box>}
                      </Stack>

                      <Grid container spacing={1.25} sx={{ mb: 2 }}>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, color: ACCENT_DARK, lineHeight: 1 }}>{assignedCount}</Typography>
                            <Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: ACCENT_DARK, mt: 0.4 }}>Reg. Shops</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Box sx={{ p: 1.25, borderRadius: 1.5, bgcolor: '#fbfcfe', border: `1px solid ${BORDER}`, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4, color: INK, lineHeight: 1 }}>{perms.length}<Box component="span" sx={{ fontSize: 12, fontWeight: 700, color: MUTED }}>/{PERMISSION_META.length}</Box></Typography>
                            <Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, mt: 0.4 }}>Controls</Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      <Box sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 0.75 }}>Registered Shops</Typography>
                        {assignedCount === 0 ? <Typography sx={{ fontSize: 11.5, color: MUTED, fontStyle: 'italic' }}>No shops registered yet</Typography> : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {agent.assignedBusinessIds.slice(0, 2).map((b: any) => (
                              <Chip key={b._id || b} size="small" label={typeof b === 'object' ? b.name : 'Shop'} sx={{ height: 20, fontSize: 10.5, fontWeight: 600, bgcolor: '#f1f5f9', color: '#475569', '& .MuiChip-label': { px: 1 } }} />
                            ))}
                            {assignedCount > 2 && <Chip size="small" label={`+${assignedCount - 2}`} sx={{ height: 20, fontSize: 10.5, fontWeight: 700, bgcolor: ACCENT_SOFT, color: ACCENT_DARK, border: `1px solid ${ACCENT_BORDER}`, '& .MuiChip-label': { px: 1 } }} />}
                          </Box>
                        )}
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 0.75 }}>Active Controls</Typography>
                        {perms.length === 0 ? <Typography sx={{ fontSize: 11.5, color: MUTED, fontStyle: 'italic' }}>No controls enabled</Typography> : (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {perms.map((p) => (
                              <Chip key={p.key} size="small" label={p.label} sx={{ height: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.3, bgcolor: p.soft, color: p.tone, border: `1px solid ${p.border}`, '& .MuiChip-label': { px: 1 } }} />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </CardContent>

                    <Divider sx={{ borderColor: '#f1f4f9' }} />
                    <Box sx={{ p: 1.75, bgcolor: '#fbfcfe', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button size="small" variant="contained" disableElevation onClick={() => navigate(`/superadmin/agents/${agent._id}`)} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12, borderRadius: 1.5, px: 2, bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>
                        View Details & Controls
                      </Button>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', overflow: 'hidden' }}>
            <Table>
              <TableHead sx={{ '& .MuiTableCell-head': {fontWeight: 700, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', borderBottom: `1px solid ${BORDER}`, py: 1.5 } }}>
                <TableRow>
                  <TableCell>Agent</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Registered Shops</TableCell>
                  <TableCell>Active Controls</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((agent: any) => {
                  const assignedCount = agent.assignedBusinessIds?.length || 0;
                  const perms = getPermissionChips(agent.permissions);
                  const isActive = agent.isActive !== false;
                  return (
                    <TableRow key={agent._id} hover sx={{ '& td': { borderColor: '#f1f4f9', py: 1.75 } }}>
                      <TableCell sx={{ cursor: 'pointer' }} onClick={() => navigate(`/superadmin/agents/${agent._id}`)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 34, height: 34, bgcolor: isActive ? ACCENT_SOFT : '#f1f5f9', color: isActive ? ACCENT_DARK : MUTED, fontSize: 13, fontWeight: 700, border: `1px solid ${isActive ? ACCENT_BORDER : BORDER}` }}>{agent.name?.charAt(0)?.toUpperCase() || 'A'}</Avatar>
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: INK, '&:hover': { color: ACCENT } }}>{agent.name}</Typography>
                            <Typography sx={{ fontSize: 11, color: MUTED }}>Click to view details & controls</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12.5, fontWeight: 500, color: INK }}>{agent.email}</Typography>
                        {agent.phone && <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>{agent.phone}</Typography>}
                      </TableCell>
                      <TableCell>
                        {assignedCount === 0 ? <Typography sx={{ fontSize: 12, color: MUTED, fontStyle: 'italic' }}>None</Typography> : (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                            <Chip size="small" label={`${assignedCount} Shop${assignedCount > 1 ? 's' : ''}`} sx={{ height: 22, fontSize: 10.5, fontWeight: 700, bgcolor: ACCENT_SOFT, color: ACCENT_DARK, border: `1px solid ${ACCENT_BORDER}`, '& .MuiChip-label': { px: 1.2 } }} />
                            {assignedCount > 1 && <Typography sx={{ fontSize: 11, color: MUTED, ml: 0.5 }}>+{assignedCount - 1} more</Typography>}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {perms.length === 0 ? <Typography sx={{ fontSize: 11.5, color: MUTED }}>None</Typography> : perms.map((p) => (
                            <Chip key={p.key} size="small" label={p.label} sx={{ height: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.3, bgcolor: p.soft, color: p.tone, border: `1px solid ${p.border}`, '& .MuiChip-label': { px: 1 } }} />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={isActive ? 'Active' : 'Inactive'} sx={{ height: 22, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, bgcolor: isActive ? SUCCESS_SOFT : '#f1f5f9', color: isActive ? SUCCESS : MUTED, border: `1px solid ${isActive ? SUCCESS_BORDER : BORDER}`, '& .MuiChip-label': { px: 1.2 } }} />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                          <Tooltip title="View Details & Controls"><IconButton size="small" onClick={() => navigate(`/superadmin/agents/${agent._id}`)} sx={{ width: 30, height: 30, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 1.25, '&:hover': { color: ACCENT_DARK, borderColor: ACCENT_BORDER, bgcolor: ACCENT_SOFT } }}><VisibilityRoundedIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/superadmin/agents/edit/${agent._id}`)} sx={{ width: 30, height: 30, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 1.25, '&:hover': { color: ACCENT_DARK, borderColor: ACCENT_BORDER, bgcolor: ACCENT_SOFT } }}><EditRoundedIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => { setAgentToDelete(agent); setDeleteDialogOpen(true); }} sx={{ width: 30, height: 30, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 1.25, '&:hover': { color: ERROR, borderColor: ERROR_BORDER, bgcolor: ERROR_SOFT } }}><DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 2.5, border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px -24px rgba(15,23,42,0.25)' } } }}>
        <DialogTitle sx={{ p: 2.5, borderBottom: `1px solid ${BORDER}` }}>
          <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: INK, letterSpacing: -0.2 }}>Remove Agent?</Typography>
          <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>This action cannot be undone</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          <Typography sx={{ fontSize: 13, color: INK, lineHeight: 1.6 }}>Are you sure you want to remove agent <Box component="strong" sx={{ fontWeight: 700 }}>{agentToDelete?.name}</Box>?</Typography>
          <Box sx={{ mt: 1.75, p: 1.5, borderRadius: 1.5, bgcolor: ERROR_SOFT, border: `1px solid ${ERROR_BORDER}` }}>
            <Typography sx={{ fontSize: 11.5, color: ERROR, fontWeight: 600, lineHeight: 1.55 }}>All assigned shops will be automatically unlinked. The shops and their data will remain completely intact.</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${BORDER}`, gap: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600, fontSize: 13, color: MUTED, borderRadius: 1.5, px: 2 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" disableElevation sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ERROR, '&:hover': { bgcolor: '#b91c1c' } }}>Remove Agent</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}