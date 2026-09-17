import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  TextField, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppDispatch, useAppSelector } from '../../hook';
import { showNotification } from '../../features/notifications/notificationSlice';
import { fetchDemoRequests, approveDemoRequest, rejectDemoRequest, deleteDemoRequest } from '../../features/superadmin/superadminSlice';
import SearchBar from '../../components/common/SearchBar';

const DemoRequests = () => {
  const dispatch = useAppDispatch();
  const { demoRequests, demoRequestsLoading } = useAppSelector(state => state.superadmin);
  const [credentialsModal, setCredentialsModal] = useState<{open: boolean, email?: string, password?: string}>({open: false});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    dispatch(fetchDemoRequests());
  }, [dispatch]);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/phu-sbez-ufu');

  const openApproveModal = (id: string) => {
    setSelectedRequestId(id);
    setMeetLink('https://meet.google.com/phu-sbez-ufu');
    setApproveModalOpen(true);
  };

  const handleApproveConfirm = async () => {
    try {
      setApproveModalOpen(false);
      const data = await dispatch(approveDemoRequest({ id: selectedRequestId, meetLink })).unwrap();
      setCredentialsModal({ open: true, email: data.email, password: data.password });
      dispatch(fetchDemoRequests());
      dispatch(showNotification({ message: 'Demo sandbox created successfully' }));
    } catch (e: any) {
      dispatch(showNotification({ message: e || 'Approval failed', failure: true }));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await dispatch(rejectDemoRequest(id)).unwrap();
      dispatch(fetchDemoRequests());
      dispatch(showNotification({ message: 'Request rejected' }));
    } catch (e: any) {
      dispatch(showNotification({ message: e || 'Rejection failed', failure: true }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this request permanently?')) return;
    try {
      await dispatch(deleteDemoRequest(id)).unwrap();
      dispatch(fetchDemoRequests());
      dispatch(showNotification({ message: 'Request deleted successfully' }));
    } catch (e: any) {
      dispatch(showNotification({ message: e || 'Deletion failed', failure: true }));
    }
  };

  const filteredRequests = demoRequests.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (!r.name.toLowerCase().includes(term) && !r.businessName.toLowerCase().includes(term)) {
        return false;
      }
    }
    return true;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Demo Requests</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
          <SearchBar
            placeholder="Search by name or business..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            minWidth={250}
          />
          <TextField
            select
            label="Status Filter"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 150 }, bgcolor: 'white', borderRadius: 1 }}
          >
            <MenuItem value=""><em>All Statuses</em></MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>
        </Box>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Business Details</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Est. Volume</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map(row => (
                <TableRow key={row._id}>
                  <TableCell>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{fontWeight: 'bold'}}>{row.businessName}</Typography>
                    <Typography variant="caption" color="text.secondary">{row.category} — {row.cityState}</Typography>
                  </TableCell>
                  <TableCell>{row.mobile}</TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.monthlyAppointments}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.status} 
                      color={row.status === 'Pending' ? 'warning' : row.status === 'Approved' ? 'success' : 'error'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    {row.status === 'Pending' ? (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          color="success" 
                          size="small" 
                          onClick={() => openApproveModal(row._id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outlined" 
                          color="error" 
                          size="small" 
                          onClick={() => handleReject(row._id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Reject
                        </Button>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {row.status === 'Approved' && row.demoEmail && (
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            size="small" 
                            onClick={() => setCredentialsModal({ open: true, email: row.demoEmail, password: row.demoPassword })}
                            sx={{ textTransform: 'none', py: 0.2 }}
                          >
                            View Creds
                          </Button>
                        )}
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDelete(row._id)}
                          title="Delete Request"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!demoRequestsLoading && demoRequests.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">No demo requests found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={approveModalOpen} onClose={() => setApproveModalOpen(false)}>
        <DialogTitle>Approve Demo Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            This will provision a new demo sandbox for the prospect.
          </DialogContentText>
          <TextField
            fullWidth
            label="Onboarding Meet Link (Optional)"
            variant="outlined"
            value={meetLink}
            onChange={(e) => setMeetLink(e.target.value)}
            helperText="Provide a Google Meet or Calendly link for the onboarding call."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveModalOpen(false)}>Cancel</Button>
          <Button onClick={handleApproveConfirm} variant="contained" color="success">
            Provision Sandbox
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={credentialsModal.open} onClose={() => setCredentialsModal({open: false})}>
        <DialogTitle>Sandbox Created!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The demo sandbox account has been generated. Since email notifications are not active, please securely share these credentials with the prospect:
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography><strong>Email:</strong> {credentialsModal.email}</Typography>
            <Typography><strong>Password:</strong> {credentialsModal.password}</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCredentialsModal({open: false})}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DemoRequests;
