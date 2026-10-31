import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, CircularProgress, Typography, Button, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, FormControl, InputLabel, Select
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import { useAppDispatch, useAppSelector } from '../../hook';
import { showNotification } from '../../features/notifications/notificationSlice';
import {
  fetchShopDetails,
  fetchAgentPlans,
  agentCreateDemo,
  agentMarkDemoConducted,
  agentApproveShop,
  agentRejectShop,
  agentRequestShopChanges,
  agentActivateTrial,
  agentGeneratePaymentLink,
  deleteShopByAgent
} from '../../features/agent/agentSlice';

import RegistrationPipeline from '../superadmin/registration-flow/RegistrationPipeline';

export default function ShopOnboarding() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { plans } = useAppSelector((state) => state.agent);

  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [demoMeetLink, setDemoMeetLink] = useState('');
  const [demoLoading, setDemoLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewPlanId, setReviewPlanId] = useState('');
  const [reviewVariantId, setReviewVariantId] = useState('');
  const [changesModalOpen, setChangesModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialDays, setTrialDays] = useState(14);
  const [trialPlanId, setTrialPlanId] = useState('');

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await dispatch(fetchShopDetails(id)).unwrap();
      const shopData = res?.shop || res;
      setShop(shopData);

      const autoLink = shopData?.onboardingMeetLink || 'https://meet.google.com/phu-sbez-ufu';
      setDemoMeetLink(autoLink);

      const currentReqPlan =
        shopData?.paymentBreakdown?.planId ||
        shopData?.requestedPlanId?._id ||
        shopData?.planId?._id ||
        shopData?.planId ||
        '';
      const currentReqVariant =
        shopData?.paymentBreakdown?.planVariantId ||
        shopData?.planVariantId ||
        '';

      if (currentReqPlan) setReviewPlanId(currentReqPlan);
      if (currentReqVariant) setReviewVariantId(currentReqVariant);
      if (currentReqPlan) setTrialPlanId(currentReqPlan);

      await dispatch(fetchAgentPlans());
    } catch (err: any) {
      setErrorMsg(err || 'Failed to load shop onboarding details or you do not have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, dispatch]);

  useEffect(() => {
    if (reviewPlanId && plans.length > 0) {
      const selectedPlan = plans.find((p: any) => p._id === reviewPlanId);
      if (selectedPlan?.variants?.length && !reviewVariantId) {
        setReviewVariantId(selectedPlan.variants[0]._id);
      }
    }
  }, [reviewPlanId, plans, reviewVariantId]);

  const handleProvisionDemo = async () => {
    if (!id || !demoMeetLink.trim()) {
      dispatch(showNotification({ message: 'Please provide a Google Meet link.', failure: true }));
      return;
    }
    setDemoLoading(true);
    try {
      await dispatch(agentCreateDemo({ id, meetLink: demoMeetLink })).unwrap();
      dispatch(showNotification({ message: 'Demo sandbox provisioned successfully!' }));
      await loadData();
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to provision demo sandbox.', failure: true }));
    } finally {
      setDemoLoading(false);
    }
  };

  const handleMarkConducted = async () => {
    if (!id) return;
    try {
      await dispatch(agentMarkDemoConducted(id)).unwrap();
      dispatch(showNotification({ message: 'Demo marked as conducted successfully!' }));
      await loadData();
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to mark demo as conducted.', failure: true }));
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    try {
      await dispatch(
        agentApproveShop({
          id,
          data: {
            planId: reviewPlanId,
            planVariantId: reviewVariantId
          }
        })
      ).unwrap();
      dispatch(showNotification({ message: 'Shop verified and approved successfully!' }));
      await loadData();
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to approve shop.', failure: true }));
    }
  };

  const handleConfirmChanges = async () => {
    if (!id || !reviewNote.trim()) {
      dispatch(showNotification({ message: 'Please provide a note explaining requested changes.', failure: true }));
      return;
    }
    try {
      await dispatch(agentRequestShopChanges({ id, note: reviewNote.trim() })).unwrap();
      dispatch(showNotification({ message: 'Changes requested from shop applicant.' }));
      setChangesModalOpen(false);
      await loadData();
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to request changes.', failure: true }));
    }
  };

  const handleConfirmReject = async () => {
    if (!id || !rejectReason.trim()) {
      dispatch(showNotification({ message: 'Please provide a reason for rejection.', failure: true }));
      return;
    }
    try {
      await dispatch(agentRejectShop({ id, reason: rejectReason.trim() })).unwrap();
      dispatch(showNotification({ message: 'Shop application has been rejected.' }));
      setRejectModalOpen(false);
      await loadData();
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to reject shop.', failure: true }));
    }
  };

  const handleConfirmTrial = async () => {
    if (!id) return;
    const planToUse = trialPlanId || reviewPlanId || plans?.[0]?._id;
    if (!planToUse) {
      dispatch(showNotification({ message: 'Please select a plan for the trial.', failure: true }));
      return;
    }
    try {
      await dispatch(
        agentActivateTrial({
          id,
          data: {
            planId: planToUse,
            durationDays: trialDays
          }
        })
      ).unwrap();
      dispatch(showNotification({ message: `Trial for ${trialDays} days activated successfully!` }));
      setTrialModalOpen(false);
      await loadData();
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to activate trial.', failure: true }));
    }
  };

  const handleAgentGeneratePaymentLink = async ({ id: shopId, paymentBreakdown }: { id: string; paymentBreakdown: any }) => {
    return dispatch(agentGeneratePaymentLink({ id: shopId, paymentBreakdown }));
  };

  const handleAskToReRegister = async () => {
    if (!id) return;
    try {
      await dispatch(deleteShopByAgent(id)).unwrap();
      dispatch(showNotification({ message: 'Business data cleared. They can now re-register.' }));
      navigate('/agent/shops');
    } catch (err: any) {
      dispatch(showNotification({ message: err || 'Failed to delete business', failure: true }));
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={36} thickness={4} sx={{ color: '#659287' }} />
        <Typography variant="body2" color="text.secondary">
          Loading assigned shop onboarding pipeline...
        </Typography>
      </Box>
    );
  }

  if (errorMsg || !shop) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper elevation={0} sx={{ p: 4, maxWidth: 500, textAlign: 'center', borderRadius: 3, border: '1px solid #fee2e2', bgcolor: '#fef2f2' }} >
          <ErrorOutlineRoundedIcon sx={{ fontSize: 48, color: '#dc2626', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }} color="#991b1b">
            Access Restricted or Shop Not Found
          </Typography>
          <Typography variant="body2" color="#7f1d1d" sx={{ mt: 1, mb: 3 }}>
            {errorMsg || 'You do not have permission to manage this shop or it is not assigned to your account.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/agent/shops')}
            sx={{ textTransform: 'none', bgcolor: '#659287', '&:hover': { bgcolor: '#4a6b62' }, fontWeight: 700, borderRadius: 2 }}
          >
            Back to Assigned Shops
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fb' }}>
      <RegistrationPipeline
        business={shop}
        onBack={() => navigate('/agent/shops')}
        demoMeetLink={demoMeetLink}
        setDemoMeetLink={setDemoMeetLink}
        reviewNote={reviewNote}
        setReviewNote={setReviewNote}
        reviewPlanId={reviewPlanId}
        setReviewPlanId={setReviewPlanId}
        reviewVariantId={reviewVariantId}
        setReviewVariantId={setReviewVariantId}
        plans={plans}
        onProvisionDemo={handleProvisionDemo}
        onMarkConducted={handleMarkConducted}
        onApprove={handleApprove}
        onRequestChanges={() => setChangesModalOpen(true)}
        onReject={() => setRejectModalOpen(true)}
        onOpenTrialModal={() => setTrialModalOpen(true)}
        onAskToReRegister={handleAskToReRegister}
        demoLoading={demoLoading}
        onGeneratePaymentLink={handleAgentGeneratePaymentLink}
        onRefresh={loadData}
      />

      <Dialog
        open={changesModalOpen}
        onClose={() => setChangesModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Request Changes from Applicant</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Provide clear guidance on what the business owner needs to update or provide.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Details of requested changes"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="e.g. Please upload clear registration documentation or correct shop contact details..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setChangesModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmChanges}
            disabled={!reviewNote.trim()}
          >
            Send Changes Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: 'error.main' }}>
          Reject Shop Application
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please state the reason for rejecting this shop registration.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Rejection Reason"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Ineligible category, invalid business proof..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRejectModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmReject}
            disabled={!rejectReason.trim()}
          >
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Activate Free Trial</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Trial Plan</InputLabel>
              <Select
                value={trialPlanId}
                label="Select Trial Plan"
                onChange={(e) => setTrialPlanId(e.target.value)}
              >
                <MenuItem value="">Choose plan</MenuItem>
                {plans.map((p: any) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name} - ₹{p.price}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Trial Duration (Days)"
              value={trialDays}
              onChange={(e) => setTrialDays(Math.max(1, parseInt(e.target.value) || 14))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTrialModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="success" onClick={handleConfirmTrial}>
            Start Trial ({trialDays} Days)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
