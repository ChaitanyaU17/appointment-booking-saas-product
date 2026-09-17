import React, { useState, useMemo } from "react";
import {
  Box, Typography, Button, IconButton, Collapse, Paper, Chip,
  TextField, Stack, Divider, alpha, InputAdornment
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import LinkIcon from "@mui/icons-material/Link";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const TONE: Record<string, { color: string; soft: string; border: string }> = {
  success: { color: "#5c9a6e", soft: "rgba(92, 154, 110, 0.1)", border: "#B1D3B9" },
  warning: { color: "#ed6c02", soft: "rgba(237, 108, 2, 0.1)", border: "#ffb74d" },
  error:   { color: "#d32f2f", soft: "rgba(211, 47, 47, 0.1)", border: "#ef5350" },
  info:    { color: "#659287", soft: "rgba(101, 146, 135, 0.1)", border: "#88BDA4" },
  idle:    { color: "#475569", soft: "#f8fafc", border: "#e2e8f0" },
};

const SURFACE = "#ffffff";
const PAGE_BG = "#f6f8fb";
const BORDER = "#e6e9ef";
const MUTED = "text.secondary";

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const DetailItem = ({
  icon, label, value, accent = "#475569",
}: {
  icon: React.ReactNode; label: string; value: React.ReactNode; accent?: string;
}) => (
  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", minWidth: 0 }}>
    <Box sx={{ width: 36, height: 36, borderRadius: 1.75, bgcolor: alpha(accent, 0.08), color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, pt: 0.25 }}>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED, lineHeight: 1}}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, mt: 0.75, color: "text.primary", wordBreak: "break-word", lineHeight: 1.35}}>
        {value}
      </Typography>
    </Box>
  </Box>
);

const StageSection = ({
  index, title, description, statusLabel, tone = "idle",
  expanded, onToggle, isLast, children,
}: {
  index: number; title: string; description?: string; statusLabel: string;
  tone?: keyof typeof TONE; expanded: boolean; onToggle: () => void;
  isLast?: boolean; children: React.ReactNode;
}) => {
  const t = TONE[tone] ?? TONE.idle;
  const isDone = tone === "success";
  const isError = tone === "error";

  return (
    <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2.5 } }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 1.5 }}>
        <Box
          sx={{
            width: 34, height: 34, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: isDone ? t.color : isError ? t.color : SURFACE,
            border: `2px solid ${isDone || isError ? t.color : t.border}`,
            color: isDone || isError ? "#fff" : t.color,
            fontWeight: 700, fontSize: 13, flexShrink: 0,
            boxShadow: isDone || isError ? `0 0 0 4px ${alpha(t.color, 0.12)}` : "none",
            transition: "all .25s ease",
          }}
        >
          {isDone ? <CheckRoundedIcon sx={{ fontSize: 18 }} /> : index}
        </Box>
        {!isLast && (
          <Box sx={{ flex: 1, width: 2, my: 1, minHeight: 32, bgcolor: isDone ? alpha(t.color, 0.3) : "#e5e9f0", borderRadius: 1, transition: "background-color .25s"}} />
        )}
      </Box>

      <Paper
        elevation={0}
        sx={{
          flex: 1, minWidth: 0, mb: isLast ? 0 : 2.5,
          border: "1px solid",
          borderColor: expanded ? alpha(t.color, 0.4) : BORDER,
          borderRadius: 2.5, overflow: "hidden",
          bgcolor: SURFACE,
          transition: "border-color .2s, box-shadow .2s",
          boxShadow: expanded ? `0 8px 24px -12px ${alpha(t.color, 0.25)}` : "0 1px 2px rgba(15,23,42,0.03)",
        }}
      >
        <Box
          onClick={onToggle}
          sx={{ display: "flex", alignItems: "center", gap: 1.5, p: { xs: 2, sm: 2.5 }, cursor: "pointer", "&:hover": { bgcolor: "#fafbfd" }}}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.25, color: "text.primary" }}>
              {title}
            </Typography>
            {description && (
              <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.5, lineHeight: 1.4 }}>
                {description}
              </Typography>
            )}
          </Box>

          <Chip
            label={statusLabel}
            size="small"
            sx={{ height: 24, fontWeight: 700, fontSize: 10, letterSpacing: 0.5, bgcolor: t.soft, color: t.color, border: `1px solid ${t.border}`, "& .MuiChip-label": { px: 1.25 }}}
          />
          <IconButton size="small" sx={{ color: MUTED }}>
            <ExpandMoreIcon sx={{ fontSize: 20, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s"}} />
          </IconButton>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ borderColor: "#f1f4f9" }} />
          <Box sx={{ p: { xs: 2, sm: 2.5 } }}>{children}</Box>
        </Collapse>
      </Paper>
    </Box>
  );
};

const TimelineItem = ({
  done, error, active, title, caption, isLast,
}: {
  done?: boolean; error?: boolean; active?: boolean;
  title: string; caption: string; isLast?: boolean;
}) => {
  const color = error ? "#dc2626" : done ? "#5c9a6e" : active ? "#659287" : "#cbd5e1";
  return (
    <Box sx={{ display: "flex", gap: 1.75 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box
          sx={{
            width: 18, height: 18, borderRadius: "50%", mt: 0.15,
            display: "flex", alignItems: "center", justifyContent: "center",
            bgcolor: done || error ? color : SURFACE,
            border: `2px solid ${color}`,
            flexShrink: 0,
            boxShadow: active ? `0 0 0 4px ${alpha(color, 0.12)}` : "none",
          }}
        >
          {(done || error) && <CheckRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />}
          {active && !done && !error && (
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color }} />
          )}
        </Box>
        {!isLast && (
          <Box sx={{ flex: 1, width: 2, my: 0.5, minHeight: 14, bgcolor: done ? alpha("#5c9a6e", 0.3) : "#e9edf3" }} />
        )}
      </Box>
      <Box sx={{ pb: isLast ? 0 : 2.25 }}>
        <Typography
          sx={{
            fontSize: 13, fontWeight: 600, lineHeight: 1.3,
            color: done || error || active ? "text.primary" : MUTED,
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.25 }}>
          {caption}
        </Typography>
      </Box>
    </Box>
  );
};

interface PipelineProps {
  business: any;
  onBack: () => void;
  demoMeetLink: string;
  setDemoMeetLink: (v: string) => void;
  reviewNote: string;
  setReviewNote: (v: string) => void;
  reviewPlanId: string;
  setReviewPlanId: (v: string) => void;
  reviewVariantId: string;
  setReviewVariantId: (v: string) => void;
  plans: any[];
  onProvisionDemo: () => void;
  onMarkConducted: () => void;
  onApprove: () => void;
  onRequestChanges: () => void;
  onReject: () => void;
  onOpenTrialModal: () => void;
  onAskToReRegister: () => void;
  demoLoading: boolean;
}

const RegistrationPipeline: React.FC<PipelineProps> = ({
  business, onBack,
  demoMeetLink, setDemoMeetLink,
  reviewNote, setReviewNote,
  reviewPlanId, setReviewPlanId, reviewVariantId, setReviewVariantId,
  plans,
  onProvisionDemo, onMarkConducted, onApprove, onRequestChanges,
  onReject, onOpenTrialModal, onAskToReRegister, demoLoading,
}) => {
  const isDemoProvided = business?.demoStatus === "Provided" || business?.demoStatus === "Conducted";
  const isDemoConducted = business?.demoStatus === "Conducted";
  const isApproved = business?.verificationStatus === "Approved";
  const isRejected = business?.verificationStatus === "Rejected";
  const isChangesRequested = business?.verificationStatus === "ChangesRequested";

  const activeStep = useMemo(() => {
    if (isApproved || isRejected || isChangesRequested) return 5;
    if (isDemoConducted) return reviewPlanId ? 5 : 4;
    if (isDemoProvided) return 3;
    return 2;
  }, [isApproved, isRejected, isChangesRequested, isDemoConducted, isDemoProvided, reviewPlanId]);

  const [expanded, setExpanded] = useState<number | false>(activeStep);
  const [isChangingPlan, setIsChangingPlan] = useState<boolean>(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponInput, setCouponInput] = useState<string>("");
  const [gstRate, setGstRate] = useState<number>(18);

  React.useEffect(() => {
    setExpanded(activeStep);
  }, [activeStep, business?._id]);

  if (!business) return null;

 const toggle = (step: number) => setExpanded((prev) => (prev === step ? false : step));

  const completedCount =
    1 +
    (reviewPlanId ? 1 : 0) +
    (isDemoProvided ? 1 : 0) +
    (isDemoConducted ? 1 : 0) +
    (isApproved || isRejected || isChangesRequested ? 1 : 0);
  const progressPct = Math.round((completedCount / 5) * 100);

  const overall = isApproved
    ? { label: "Approved", tone: "success" as const }
    : isRejected
    ? { label: "Rejected", tone: "error" as const }
    : isChangesRequested
    ? { label: "Changes Requested", tone: "warning" as const }
    : isDemoConducted
    ? { label: "Awaiting Decision", tone: "info" as const }
    : isDemoProvided
    ? { label: "Demo Scheduled", tone: "info" as const }
    : { label: "Awaiting Demo", tone: "warning" as const };

  const overallTone = TONE[overall.tone];

  const R = 52;
  const CIRC = 2 * Math.PI * R;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: PAGE_BG, pb: 8 }}>
      <Box
        sx={{
          position: "sticky", top: 0, zIndex: 20,
          bgcolor: alpha(SURFACE, 0.85),
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 4 }, py: 1.75, display: "flex", alignItems: "center", gap: 2}} >
          <IconButton
            onClick={onBack}
            size="small"
            sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, width: 36, height: 36, color: "text.primary", "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" }}}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16.5, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2, color: "text.primary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {business.name}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.25 }}>
              Onboarding Pipeline · {business.category || "Uncategorised"}
            </Typography>
          </Box>

          <Chip
            label={overall.label}
            size="small"
            sx={{ height: 26, fontWeight: 700, fontSize: 11, letterSpacing: 0.3, bgcolor: overallTone.soft, color: overallTone.color, border: `1px solid ${overallTone.border}`}}
          />
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 4 }, pt: 4 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 320px" }, gap: 3, alignItems: "start"}}>
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED}}>
                Registration Workflow
              </Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, mt: 0.5, color: "text.primary" }}>
                Onboarding Stages
              </Typography>
            </Box>

            
            
            
            <StageSection
              index={1}
              title="Registration Details"
              description="Business owner submitted their profile"
              statusLabel="COMPLETED"
              tone="success"
              expanded={expanded === 1}
              onToggle={() => toggle(1)}
            >
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5}}>
                <DetailItem
                  icon={<BusinessIcon sx={{ fontSize: 18 }} />}
                  label="Business / Category"
                  value={`${business.name} · ${business.category || "—"}`}
                  accent="#659287"
                />
                <DetailItem
                  icon={<EmailIcon sx={{ fontSize: 18 }} />}
                  label="Email"
                  value={business.email || "—"}
                  accent="#0891b2"
                />
                <DetailItem
                  icon={<PhoneIcon sx={{ fontSize: 18 }} />}
                  label="Phone / Owner"
                  value={`${business.phone || "—"} · ${business.ownerName || "—"}`}
                  accent="#5c9a6e"
                />
                <DetailItem
                  icon={<BadgeIcon sx={{ fontSize: 18 }} />}
                  label="Registration Number"
                  value={business.registrationNumber || "—"}
                  accent="#d97706"
                />
                <DetailItem
                  icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} />}
                  label="Requested Plan"
                  value={business.requestedPlanId?.name || "No plan requested"}
                  accent="#7c3aed"
                />
                <DetailItem
                  icon={<CalendarTodayRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Submitted On"
                  value={formatDate(business.createdAt)}
                  accent="#475569"
                />
              </Box>
            </StageSection>

            <StageSection
              index={2}
              title="Demo Provisioning"
              description="Generate a sandbox account and share the Meet link"
              statusLabel={isDemoProvided ? "COMPLETED" : "PENDING"}
              tone={isDemoProvided ? "success" : "warning"}
              expanded={expanded === 2}
              onToggle={() => toggle(2)}
            >
              {!isDemoProvided ? (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "#f8fafc", border: `1px dashed ${alpha("#659287", 0.35)}`}}>
                  <Typography sx={{ fontSize: 12.5, color: MUTED, mb: 2 }}>
                    Paste the Google Meet link you'll use for the onboarding call, then provision the demo sandbox.
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Google Meet Link"
                    placeholder="https://meet.google.com/..."
                    value={demoMeetLink}
                    onChange={(e) => setDemoMeetLink(e.target.value)}
                    sx={{ mb: 2, bgcolor: SURFACE, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <VideocamOutlinedIcon sx={{ fontSize: 18, color: MUTED }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={onProvisionDemo}
                    disabled={demoLoading || !demoMeetLink}
                    sx={{textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: "none"}}
                  >
                    {demoLoading ? "Provisioning…" : "Provision Demo Sandbox"}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: TONE.success.soft, border: `1px solid ${TONE.success.border}`}}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <CheckRoundedIcon sx={{ fontSize: 18, color: TONE.success.color }} />
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#4a6b62" }}>
                      Sandbox provisioned successfully
                    </Typography>
                  </Box>

                  <Stack spacing={1.25}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Typography sx={{ fontSize: 12.5, color: "#4a6b62", fontWeight: 600, minWidth: 130 }}>Demo Business ID</Typography>
                      <Typography sx={{ fontSize: 12.5, color: "#4a6b62", fontFamily: "monospace" }}>{business.demoBusinessId || "—"}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Typography sx={{ fontSize: 12.5, color: "#4a6b62", fontWeight: 600, minWidth: 130 }}>Meet Link</Typography>
                      <Button
                        size="small"
                        href={business.onboardingMeetLink}
                        target="_blank"
                        rel="noreferrer"
                        endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
                        sx={{ textTransform: "none", fontSize: 12.5, color: "#4a6b62", fontWeight: 600, p: 0, minWidth: 0, textDecoration: "underline"}}
                      >
                        Open meeting
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              )}
            </StageSection>

            <StageSection
              index={3}
              title="Demo Conducted"
              description="Mark the onboarding call as completed"
              statusLabel={isDemoConducted ? "COMPLETED" : isDemoProvided ? "PENDING" : "NOT STARTED"}
              tone={isDemoConducted ? "success" : isDemoProvided ? "warning" : "idle"}
              expanded={expanded === 3}
              onToggle={() => toggle(3)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", p: 2.5, borderRadius: 2, bgcolor: "#f8fafc", border: `1px solid ${BORDER}`}}>
                <EventAvailableOutlinedIcon sx={{ fontSize: 22, color: isDemoProvided ? "#d97706" : "#94a3b8" }} />
                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "text.primary" }}>
                    {isDemoConducted ? "Meeting has been marked as conducted" : "Meeting not yet conducted"}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.25 }}>
                    {isDemoProvided ? "Mark this once the onboarding call with the owner has finished." : "Provision the demo sandbox first to unlock this step."}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  disableElevation
                  disabled={!isDemoProvided || isDemoConducted}
                  onClick={onMarkConducted}
                  sx={{textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: "none"}}
                >
                  {isDemoConducted ? "Conducted ✓" : "Mark as Conducted"}
                </Button>
              </Box>
            </StageSection>

            <StageSection
              index={4}
              title="Plan Selection"
              description="Select one or more active plans to allocate to this shop."
              statusLabel={reviewPlanId ? "ASSIGNED" : "PENDING"}
              tone={reviewPlanId ? "success" : "warning"}
              expanded={expanded === 4}
              onToggle={() => toggle(4)}
            >
              {(!reviewPlanId || isChangingPlan) && (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
                  {plans.filter(p => p.isActive).map((plan: any) => {
                  const isPlanSelected = reviewPlanId === plan._id;
                  return (
                    <Box key={plan._id} sx={{ border: "2px solid", borderColor: isPlanSelected ? "#5c9a6e" : "#e2e8f0", borderRadius: 2, p: 2, cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: isPlanSelected ? "#5c9a6e" : "#cbd5e1" } }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: "text.primary" }}>{plan.name}</Typography>
                          {plan.isDefault && <Chip label="PRIMARY" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 800, bgcolor: "#5c9a6e", color: "#fff" }} />}
                        </Box>
                        {isPlanSelected && <CheckRoundedIcon sx={{ color: "#5c9a6e", fontSize: 20 }} />}
                      </Box>
                      
                      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                         <Chip label="GST: 18%" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, color: "#d97706", bgcolor: "#fef3c7" }} />
                         <Chip label="GST Excl." size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, color: "#659287", bgcolor: "rgba(101, 146, 135, 0.05)", border: "1px solid #88BDA4" }} />
                      </Box>

                      <Divider sx={{ borderStyle: "dashed", mb: 2 }} />
                      
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", mb: 1.5, textTransform: "uppercase" }}>Select Plan Variant</Typography>
                      
                      <Stack spacing={1}>
                        {plan.variants?.map((v: any) => {
                          const isVariantSelected = reviewVariantId === v._id;
                          const total = v.price * 1.18;
                          const perDay = (total / (v.durationDays || 30)).toFixed(2);
                          
                          return (
                            <Box 
                              key={v._id} 
                              onClick={(e) => { e.stopPropagation(); setReviewPlanId(plan._id); setReviewVariantId(v._id); setIsChangingPlan(false); }}
                              sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 1.5, bgcolor: isVariantSelected ? "rgba(92, 154, 110, 0.05)" : "#f8fafc", border: "1px solid", borderColor: isVariantSelected ? "#5c9a6e" : "transparent", cursor: "pointer", "&:hover": { bgcolor: isVariantSelected ? "rgba(92, 154, 110, 0.05)" : "#f1f5f9" } }}
                            >
                               <Box>
                                 <Typography sx={{ fontSize: 13, fontWeight: 700, color: isVariantSelected ? "#4a6b62" : "text.primary" }}>{v.name}</Typography>
                                 <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}>Duration: {v.durationDays} days (₹{v.price} base + ₹{(v.price * 0.18).toFixed(2)} GST)</Typography>
                               </Box>
                               <Box sx={{ textAlign: "right" }}>
                                 <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>₹{total.toFixed(0)}</Typography>
                                 <Typography sx={{ fontSize: 10, color: "text.secondary", fontWeight: 600 }}>Total + GST: ₹{total.toFixed(2)}</Typography>
                                 <Typography sx={{ fontSize: 11, color: isVariantSelected ? "#5c9a6e" : "#10b981", fontWeight: 700, mt: 0.25 }}>₹{perDay}/day</Typography>
                               </Box>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            )}

            {(() => {
              const selectedPlan = plans.find(p => p._id === reviewPlanId);
                const selectedVariant = selectedPlan?.variants?.find((v: any) => v._id === reviewVariantId) || selectedPlan?.variants?.[0];
                if (!selectedVariant) return null;
                
                const basePrice = selectedVariant.price || 0;
                const discountAmount = basePrice * (discountPercent / 100);
                const afterDiscount = basePrice - discountAmount;
                const gst = afterDiscount * (gstRate / 100);
                const total = afterDiscount + gst;
                
                return (
                  
                  <Box sx={{ bgcolor: "rgba(92, 154, 110, 0.08)", borderRadius: 2, p: 3, border: "1px solid #B1D3B9" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#4a6b62", letterSpacing: 0.5 }}>CURRENTLY SELECTED PLAN</Typography>
                      <Chip label="PENDING PAYMENT" size="small" sx={{ bgcolor: "warning.light", color: "#fff", fontWeight: 800, fontSize: 10, borderRadius: 1 }} />
                    </Box>

                    <Stack spacing={1.5}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BusinessIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>Business</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>{business.name || "N/A"}</Typography>
                      </Box>
                      
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BadgeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>Selected Plan</Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>{selectedPlan.name}</Typography>
                          <Chip label={selectedVariant.name} size="small" sx={{ height: 20, fontSize: 10, bgcolor: "rgba(92, 154, 110, 0.1)", color: "#4a6b62", fontWeight: 700, border: "1px solid #B1D3B9" }} />
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>Billing Period</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>{selectedVariant.billingCycle === 'monthly' ? '1 Month' : selectedVariant.billingCycle === 'yearly' ? '1 Year' : selectedVariant.billingCycle === 'half-yearly' ? '6 Months' : 'Custom'}</Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <EventAvailableOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography sx={{ fontSize: 13, color: "text.secondary", fontWeight: 600 }}>Total Validity</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "text.primary" }}>{selectedVariant.durationDays} Days</Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 3, borderStyle: "dashed", borderColor: "#B1D3B9" }} />

                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: "#4a6b62", mb: 2 }}>PRICE BREAKDOWN</Typography>

                    <Stack spacing={1.5} sx={{ mb: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 13, color: "text.primary", fontWeight: 600 }}>Plan Amount</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>₹{basePrice.toFixed(2)}</Typography>
                      </Box>
                      
                      {discountAmount > 0 && (
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                           <Typography sx={{ fontSize: 13, color: "#ef4444" }}>Discount (-{discountPercent}%)</Typography>
                           <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#ef4444" }}>-₹{discountAmount.toFixed(2)}</Typography>
                        </Box>
                      )}

                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 13, color: "text.primary", fontWeight: 600 }}>Subtotal</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>₹{afterDiscount.toFixed(2)}</Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 13, color: "text.primary", fontWeight: 600 }}>GST ({gstRate}% on Subtotal)</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>₹{gst.toFixed(2)}</Typography>
                      </Box>

                      <Box sx={{ display: "flex", justifyContent: "space-between", bgcolor: "rgba(92, 154, 110, 0.15)", p: 1.5, borderRadius: 1.5, border: "1px solid #B1D3B9", mt: 1 }}>
                         <Typography sx={{ fontSize: 14, color: "#4a6b62", fontWeight: 800 }}>Total Amount (incl. GST)</Typography>
                         <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#4a6b62" }}>₹{total.toFixed(2)}</Typography>
                      </Box>
                    </Stack>
                    
                    <Divider sx={{ my: 3, borderStyle: "dashed", borderColor: "#B1D3B9" }} />

                    <Typography sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 12, fontWeight: 800, color: "#4a6b62", mb: 2 }}>
                       <ConfirmationNumberOutlinedIcon sx={{ fontSize: 16 }} /> COUPON CODES (OPTIONAL)
                    </Typography>
                    
                    <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
                       <TextField size="small" placeholder="Coupon Code 1" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} sx={{ flex: 1, bgcolor: "#fff", "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }} />
                       <TextField size="small" placeholder="Coupon Code 2" disabled sx={{ flex: 1, bgcolor: "#f8fafc", "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }} />
                       <Button variant="contained" disableElevation onClick={() => { if(couponInput.toLowerCase() === 'welcome50') { setDiscountPercent(50); } else if(couponInput) { alert('Invalid Coupon'); } }} sx={{ bgcolor: "#cbd5e1", color: "text.secondary", fontWeight: 700, borderRadius: 1.5, px: 3, "&:hover": { bgcolor: "#94a3b8", color: "#fff" } }}>Apply</Button>
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                      <Button variant="outlined" size="small" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, bgcolor: "#fff", borderColor: "#f59e0b", color: "#d97706", '&:hover': { bgcolor: '#fef3c7', borderColor: "#f59e0b" } }}>
                         <LinkIcon sx={{ fontSize: 16, mr: 0.5 }} /> Send Payment Link (Email & WA)
                      </Button>
                      <Button variant="outlined" color="info" size="small" sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, bgcolor: "#fff", borderColor: "#659287", color: "#659287", '&:hover': { bgcolor: 'rgba(101, 146, 135, 0.05)' } }}>
                         <ContentCopyIcon sx={{ fontSize: 16, mr: 0.5 }} /> Copy Payment Link
                      </Button>
                      <Button variant="contained" color="success" size="small" disableElevation onClick={() => alert("Payment logic will be implemented in the next iteration.")} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, bgcolor: "#5c9a6e", "&:hover": { bgcolor: "#4a6b62" } }}>
                         <CreditCardIcon sx={{ fontSize: 16, mr: 0.5 }} /> Collect Payment Now
                      </Button>
                    </Box>

                    <Box sx={{ mt: 4 }}>
                      {!isChangingPlan ? (
                        <Button variant="outlined" color="info" size="small" onClick={() => setIsChangingPlan(true)} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, bgcolor: "#fff", borderColor: "#659287", color: "#659287" }}>
                           <AutorenewIcon sx={{ fontSize: 18, mr: 0.5 }} /> Change Plan
                        </Button>
                      ) : (
                        <Button variant="outlined" color="error" size="small" onClick={() => setIsChangingPlan(false)} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, bgcolor: "#fff" }}>
                           <AutorenewIcon sx={{ fontSize: 18, mr: 0.5 }} /> Cancel Change
                        </Button>
                      )}
                    </Box>
                  </Box>
                );
              })()}
            </StageSection>


            <StageSection
              index={5}
              title="Verification & Decision"
              description="Review the application and take action"
              statusLabel={
                isApproved ? "APPROVED"
                : isRejected ? "REJECTED"
                : isChangesRequested ? "CHANGES REQ."
                : isDemoConducted ? "PENDING"
                : "NOT STARTED"
              }
              tone={
                isApproved ? "success"
                : isRejected ? "error"
                : isChangesRequested ? "warning"
                : isDemoConducted ? "warning"
                : "idle"
              }
              expanded={expanded === 5}
              onToggle={() => toggle(5)}
              isLast
            >
              <Stack spacing={2.5}>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Decision Notes / Changes Requested"
                  placeholder="Required for rejection or when requesting changes…"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />

                <Divider sx={{ borderColor: "#f1f4f9" }} />

                <Box>
                  <Typography sx={{fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED, mb: 1.5,}}>
                    Decision
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1.25}
                    useFlexGap
                    sx={{ mb: 1.5, flexWrap: "wrap" }}
                  >
                    <Button
                      variant="contained"
                      disableElevation
                      color="success"
                      onClick={onApprove}
                      disabled={!isDemoConducted}
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: "none" }}
                    >
                      Approve Shop
                    </Button>
                    <Button
                      variant="contained"
                      disableElevation
                      onClick={onOpenTrialModal}
                      disabled={!isDemoConducted}
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: "none" }}
                    >
                      Activate Trial
                    </Button>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={onRequestChanges}
                      disabled={!isDemoConducted}
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5 }}
                    >
                      Request Changes
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={onReject}
                      disabled={!isDemoConducted}
                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5 }}
                    >
                      Reject Shop
                    </Button>
                  </Stack>

                  <Button
                    variant="text"
                    size="small"
                    onClick={onAskToReRegister}
                    sx={{textTransform: "none", fontWeight: 600, color: MUTED, "&:hover": { color: "#dc2626", bgcolor: alpha("#dc2626", 0.06) }}}
                  >
                    Ask to Re-Register
                  </Button>
                </Box>
              </Stack>
            </StageSection>
          </Box>

          <Box sx={{ position: { md: "sticky" }, top: { md: 88 }, alignSelf: "start" }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: "0 1px 2px rgba(15,23,42,0.03)",}}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pb: 3 }}>
                <Box sx={{ position: "relative", width: 128, height: 128 }}>
                  <svg width="128" height="128" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={R} fill="none" stroke="#eef2f7" strokeWidth="9" />
                    <circle
                      cx="64" cy="64" r={R} fill="none"
                      stroke="#659287" strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={CIRC * (1 - progressPct / 100)}
                      transform="rotate(-90 64 64)"
                      style={{ transition: "stroke-dashoffset .6s ease" }}
                    />
                  </svg>
                  <Box sx={{position: "absolute", inset: 0,display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",}}>
                    <Typography sx={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1, color: "text.primary" }}>
                      {progressPct}%
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: MUTED, mt: 0.5, fontWeight: 600, letterSpacing: 0.4 }}>
                      COMPLETE
                    </Typography>
                  </Box> 
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#f1f4f9" }} />

              <Box sx={{ pt: 3 }}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: MUTED, mb: 2,}}>
                  Onboarding Progress
                </Typography>

                <Stack spacing={0}>
                  <TimelineItem
                    done
                    title="Registration Received"
                    caption={`Submitted ${formatDate(business.createdAt)}`}
                  />
                  <TimelineItem
                    done={isDemoProvided}
                    active={!isDemoProvided}
                    title="Demo Sandbox Provisioned"
                    caption={isDemoProvided ? "Sandbox ready" : "Awaiting provisioning"}
                  />
                  <TimelineItem
                    done={isDemoConducted}
                    active={isDemoProvided && !isDemoConducted}
                    title="Meeting Conducted"
                    caption={isDemoConducted ? "Call completed" : "Not yet conducted"}
                  />
                  <TimelineItem
                    done={!!reviewPlanId}
                    active={isDemoConducted && !reviewPlanId}
                    title="Plan Selected"
                    caption={reviewPlanId ? "Plan allocated" : "Awaiting allocation"}
                  />
                  <TimelineItem
                    done={isApproved || isRejected || isChangesRequested}
                    error={isRejected}
                    active={!!reviewPlanId && isDemoConducted && !isApproved && !isRejected && !isChangesRequested}
                    title={
                      isApproved ? "Verification Approved"
                      : isRejected ? "Verification Rejected"
                      : isChangesRequested ? "Changes Requested"
                      : "Verification Decision"
                    }
                    caption={
                      isApproved || isRejected || isChangesRequested
                        ? "Decision recorded"
                        : "Pending review"
                    }
                    isLast
                  />
                </Stack>
              </Box>

              <Divider sx={{ borderColor: "#f1f4f9", my: 2.5 }} />
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontSize: 11.5, color: MUTED }}>Requested Plan</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary", textAlign: "right" }}>
                    {business.requestedPlanId?.name || "—"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontSize: 11.5, color: MUTED }}>Owner</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary", textAlign: "right" }}>
                    {business.ownerName || "—"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontSize: 11.5, color: MUTED }}>Demo Status</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary", textAlign: "right" }}>
                    {business.demoStatus || "Not Started"}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RegistrationPipeline;