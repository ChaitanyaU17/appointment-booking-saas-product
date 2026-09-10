import { useEffect, useState } from "react";
import { 
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem, 
  Stepper, Step, StepLabel, StepContent, Paper, Tooltip, FormControlLabel, Checkbox
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../hook";
import { 
  fetchBusinesses, deleteBusiness, fetchPlans, fetchAdmins,
  requestChangesBusiness, rejectBusiness, approveBusiness, activateTrial 
} from "../../features/superadmin/superadminSlice";
import { showNotification } from "../../features/notifications/notificationSlice";
import SearchBar from "../../components/common/SearchBar";

const Registration = () => {
  const dispatch = useAppDispatch();
  const { businesses, plans } = useAppSelector((state) => state.superadmin);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewBiz, setSelectedReviewBiz] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewPlanId, setReviewPlanId] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialDays, setTrialDays] = useState(14);
  const [trialPlanId, setTrialPlanId] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const fetchAll = () => {
    dispatch(fetchBusinesses());
    dispatch(fetchAdmins());
    dispatch(fetchPlans());
  };

  useEffect(() => {
    fetchAll();
  }, [dispatch]);

  const handleOpenReview = (biz: any) => {
    setSelectedReviewBiz(biz);
    setReviewNote("");
    setReviewPlanId(biz.requestedPlanId?._id || "");
    setActiveStep(0);
    setReviewModalOpen(true);
  };

  const handleRequestChanges = () => {
    if (!selectedReviewBiz) return;
    if (!reviewNote.trim()) {
      dispatch(showNotification({ message: "Please provide a note detailing the requested changes", failure: true }));
      return;
    }
    dispatch(requestChangesBusiness({ id: selectedReviewBiz._id, data: { note: reviewNote } }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: "Changes requested" }));
        setReviewModalOpen(false);
        fetchAll();
      })
      .catch((error: any) => {
        dispatch(showNotification({ message: error || "Error", failure: true }));
      });
  };

  const handleReject = () => {
    if (!selectedReviewBiz) return;
    if (!reviewNote.trim()) {
      dispatch(showNotification({ message: "Please provide a reason for rejection", failure: true }));
      return;
    }
    dispatch(rejectBusiness({ id: selectedReviewBiz._id, data: { reason: reviewNote } }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: "Business rejected" }));
        setReviewModalOpen(false);
        fetchAll();
      })
      .catch((error: any) => {
        dispatch(showNotification({ message: error || "Error", failure: true }));
      });
  };

  const handleActivateTrial = () => {
    if (!selectedReviewBiz) return;
    if (!trialPlanId) {
      dispatch(showNotification({ message: "Please select a trial plan first.", failure: true }));
      return;
    }
    dispatch(activateTrial({ id: selectedReviewBiz._id, data: { planId: trialPlanId, durationDays: trialDays } }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: "Trial activated successfully" }));
        setTrialModalOpen(false);
        setReviewModalOpen(false);
        fetchAll();
      })
      .catch((error: any) => dispatch(showNotification({ message: error || "Error", failure: true })));
  };

  const handleApprove = () => {
    if (!selectedReviewBiz) return;
    dispatch(approveBusiness({ id: selectedReviewBiz._id, data: { planId: reviewPlanId || null } }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: "Business approved!" }));
        setReviewModalOpen(false);
        fetchAll();
      })
      .catch((error: any) => {
        dispatch(showNotification({ message: error || "Error", failure: true }));
      });
  };

  const handleAskToReRegister = () => {
    if (!selectedReviewBiz) return;
    dispatch(deleteBusiness(selectedReviewBiz._id))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: "Business data cleared. They can now re-register." }));
        setReviewModalOpen(false);
        fetchAll();
      })
      .catch((error: any) => {
        dispatch(showNotification({ message: error?.message || "Failed to delete business", failure: true }));
      });
  };

  const pendingBusinesses = businesses?.filter((b: any) => ["Pending", "ChangesRequested"].includes(b.verificationStatus));
  const categories = Array.from(new Set(pendingBusinesses?.map((b: any) => b.category).filter(Boolean)));

  const filteredBusinesses = pendingBusinesses?.filter((b: any) => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? b.category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' }, 
        gap: 2,
        mb: 3 
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Onboarding Registrations</Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', md: 'auto' } }}>
          <SearchBar
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(val) => setSearchTerm(val)}
            minWidth={250}
          />
          <TextField
            select
            label="Category Filter"
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ width: { xs: '100%', sm: 180 }, bgcolor: 'white', borderRadius: 1 }}
          >
            <MenuItem value=""><em>All Categories</em></MenuItem>
            {categories.map((c: any) => (
              <MenuItem key={c} value={c}>{c}</MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>

      <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Business Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Requested Plan</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBusinesses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No pending registrations found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBusinesses?.map((row: any) => (
                  <TableRow key={row._id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>{row.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.email}</Typography>
                    </TableCell>
                    <TableCell>{row.category}</TableCell>
                    <TableCell>
                      <Chip label={row.requestedPlanId?.name || "None"} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={row.verificationStatus === "ChangesRequested" ? "Changes Requested" : "Pending"} 
                        color={row.verificationStatus === "ChangesRequested" ? "warning" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button variant="contained" size="small" onClick={() => handleOpenReview(row)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Review Registration</DialogTitle>
        <DialogContent dividers>
          {selectedReviewBiz && (
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Business Details</StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Business Name</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>{selectedReviewBiz.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Category</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>{selectedReviewBiz.category}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Contact Info</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>{selectedReviewBiz.email} <br/> {selectedReviewBiz.phone}</Typography>
                      <Typography variant="caption" color="text.secondary">Registration Number</Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>{selectedReviewBiz.registrationNumber}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 3, mb: 1 }}>
                    <Button variant="contained" onClick={() => setActiveStep(1)}>Continue to Decision</Button>
                  </Box>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Final Decision</StepLabel>
                <StepContent>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Select a plan to approve this business, or provide a reason to reject/request changes.
                    </Typography>
                    
                    <TextField
                      select
                      fullWidth
                      label="Assign Plan"
                      value={reviewPlanId}
                      onChange={(e) => setReviewPlanId(e.target.value)}
                      sx={{ mb: 2 }}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {plans.map((p: any) => (
                        <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Note / Reason (for Rejection/Changes)"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      sx={{ mb: 3 }}
                    />

                  </Box>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 2 }}>
                    <Button onClick={() => setActiveStep(0)}>Back</Button>
                    <Button onClick={handleRequestChanges} color="warning" variant="outlined">
                      Request Changes
                    </Button>
                    <Button onClick={handleReject} color="error" variant="outlined">
                      Reject
                    </Button>
                    <Tooltip title={selectedReviewBiz.verificationStatus === 'Approved' ? "Cannot re-register an already approved business" : "Deletes the application so they can start over"}>
                      <span>
                        <Button 
                          onClick={handleAskToReRegister} 
                          color="error" 
                          variant="contained"
                          disabled={selectedReviewBiz.verificationStatus === 'Approved'}
                        >
                          Ask to Re-register
                        </Button>
                      </span>
                    </Tooltip>
                    <Button onClick={handleApprove} color="success" variant="contained">
                      Approve
                    </Button>
                    <Button variant="outlined" color="secondary" onClick={() => setTrialModalOpen(true)}>
                      {selectedReviewBiz.trialStatus === "Active" ? "Trial Active \u2713" : "Activate Trial"}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            </Stepper>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={trialModalOpen} onClose={() => setTrialModalOpen(false)}>
        <DialogTitle>Activate Trial</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2, minWidth: 300 }}>
          <TextField
            select
            label="Trial Plan"
            value={trialPlanId}
            onChange={(e) => setTrialPlanId(e.target.value)}
            fullWidth
          >
            {plans.map((p) => (
              <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            type="number"
            label="Duration (Days)"
            value={trialDays}
            onChange={(e) => setTrialDays(Number(e.target.value))}
            fullWidth
          />
        </DialogContent>
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={() => setTrialModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleActivateTrial} >Activate</Button>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Registration;
