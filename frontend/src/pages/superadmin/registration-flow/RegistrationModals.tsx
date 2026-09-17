import React from "react";
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem,
  Paper, Tooltip, Divider, IconButton, Stack, Avatar, List, ListItem, ListItemText,
  InputAdornment, Alert
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VideocamIcon from "@mui/icons-material/Videocam";
import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import Chip from "@mui/material/Chip";

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

interface RegistrationModalsProps {
  reviewModalOpen: boolean;
  setReviewModalOpen: (open: boolean) => void;
  selectedReviewBiz: any;
  reviewNote: string;
  setReviewNote: (note: string) => void;
  reviewPlanId: string;
  setReviewPlanId: (id: string) => void;
  demoMeetLink: string;
  setDemoMeetLink: (link: string) => void;
  demoLoading: boolean;
  plans: any[];
  trialModalOpen: boolean;
  setTrialModalOpen: (open: boolean) => void;
  trialDays: number;
  setTrialDays: (days: number) => void;
  trialPlanId: string;
  setTrialPlanId: (id: string) => void;
  
  handleCreateDemo: () => void;
  handleMarkDemoConducted: () => void;
  handleApprove: () => void;
  handleRequestChanges: () => void;
  handleReject: () => void;
  handleAskToReRegister: () => void;
  handleActivateTrial: () => void;
}

const RegistrationModals: React.FC<RegistrationModalsProps> = ({
  reviewModalOpen, setReviewModalOpen, selectedReviewBiz,
  reviewNote, setReviewNote, reviewPlanId, setReviewPlanId,
  demoMeetLink, setDemoMeetLink, demoLoading, plans,
  trialModalOpen, setTrialModalOpen, trialDays, setTrialDays,
  trialPlanId, setTrialPlanId,
  handleCreateDemo, handleMarkDemoConducted, handleApprove,
  handleRequestChanges, handleReject, handleAskToReRegister, handleActivateTrial
}) => {

  const renderBusinessInfo = () => (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: "100%" }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "text.secondary" }}>
        BUSINESS INFORMATION
      </Typography>

      <Stack spacing={2}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Avatar sx={{ bgcolor: "primary.light", width: 36, height: 36 }}>
            <BusinessIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary">Business Name</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedReviewBiz?.name || "—"}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Avatar sx={{ bgcolor: "info.light", width: 36, height: 36 }}>
            <EmailIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary">Email</Typography>
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>{selectedReviewBiz?.email || "—"}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Avatar sx={{ bgcolor: "success.light", width: 36, height: 36 }}>
            <PhoneIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary">Phone</Typography>
            <Typography variant="body2">{selectedReviewBiz?.phone || "—"}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Avatar sx={{ bgcolor: "warning.light", width: 36, height: 36 }}>
            <BadgeIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="caption" color="text.secondary">Registration Number</Typography>
            <Typography variant="body2">{selectedReviewBiz?.registrationNumber || "—"}</Typography>
          </Box>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5 }} />

      <Stack spacing={1.5}>
        <Box>
          <Typography variant="caption" color="text.secondary">Category</Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip label={selectedReviewBiz?.category || "General"} size="small" variant="outlined" />
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Requested Plan</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {selectedReviewBiz?.requestedPlanId?.name || "No plan requested"}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Submitted</Typography>
          <Typography variant="body2">{formatDate(selectedReviewBiz?.createdAt)}</Typography>
        </Box>
      </Stack>
    </Paper>
  );

  const renderStateBanner = () => {
    const status = selectedReviewBiz?.demoStatus;
    if (status === "None") {
      return (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <strong>Awaiting Demo.</strong> Provision a demo sandbox for this business before making a decision.
        </Alert>
      );
    }
    if (status === "Provided") {
      return (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          <strong>Demo Provisioned.</strong> Waiting for the onboarding meeting to be conducted.
        </Alert>
      );
    }
    return (
      <Alert severity="success" sx={{ borderRadius: 2 }}>
        <strong>Demo Conducted.</strong> This business is ready for a final decision.
      </Alert>
    );
  };

  const renderActionPanel = () => {
    const status = selectedReviewBiz?.demoStatus;

    if (status === "None") {
      return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
            PROVISION DEMO
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            This will temporarily point the business's account to a fully-configured demo environment with sample data.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Onboarding Meet Link"
            variant="outlined"
            sx={{ mb: 2 }}
            value={demoMeetLink}
            onChange={(e) => setDemoMeetLink(e.target.value)}
            placeholder="https://meet.google.com/..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <VideocamIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleCreateDemo}
            disabled={demoLoading}
            startIcon={<PlayCircleOutlinedIcon />}
          >
            {demoLoading ? "Creating Demo..." : "Create Demo Account"}
          </Button>
        </Paper>
      );
    }

    if (status === "Provided") {
      return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
            DEMO PROVISIONED
          </Typography>
          <Box sx={{ p: 2, bgcolor: "#f0fdf4", borderRadius: 1.5, border: "1px solid #bbf7d0", mb: 2 }}>
            <Typography sx={{ color: "#166534", fontWeight: 600, display: "flex", alignItems: "center", gap: 0.5 }}>
              <CheckCircleIcon fontSize="small" /> Demo sandbox is active.
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, color: "#166534" }}>
              The business can log in with their existing credentials to explore the demo environment.
            </Typography>
          </Box>

          {selectedReviewBiz?.onboardingMeetLink && (
            <Box sx={{ p: 1.5, bgcolor: "#f8fafc", borderRadius: 1.5, border: "1px solid #e2e8f0", mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", display: "block", mb: 0.5 }}>
                ASSIGNED MEET LINK
              </Typography>
              <a
                href={selectedReviewBiz.onboardingMeetLink}
                target="_blank"
                rel="noreferrer"
                style={{ wordBreak: "break-all", fontSize: 13 }}
              >
                {selectedReviewBiz.onboardingMeetLink}
              </a>
            </Box>
          )}

          <Button
            fullWidth
            variant="contained"
            color="success"
            onClick={handleMarkDemoConducted}
            startIcon={<CheckCircleIcon />}
          >
            Mark Meeting as Conducted
          </Button>
        </Paper>
      );
    }

    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "text.secondary" }}>
          FINAL DECISION
        </Typography>

        <TextField
          select
          fullWidth
          size="small"
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
          size="small"
          multiline
          rows={3}
          label="Note / Reason (for Rejection/Changes)"
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Stack spacing={1.25}>
          <Button variant="contained" color="success" onClick={handleApprove} startIcon={<CheckCircleIcon />}>
            Approve Business
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setTrialModalOpen(true)}
          >
            {selectedReviewBiz?.trialStatus === "Active" ? "Trial Active ✓" : "Activate Trial"}
          </Button>

          <Button variant="outlined" color="warning" onClick={handleRequestChanges}>
            Request Changes
          </Button>

          <Button variant="outlined" color="error" onClick={handleReject}>
            Reject
          </Button>

          <Tooltip
            title={
              selectedReviewBiz?.verificationStatus === "Approved"
                ? "Cannot re-register an already approved business"
                : "Deletes the application so they can start over"
            }
          >
            <span>
              <Button
                fullWidth
                variant="text"
                color="error"
                onClick={handleAskToReRegister}
                disabled={selectedReviewBiz?.verificationStatus === "Approved"}
              >
                Ask to Re-register
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </Paper>
    );
  };

  return (
    <>
      <Dialog
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pr: 1 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Review Registration
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedReviewBiz?.name}
            </Typography>
          </Box>
          <IconButton onClick={() => setReviewModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ p: 3 }}>
          {selectedReviewBiz && (
            <Stack spacing={3}>
              {renderStateBanner()}

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                {renderBusinessInfo()}
                {renderActionPanel()}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
                  ACTIVITY
                </Typography>
                <List dense sx={{ bgcolor: "#f8fafc", borderRadius: 2, py: 0.5 }}>
                  <ListItem>
                    <ListItemText
                      primary="Registration submitted"
                      secondary={formatDate(selectedReviewBiz.createdAt)}
                    />
                  </ListItem>
                  {selectedReviewBiz.demoStatus !== "None" && (
                    <ListItem>
                      <ListItemText
                        primary="Demo sandbox provisioned"
                        secondary={selectedReviewBiz.onboardingMeetLink || "Meet link assigned"}
                      />
                    </ListItem>
                  )}
                  {selectedReviewBiz.demoStatus === "Conducted" && (
                    <ListItem>
                      <ListItemText primary="Onboarding meeting conducted" secondary="Marked by superadmin" />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={trialModalOpen}
        onClose={() => setTrialModalOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3, minWidth: 340 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Activate Trial</DialogTitle>
        <Divider />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 3 }}>
          <TextField
            select
            label="Trial Plan"
            value={trialPlanId}
            onChange={(e) => setTrialPlanId(e.target.value)}
            fullWidth
            size="small"
          >
            {plans.map((p: any) => (
              <MenuItem key={p._id} value={p._id}>{p.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            type="number"
            label="Duration (Days)"
            value={trialDays}
            onChange={(e) => setTrialDays(Number(e.target.value))}
            fullWidth
            size="small"
          />
        </DialogContent>
        <Divider />
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Button onClick={() => setTrialModalOpen(false)}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleActivateTrial}>
            Activate Trial
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default RegistrationModals;
