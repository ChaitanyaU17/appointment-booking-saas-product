import { useAppDispatch } from "../../../hook";
import { showNotification } from "../../../features/notifications/notificationSlice";
import { fetchBusinesses, generatePaymentLink } from "../../../features/superadmin/superadminSlice";
import { validateCoupon } from "../../../features/superadmin/couponSlice";
import { Stepper, Step, StepLabel, Alert } from "@mui/material";
import React, { useState, useMemo } from "react";
import {
  Box, Typography, Button, IconButton, Collapse, Paper, Chip,
  TextField, Stack, Divider, alpha, InputAdornment, Grid, CircularProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BusinessIcon from "@mui/icons-material/Business";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
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
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { ACCENT, ACCENT_DARK } from '../../../theme/colors';

const TONE: Record<string, { color: string; soft: string; border: string }> = {
  success: { color: "#659287", soft: "rgba(101, 146, 135, 0.1)", border: "#88BDA4" },
  warning: { color: "#ed6c02", soft: "rgba(237, 108, 2, 0.1)", border: "#ffb74d" },
  error:   { color: "#d32f2f", soft: "rgba(211, 47, 47, 0.1)", border: "#ef5350" },
  info:    { color: "#659287", soft: "rgba(101, 146, 135, 0.1)", border: "#88BDA4" },
  idle:    { color: "#475569", soft: "#f8fafc", border: "#e2e8f0" },
};

import { SURFACE, BORDER } from '../../../theme/colors';
const PAGE_BG = '#f6f8fb';
const MUTED = "text.secondary";

const formatDate = (date?: string) => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const DetailItem = ({ icon, label, value, accent = "#475569" }: { icon: React.ReactNode; label: string; value: React.ReactNode; accent?: string }) => (
  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", minWidth: 0 }}>
    <Box sx={{ width: 36, height: 36, borderRadius: 1.75, bgcolor: alpha(accent, 0.08), color: accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</Box>
    <Box sx={{ minWidth: 0, pt: 0.25 }}>
      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED, lineHeight: 1 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13.5, fontWeight: 600, mt: 0.75, color: "text.primary", wordBreak: "break-word", lineHeight: 1.35 }}>{value}</Typography>
    </Box>
  </Box>
);


const CouponTicket = ({
  coupon,
  onRemove,
}: {
  coupon: any;
  onRemove: () => void;
}) => {
  const discountLabel =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `₹${coupon.discountValue} OFF`;

  return (
    <Box
      sx={{ position: "relative", display: "inline-flex", alignItems: "center", minHeight: 44, borderRadius: 1.25, background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`, color: "#fff", pl: 3, pr: 3.5, py: 0.75, gap: 1.25, overflow: "visible", boxShadow: "0 4px 12px -6px rgba(15,23,42,0.25), 0 1px 2px rgba(15,23,42,0.06)",
        "&::before": { content: '""', position: "absolute", left: -7, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", bgcolor: SURFACE },
        "&::after": { content: '""', position: "absolute", right: -7, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, borderRadius: "50%", bgcolor: SURFACE },
      }}
    >
      <Box sx={{ position: "absolute", inset: "4px", border: "1px dashed rgba(255,255,255,0.45)", borderRadius: 0.75, pointerEvents: "none" }} />
      <Box
        sx={{ position: "absolute", left: 24, top: 8, bottom: 8, width: 0, borderLeft: "1px dashed rgba(255,255,255,0.4)" }} />
      <ConfirmationNumberOutlinedIcon sx={{ fontSize: 15, opacity: 0.9, position: "relative", zIndex: 1 }} />
      <Typography sx={{ fontFamily: '"SF Mono", "Roboto Mono", monospace', fontWeight: 800, fontSize: 12.5, letterSpacing: 1, textTransform: "uppercase", position: "relative", zIndex: 1, whiteSpace: "nowrap" }} >
        {coupon.code}
      </Typography>

      <Box sx={{ display: "inline-flex", alignItems: "center", px: 0.85, py: 0.15, borderRadius: 0.75, bgcolor: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", position: "relative", zIndex: 1 }} >
        <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: 0.5, whiteSpace: "nowrap" }} >
          {discountLabel}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={onRemove}
        sx={{ position: "absolute", right: -10, top: -10, width: 22, height: 22, bgcolor: "#fff", color: "#475569", border: `1px solid ${BORDER}`, boxShadow: "0 1px 2px rgba(15,23,42,0.08)", transition: "all .18s ease",
          "&:hover": { bgcolor: "#fef2f2", color: "#dc2626", borderColor: "#fecaca" },
        }}
      >
        <CloseRoundedIcon sx={{ fontSize: 12 }} />
      </IconButton>
    </Box>
  );
};

const StageSection = ({ index, title, description, statusLabel, tone = "idle", expanded, onToggle, isLast, children }: { index: number; title: string; description?: string; statusLabel: string; tone?: keyof typeof TONE; expanded: boolean; onToggle: () => void; isLast?: boolean; children: React.ReactNode }) => {
  const t = TONE[tone] ?? TONE.idle;
  const isDone = tone === "success";
  const isError = tone === "error";

  return (
    <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2.5 } }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 1.5 }}>
        <Box sx={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: isDone ? t.color : isError ? t.color : SURFACE, border: `2px solid ${isDone || isError ? t.color : t.border}`, color: isDone || isError ? "#fff" : t.color, fontWeight: 700, fontSize: 13, flexShrink: 0, boxShadow: isDone || isError ? `0 0 0 4px ${alpha(t.color, 0.12)}` : "none", transition: "all .25s ease" }}>
          {isDone ? <CheckRoundedIcon sx={{ fontSize: 18 }} /> : index}
        </Box>
        {!isLast && <Box sx={{ flex: 1, width: 2, my: 1, minHeight: 32, bgcolor: isDone ? alpha(t.color, 0.3) : "#e5e9f0", borderRadius: 1, transition: "background-color .25s" }} />}
      </Box>

      <Paper elevation={0} sx={{ flex: 1, minWidth: 0, mb: isLast ? 0 : 2.5, border: "1px solid", borderColor: expanded ? alpha(t.color, 0.4) : BORDER, borderRadius: 2.5, overflow: "hidden", bgcolor: SURFACE, transition: "border-color .2s, box-shadow .2s", boxShadow: expanded ? `0 8px 24px -12px ${alpha(t.color, 0.25)}` : "0 1px 2px rgba(15,23,42,0.03)" }}>
        <Box onClick={onToggle} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: { xs: 2, sm: 2.5 }, cursor: "pointer", "&:hover": { bgcolor: "#fafbfd" } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.25, color: "text.primary" }}>{title}</Typography>
            {description && <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.5, lineHeight: 1.4 }}>{description}</Typography>}
          </Box>

          <Chip label={statusLabel} size="small" sx={{ height: 24, fontWeight: 700, fontSize: 10, letterSpacing: 0.5, bgcolor: t.soft, color: t.color, border: `1px solid ${t.border}`, "& .MuiChip-label": { px: 1.25 } }} />
          <IconButton size="small" sx={{ color: MUTED }}>
            <ExpandMoreIcon sx={{ fontSize: 20, transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform .2s" }} />
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

const TimelineItem = ({ done, error, active, title, caption, isLast }: { done?: boolean; error?: boolean; active?: boolean; title: string; caption: string; isLast?: boolean }) => {
  const color = error ? "#dc2626" : done ? "#659287" : active ? "#659287" : "#cbd5e1";
  return (
    <Box sx={{ display: "flex", gap: 1.75 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Box sx={{ width: 18, height: 18, borderRadius: "50%", mt: 0.15, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: done || error ? color : SURFACE, border: `2px solid ${color}`, flexShrink: 0, boxShadow: active ? `0 0 0 4px ${alpha(color, 0.12)}` : "none" }}>
          {(done || error) && <CheckRoundedIcon sx={{ fontSize: 12, color: "#fff" }} />}
          {active && !done && !error && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color }} />}
        </Box>
        {!isLast && <Box sx={{ flex: 1, width: 2, my: 0.5, minHeight: 14, bgcolor: done ? alpha("#659287", 0.3) : "#e9edf3" }} />}
      </Box>
      <Box sx={{ pb: isLast ? 0 : 2.25 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, color: done || error || active ? "text.primary" : MUTED }}>{title}</Typography>
        <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.25 }}>{caption}</Typography>
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
  onAskToReRegister?: () => void;
  demoLoading: boolean;
  onGeneratePaymentLink?: (payload: { id: string; paymentBreakdown: any }) => Promise<any>;
  onRefresh?: () => void;
}

const RegistrationPipeline: React.FC<PipelineProps> = ({
  business, onBack,
  demoMeetLink, setDemoMeetLink,
  reviewNote, setReviewNote,
  reviewPlanId, setReviewPlanId, reviewVariantId, setReviewVariantId,
  plans,
  onProvisionDemo, onMarkConducted, onApprove, onRequestChanges,
  onReject, onOpenTrialModal, onAskToReRegister, demoLoading,
  onGeneratePaymentLink, onRefresh,
}) => {
  const isDemoProvided = business?.demoStatus === "Provided" || business?.demoStatus === "Conducted";
  const isDemoConducted = business?.demoStatus === "Conducted";
  const isApproved = business?.verificationStatus === "Approved";
  const isRejected = business?.verificationStatus === "Rejected";
  const isChangesRequested = business?.verificationStatus === "ChangesRequested";
  const isPaid = business?.paymentStatus === "Paid";

  const activeStep = useMemo(() => {
    if (isApproved || isRejected || isChangesRequested || isPaid) return 5;
    if (isDemoConducted) return reviewPlanId ? 5 : 4;
    if (isDemoProvided) return 3;
    return 2;
  }, [isApproved, isRejected, isChangesRequested, isPaid, isDemoConducted, isDemoProvided, reviewPlanId]);

  const [expanded, setExpanded] = useState<number | false>(activeStep);
  const [isChangingPlan, setIsChangingPlan] = useState<boolean>(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [appliedCoupons, setAppliedCoupons] = useState<any[]>([]);
  const dispatch = useAppDispatch();
  const [gstRate, setGstRate] = useState<number>(18);
  const [couponInput, setCouponInput] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(
    business?.paymentBreakdown?.startDate ? new Date(business.paymentBreakdown.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(() => {
    if (business?.paymentBreakdown?.endDate) {
      return new Date(business.paymentBreakdown.endDate).toISOString().split('T')[0];
    }
    return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  });

  const [couponApplying, setCouponApplying] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const handleGeneratePaymentLink = async () => {
    try {
      const sp = plans.find((p: any) => p._id === reviewPlanId);
      if (!sp) return;
      const sv = sp?.variants?.find((v: any) => v._id === reviewVariantId);
      const basePrice = sv ? sv.price : sp.price;

      const platformDiscountAmount = basePrice * (discountPercent / 100);
      let couponDiscountAmount = 0;
      let couponCodes: string[] = [];

      if (appliedCoupons.length > 0) {
        appliedCoupons.forEach(coupon => {
          let amt = coupon.discountType === 'percentage' ? (basePrice * coupon.discountValue) / 100 : coupon.discountValue;
          if (coupon.maxDiscountAmount && amt > coupon.maxDiscountAmount) amt = coupon.maxDiscountAmount;
          couponDiscountAmount += amt;
        });
        couponCodes = appliedCoupons.map(c => c.code);
      } else if (business?.paymentBreakdown?.planId === reviewPlanId && business?.paymentBreakdown?.planVariantId === reviewVariantId) {
        couponDiscountAmount = business?.paymentBreakdown?.couponDiscountAmount || 0;
        couponCodes = business?.paymentBreakdown?.couponCodes || [];
      }

      const discountAmount = platformDiscountAmount + couponDiscountAmount;
      const afterDiscount = Math.max(0, basePrice - discountAmount);
      const gstAmount = afterDiscount * (gstRate / 100);
      const totalAmount = afterDiscount + gstAmount;
      const isAlreadyPaid = business?.paymentStatus === 'Paid';
      const previouslyPaid = isAlreadyPaid ? (business?.paymentBreakdown?.totalAmount || 0) : 0;
      const netPayable = isAlreadyPaid ? totalAmount - previouslyPaid : totalAmount;
      const finalPayable = Math.max(0, netPayable);
      const paymentBreakdown = { planId: reviewPlanId, planVariantId: reviewVariantId, planName: sp.name, basePrice, discountAmount, platformDiscountAmount, couponDiscountAmount, gstAmount, totalAmount: finalPayable, couponCodes, originalTotal: totalAmount, startDate, endDate };

      let resultAction: any;
      if (onGeneratePaymentLink) {
        resultAction = await onGeneratePaymentLink({ id: business._id, paymentBreakdown });
      } else {
        resultAction = await dispatch(generatePaymentLink({ id: business._id, paymentBreakdown }));
      }
      if (resultAction && (resultAction.type?.endsWith('/fulfilled') || (generatePaymentLink?.fulfilled && generatePaymentLink.fulfilled.match(resultAction)))) {
        const payload = resultAction.payload || {};
        const payloadStr = payload.paymentLink || payload.paymentUrl || "";
        const urlToCopy = payloadStr.startsWith('http') ? payloadStr : window.location.origin + payloadStr;
        try {
          navigator.clipboard.writeText(urlToCopy);
        } catch(e) {
          console.log("Clipboard write failed:", e);
        }
        dispatch(showNotification({ message: payload.emailSent ? 'Payment link generated, copied, and emailed to user!' : 'Payment link generated and copied to clipboard!' }));
        if (onRefresh) {
          onRefresh();
        } else {
          dispatch(fetchBusinesses());
        }
      } else {
        dispatch(showNotification({ message: (resultAction?.payload as string) || 'Failed to generate link', failure: true }));
      }
    } catch (error: any) {
      dispatch(showNotification({ message: error.response?.data?.message || "Failed to generate link", failure: true }));
    }
  };

  const handleApplyCoupon = async (amount: number) => {
    if (!couponInput.trim()) return;
    const code = couponInput.trim().toUpperCase();
    if (appliedCoupons.find(c => c.code.toUpperCase() === code)) {
      dispatch(showNotification({ message: 'Coupon already applied', failure: true }));
      return;
    }
    setCouponApplying(true);
    try {
      const resultAction = await dispatch(validateCoupon({ code, amount }));
      if (validateCoupon.fulfilled.match(resultAction)) {
        setAppliedCoupons([...appliedCoupons, resultAction.payload]);
        setCouponInput('');
        dispatch(showNotification({ message: 'Coupon applied successfully!' }));
        setJustApplied(true);
        setTimeout(() => setJustApplied(false), 1400);
      } else {
        dispatch(showNotification({ message: resultAction.payload as string || 'Invalid coupon', failure: true }));
      }
    } catch (error: any) {
      dispatch(showNotification({ message: 'Failed to apply coupon', failure: true }));
    } finally {
      setCouponApplying(false);
    }
  };

  const handleRemoveCoupon = (code: string) => {
    setAppliedCoupons(appliedCoupons.filter(c => c.code !== code));
  };

  React.useEffect(() => {
    if (reviewPlanId && isChangingPlan) {
      const sp = plans.find((p: any) => p._id === reviewPlanId);
      const sv = sp?.variants?.find((v: any) => v._id === reviewVariantId) || sp?.variants?.[0];
      const dur = sv ? (sv.durationDays || 30) : 30;
      const bonusDays = appliedCoupons.reduce((sum, c) => sum + (c.validityBonusDays || 0), 0);
      const totalDur = dur + bonusDays;
      
      const start = startDate ? new Date(startDate) : new Date();
      start.setTime(start.getTime() + totalDur * 24 * 60 * 60 * 1000);
      setEndDate(start.toISOString().split('T')[0]);
    }
  }, [reviewPlanId, reviewVariantId, isChangingPlan, plans, appliedCoupons, startDate]);

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
      <Box sx={{ position: "sticky", top: 0, zIndex: 20, bgcolor: alpha(SURFACE, 0.85), backdropFilter: "blur(12px)", borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 4 }, py: 1.75, display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton onClick={onBack} size="small" sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, width: 36, height: 36, color: "text.primary", "&:hover": { bgcolor: "#f1f5f9", borderColor: "#cbd5e1" } }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16.5, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2, color: "text.primary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {business.name || business.ownerName || 'Applicant Registration'}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.25 }}>Onboarding Pipeline · {business.category || "Uncategorised"}</Typography>
          </Box>

          <Chip label={overall.label} size="small" sx={{ height: 26, fontWeight: 700, fontSize: 11, letterSpacing: 0.3, bgcolor: overallTone.soft, color: overallTone.color, border: `1px solid ${overallTone.border}` }} />
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 4 }, pt: 4 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 320px" }, gap: 3, alignItems: "start" }}>
          <Box>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED }}>Registration Workflow</Typography>
              <Typography sx={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4, mt: 0.5, color: "text.primary" }}>Onboarding Stages</Typography>
            </Box>

            <StageSection index={1} title="Registration Details" description="Business owner submitted their profile" statusLabel="COMPLETED" tone="success" expanded={expanded === 1} onToggle={() => toggle(1)}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <DetailItem icon={<BusinessIcon sx={{ fontSize: 18 }} />} label="Business / Category" value={`${business.name || "—"} · ${business.category || "—"}`} accent="#659287" />
                <DetailItem icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />} label="Owner Name" value={business.ownerName || "—"} accent="#059669" />
                <DetailItem icon={<EmailIcon sx={{ fontSize: 18 }} />} label="Email" value={business.email || "—"} accent="#0891b2" />
                <DetailItem icon={<PhoneIcon sx={{ fontSize: 18 }} />} label="Phone" value={business.phone || "—"} accent="#659287" />
                <DetailItem icon={<BadgeIcon sx={{ fontSize: 18 }} />} label="Registration Number" value={business.registrationNumber || "—"} accent="#d97706" />
                <DetailItem icon={<WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} />} label="Requested Plan" value={business.requestedPlanId?.name || "No plan requested"} accent="#7c3aed" />
                <DetailItem icon={<CalendarTodayRoundedIcon sx={{ fontSize: 18 }} />} label="Submitted On" value={formatDate(business.createdAt)} accent="#475569" />
                {business.additionalNotes && (
                  <Box sx={{ gridColumn: { xs: "1fr", sm: "1 / -1" }, p: 1.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", textTransform: "uppercase", mb: 0.5 }}>
                      Applicant Note / Requirements
                    </Typography>
                    <Typography sx={{ fontSize: 13.5, color: "text.primary" }}>
                      {business.additionalNotes}
                    </Typography>
                  </Box>
                )}
              </Box>
            </StageSection>

            <StageSection index={2} title="Demo Provisioning" description="Generate a sandbox account and share the Meet link" statusLabel={isDemoProvided ? "COMPLETED" : "PENDING"} tone={isDemoProvided ? "success" : "warning"} expanded={expanded === 2} onToggle={() => toggle(2)}>
              {!isDemoProvided ? (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "#f8fafc", border: `1px dashed ${alpha("#659287", 0.35)}` }}>
                  <Typography sx={{ fontSize: 12.5, color: MUTED, mb: 2 }}>Paste the Google Meet link you'll use for the onboarding call, then provision the demo sandbox.</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    label="Google Meet Link"
                    placeholder="https://meet.google.com/..."
                    value={demoMeetLink}
                    onChange={(e) => setDemoMeetLink(e.target.value)}
                    sx={{ mb: 2, bgcolor: SURFACE, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    slotProps={{ input: { startAdornment: (<InputAdornment position="start"><VideocamOutlinedIcon sx={{ fontSize: 18, color: MUTED }} /></InputAdornment>) } }}
                  />
                  <Button variant="contained" disableElevation onClick={onProvisionDemo} disabled={demoLoading || !demoMeetLink} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: "none" }}>
                    {demoLoading ? "Provisioning.." : "Provision Demo Sandbox"}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: TONE.success.soft, border: `1px solid ${TONE.success.border}` }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <CheckRoundedIcon sx={{ fontSize: 18, color: TONE.success.color }} />
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#4a6b62" }}>Sandbox provisioned successfully</Typography>
                  </Box>

                  <Stack spacing={1.25}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Typography sx={{ fontSize: 12.5, color: "#4a6b62", fontWeight: 600, minWidth: 130 }}>Demo Business ID</Typography>
                      <Typography sx={{ fontSize: 12.5, color: "#4a6b62", fontFamily: "monospace" }}>{business.demoBusinessId || "—"}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Typography sx={{ fontSize: 12.5, color: "#4a6b62", fontWeight: 600, minWidth: 130 }}>Meet Link</Typography>
                      <Button size="small" href={business.onboardingMeetLink} target="_blank" rel="noreferrer" endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />} sx={{ textTransform: "none", fontSize: 12.5, color: "#4a6b62", fontWeight: 600, p: 0, minWidth: 0, textDecoration: "underline" }}>
                        Open meeting
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              )}
            </StageSection>

            <StageSection index={3} title="Demo Conducted" description="Mark the onboarding call as completed" statusLabel={isDemoConducted ? "COMPLETED" : isDemoProvided ? "PENDING" : "NOT STARTED"} tone={isDemoConducted ? "success" : isDemoProvided ? "warning" : "idle"} expanded={expanded === 3} onToggle={() => toggle(3)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", p: 2.5, borderRadius: 2, bgcolor: "#f8fafc", border: `1px solid ${BORDER}` }}>
                <EventAvailableOutlinedIcon sx={{ fontSize: 22, color: isDemoProvided ? "#d97706" : "#94a3b8" }} />
                <Box sx={{ flex: 1, minWidth: 180 }}>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: "text.primary" }}>{isDemoConducted ? "Meeting has been marked as conducted" : "Meeting not yet conducted"}</Typography>
                  <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.25 }}>{isDemoProvided ? "Mark this once the onboarding call with the owner has finished." : "Provision the demo sandbox first to unlock this step."}</Typography>
                </Box>
                <Button variant="contained" disableElevation disabled={!isDemoProvided || isDemoConducted} onClick={onMarkConducted} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: "none" }}>
                  {isDemoConducted ? "Conducted" : "Mark as Conducted"}
                </Button>
              </Box>
            </StageSection>

            <StageSection index={4} title="Plan Selection" description="Select one or more active plans to allocate to this shop." statusLabel={reviewPlanId ? "ASSIGNED" : "PENDING"} tone={reviewPlanId ? "success" : "warning"} expanded={expanded === 4} onToggle={() => toggle(4)}>
              {(!reviewPlanId || isChangingPlan) && (
                <>
                  {business?.paymentStatus === 'Paid' && isChangingPlan && (
                    <Alert severity="warning" sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
                      Warning: This business has already paid for the {business?.paymentBreakdown?.planName || 'current'} plan. Changing the plan now will require you to manually handle refunds or send a new payment link for any price difference.
                    </Alert>
                  )}
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, mb: 3 }}>
                    {plans.filter(p => p.isActive).map((plan: any) => {
                      const isPlanSelected = reviewPlanId === plan._id;
                      return (
                        <Box key={plan._id} sx={{ border: "2px solid", borderColor: isPlanSelected ? "#659287" : "#e2e8f0", borderRadius: 2, p: 2, cursor: "pointer", transition: "all 0.2s", "&:hover": { borderColor: isPlanSelected ? "#659287" : "#cbd5e1" } }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", color: "text.primary" }}>{plan.name}</Typography>
                              {plan.isDefault && <Chip label="PRIMARY" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 800, bgcolor: "#659287", color: "#fff" }} />}
                            </Box>
                            {isPlanSelected && <CheckRoundedIcon sx={{ color: "#659287", fontSize: 20 }} />}
                          </Box>

                          <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            <Chip label="GST: 18%" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, color: "#d97706", bgcolor: "#fef3c7" }} />
                            <Chip label="GST Excl." size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, color: "#659287", bgcolor: "rgba(101, 146, 135, 0.05)", border: "1px solid #88BDA4" }} />
                          </Box>

                          <Divider sx={{ borderStyle: "dashed", mb: 2 }} />

                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", mb: 1.5, textTransform: "uppercase" }}>Select Plan Variant</Typography>

                          <Stack spacing={1}>
                            {(!plan.variants || plan.variants.length === 0) ? (
                              <Box onClick={(e) => { e.stopPropagation(); setReviewPlanId(plan._id); setReviewVariantId(''); }} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 1.5, bgcolor: reviewPlanId === plan._id ? "rgba(101, 146, 135, 0.05)" : "#f8fafc", border: "1px solid", borderColor: reviewPlanId === plan._id ? "#659287" : "transparent", cursor: "pointer", "&:hover": { bgcolor: reviewPlanId === plan._id ? "rgba(101, 146, 135, 0.05)" : "#f1f5f9" } }}>
                                <Box>
                                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: reviewPlanId === plan._id ? "#4a6b62" : "text.primary" }}>Default (No Variant)</Typography>
                                  <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}>Duration: Custom (₹{plan.price || 0} base)</Typography>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>₹{(plan.price || 0).toFixed(0)}</Typography>
                                </Box>
                              </Box>
                            ) : (
                              plan.variants?.map((v: any) => {
                                const isVariantSelected = reviewVariantId === v._id;
                                const total = v.price * 1.18;
                                const perDay = (total / (v.durationDays || 30)).toFixed(2);

                                return (
                                  <Box key={v._id} onClick={(e) => { e.stopPropagation(); setReviewPlanId(plan._id); setReviewVariantId(v._id); }} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.5, borderRadius: 1.5, bgcolor: isVariantSelected ? "rgba(101, 146, 135, 0.05)" : "#f8fafc", border: "1px solid", borderColor: isVariantSelected ? "#659287" : "transparent", cursor: "pointer", "&:hover": { bgcolor: isVariantSelected ? "rgba(101, 146, 135, 0.05)" : "#f1f5f9" } }}>
                                    <Box>
                                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: isVariantSelected ? "#4a6b62" : "text.primary" }}>{v.name}</Typography>
                                      <Typography sx={{ fontSize: 11, color: "text.secondary", mt: 0.5 }}>Duration: {v.durationDays} days (₹{v.price} base + ₹{(v.price * 0.18).toFixed(2)} GST)</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: "right" }}>
                                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>₹{total.toFixed(0)}</Typography>
                                      <Typography sx={{ fontSize: 10, color: "text.secondary", fontWeight: 600 }}>Total + GST: ₹{total.toFixed(2)}</Typography>
                                      <Typography sx={{ fontSize: 11, color: isVariantSelected ? "#659287" : "#10b981", fontWeight: 700, mt: 0.25 }}>₹{perDay}/day</Typography>
                                    </Box>
                                  </Box>
                                );
                              })
                            )}
                          </Stack>
                        </Box>
                      );
                    })}
                  </Box>
                </>
              )}

              {isChangingPlan && reviewPlanId && (
                <Box sx={{ mt: 4, pt: 4, borderTop: "1px dashed #e2e8f0" }}>
                  {(() => {
                    const sp = plans.find(p => p._id === reviewPlanId);
                    if (!sp) return null;
                    const sv = sp?.variants?.find((v: any) => v._id === reviewVariantId) || sp?.variants?.[0];

                    const basePrice = sv ? (sv.price || 0) : (sp.price || 0);
                    const durationDays = sv ? (sv.durationDays || 30) : 30;
                    const planVariantName = sv ? `${sp.name} - ${sv.name}` : sp.name;

                    const platformDiscountAmount = basePrice * (discountPercent / 100);
                    let couponDiscountAmount = 0;
                    appliedCoupons.forEach(coupon => {
                      let amt = coupon.discountType === 'percentage' ? (basePrice * coupon.discountValue) / 100 : coupon.discountValue;
                      if (coupon.maxDiscountAmount && amt > coupon.maxDiscountAmount) amt = coupon.maxDiscountAmount;
                      couponDiscountAmount += amt;
                    });

                    const discountAmount = platformDiscountAmount + couponDiscountAmount;
                    const afterDiscount = Math.max(0, basePrice - discountAmount);
                    const gst = afterDiscount * (gstRate / 100);
                    const total = afterDiscount + gst;
                    const isAlreadyPaid = business?.paymentStatus === 'Paid';
                    const previouslyPaid = isAlreadyPaid ? (business?.paymentBreakdown?.totalAmount || 0) : 0;
                    const netPayable = isAlreadyPaid ? total - previouslyPaid : total;
                    const isDowngrade = isAlreadyPaid && netPayable <= 0;

                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 2, color: "#1e293b" }}>Configure Selected Plan Validity</Typography>
                          <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2, p: 2, bgcolor: "#fff" }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 800 }}>{planVariantName}</Typography>
                              <Chip label={`Validity: ${durationDays} days`} size="small" sx={{ bgcolor: "#e0f2fe", color: "#0369a1", fontWeight: 700, borderRadius: 1.5 }} />
                            </Box>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth size="small" type="date" label="Start Date" slotProps={{ inputLabel: { shrink: true } }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField fullWidth size="small" type="date" label="End Date" slotProps={{ inputLabel: { shrink: true } }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                              </Grid>
                            </Grid>
                          </Box>
                        </Box>

                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 800, mb: 2, color: "#1e293b" }}>Additional Charges & Adjustments</Typography>
                          <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField fullWidth size="small" type="number" label="Discount (%)" value={discountPercent} onChange={(e) => setDiscountPercent(Number(e.target.value))} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextField fullWidth size="small" type="number" label="GST Rate (%)" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} />
                            </Grid>
                          </Grid>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField fullWidth size="small" label="Coupon Code" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} />
                            <Button
                              onClick={() => handleApplyCoupon(basePrice)}
                              variant="contained"
                              disableElevation
                              disabled={!couponInput.trim() || couponApplying}
                              sx={{
                                minWidth: 108,
                                px: 3,
                                fontWeight: 700,
                                textTransform: "none",
                                borderRadius: 1.5,
                                bgcolor: justApplied ? "#10b981" : ACCENT,
                                color: "#fff",
                                boxShadow: "none",
                                transition:
                                  "background-color .35s cubic-bezier(0.4, 0, 0.2, 1), color .35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow .25s ease, transform .2s ease",
                                "&:hover": {
                                  bgcolor: justApplied ? "#059669" : ACCENT_DARK,
                                  boxShadow: "none",
                                },
                                "&:active": {
                                  transform: "scale(0.97)",
                                },
                                "&.Mui-disabled": {
                                  bgcolor: alpha(ACCENT, 0.35),
                                  color: "rgba(255,255,255,0.85)",
                                },
                              }}
                            >
                              {couponApplying ? (
                                <CircularProgress size={16} thickness={4.5} sx={{ color: "#fff" }} />
                              ) : justApplied ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                  <CheckRoundedIcon sx={{ fontSize: 16 }} />
                                  Applied
                                </Box>
                              ) : (
                                "Apply"
                              )}
                            </Button>
                          </Box>
                          {appliedCoupons.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
                              {appliedCoupons.map(coupon => (
                                <CouponTicket
                                  key={coupon.code}
                                  coupon={coupon}
                                  onRemove={() => handleRemoveCoupon(coupon.code)}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>

                        <Box sx={{ border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#f8fafc", overflow: "hidden" }}>
                          <Box sx={{ px: 2, py: 1.5, borderBottom: "1px solid #e2e8f0" }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#1e293b" }}>Billing Rates Summary</Typography>
                          </Box>
                          <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Plan & Addons (Base Price)</Typography>
                              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#475569" }}>₹{basePrice.toFixed(2)}</Typography>
                            </Box>
                            {platformDiscountAmount > 0 && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Discount ({discountPercent}%)</Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>₹{platformDiscountAmount.toFixed(2)}</Typography>
                              </Box>
                            )}
                            {appliedCoupons.map(coupon => {
                              let amt = coupon.discountType === 'percentage' ? (basePrice * coupon.discountValue) / 100 : coupon.discountValue;
                              if (coupon.maxDiscountAmount && amt > coupon.maxDiscountAmount) amt = coupon.maxDiscountAmount;
                              return (
                                <Box key={coupon.code} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Coupon Discount ({coupon.code})</Typography>
                                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#10b981" }}>₹{amt.toFixed(2)}</Typography>
                                </Box>
                              );
                            })}
                            {(platformDiscountAmount > 0 || appliedCoupons.length > 0) && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#475569" }}>Amount after Discount</Typography>
                                <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#0ea5e9" }}>₹{afterDiscount.toFixed(2)}</Typography>
                              </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#94a3b8" }}>Plan GST ({gstRate}%) [Exclusive]</Typography>
                              <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#ef4444" }}>₹{gst.toFixed(2)}</Typography>
                            </Box>
                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#16a34a" }}>GRAND TOTAL {isAlreadyPaid ? "(NEW PLAN)" : "(PAYABLE)"}</Typography>
                              <Typography sx={{ fontSize: 14, fontWeight: 800, color: "#64748b" }}>₹{total.toFixed(2)}</Typography>
                            </Box>
                            {isAlreadyPaid && (
                              <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Previously Paid</Typography>
                                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#64748b" }}>₹{previouslyPaid.toFixed(2)}</Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: isDowngrade ? "#22c55e" : "#f59e0b" }}>{isDowngrade ? "NET DIFFERENCE (FULLY COVERED)" : "NET PAYABLE (UPGRADE)"}</Typography>
                                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: isDowngrade ? "#22c55e" : "#f59e0b" }}>
                                    {isDowngrade ? "₹0.00" : "+₹" + netPayable.toFixed(2)}
                                  </Typography>
                                </Box>
                              </>
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", mt: 2 }}>
                          {reviewPlanId && (
                            <Button variant="text" color="error" size="small" onClick={() => setIsChangingPlan(false)} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}>
                              Cancel Change
                            </Button>
                          )}
                          <Button variant="contained" size="small" disableElevation onClick={() => setIsChangingPlan(false)} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, bgcolor: "#659287", color: "#fff", "&:hover": { bgcolor: "#4a6b62" } }}>
                            <CheckRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} /> {isDowngrade ? "Assign Plan (Fully Covered)" : "Save Plan Selection"}
                          </Button>
                        </Box>
                      </Box>
                    );
                  })()}
                </Box>
              )}

              {!isChangingPlan && (() => {
                const selectedPlan = plans.find(p => p._id === reviewPlanId);
                if (!selectedPlan) return null;
                const selectedVariant = selectedPlan?.variants?.find((v: any) => v._id === reviewVariantId) || selectedPlan?.variants?.[0];

                const basePrice = selectedVariant ? (selectedVariant.price || 0) : (selectedPlan.price || 0);
                
                const durationDays = selectedVariant ? selectedVariant.durationDays : 30;

                const platformDiscountAmount = basePrice * (discountPercent / 100);
                let couponDiscountAmount = 0;
                let appliedCouponsList = business?.paymentBreakdown?.couponCodes || appliedCoupons.map(c => c.code);

                const discountAmount = platformDiscountAmount + couponDiscountAmount;
                const afterDiscount = basePrice - discountAmount;



                return (
                  <Box sx={{ bgcolor: "rgba(101, 146, 135, 0.08)", borderRadius: 2, p: 3, border: "1px solid #88BDA4" }}>
                    <Box sx={{ mb: 4 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#4a6b62", letterSpacing: 0.5, mb: 3 }}>PAYMENT PROGRESS</Typography>
                      <Stepper activeStep={business?.paymentStatus === 'Paid' ? 3 : (business?.paymentStatus === 'Pending' ? 1 : 0)} alternativeLabel>
                        <Step><StepLabel sx={{ "& .MuiStepIcon-root": { color: business?.paymentStatus ? "#22c55e" : "inherit" } }}>Plan Selected</StepLabel></Step>
                        <Step><StepLabel sx={{ "& .MuiStepIcon-root": { color: (business?.paymentStatus === "Paid" || business?.paymentStatus === "Pending") ? "#22c55e" : "inherit" } }}>Link Sent</StepLabel></Step>
                        <Step><StepLabel sx={{ "& .MuiStepIcon-root": { color: business?.paymentStatus === "Paid" ? "#22c55e" : "inherit" } }}>Payment Received</StepLabel></Step>
                      </Stepper>
                    </Box>

                    <Box sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: business?.paymentStatus === 'Paid' ? '#f0fdf4' : (business?.paymentStatus === 'Pending' ? '#fffbeb' : '#f8fafc'), border: '1px solid', borderColor: business?.paymentStatus === 'Paid' ? '#86efac' : (business?.paymentStatus === 'Pending' ? '#fde68a' : '#e2e8f0'), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <CreditCardIcon sx={{ color: business?.paymentStatus === 'Paid' ? '#22c55e' : (business?.paymentStatus === 'Pending' ? '#f59e0b' : '#64748b') }} />
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'text.primary' }}>Payment Status: {business?.paymentStatus || 'Not Initiated'}</Typography>
                          {business?.paymentStatus === 'Paid' && <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>Ref: {business?.paymentReferenceId}</Typography>}
                        </Box>
                      </Box>
                      {business?.paymentStatus === 'Pending' && <Chip label="Awaiting Payment" size="small" color="warning" sx={{ fontWeight: 700, fontSize: 10 }} />}
                      {business?.paymentStatus === 'Paid' && <Chip label={`Paid for ${business?.paymentBreakdown?.planName || 'Plan'}`} size="small" color="success" sx={{ fontWeight: 700, fontSize: 11 }} />}
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#4a6b62", letterSpacing: 0.5, mb: 3 }}>CURRENTLY SELECTED PLAN</Typography>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", mb: 0.5 }}>PLAN NAME</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>{selectedPlan.name}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", mb: 0.5 }}>PRICE</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
                          {(discountPercent > 0 || appliedCouponsList.length > 0) ? (
                            <>₹{afterDiscount.toFixed(2)} <span style={{ textDecoration: 'line-through', color: '#94a3b8', marginLeft: 4 }}>₹{basePrice.toFixed(2)}</span></>
                          ) : (
                            `₹${basePrice.toFixed(2)}`
                          )}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", mb: 0.5 }}>DURATION</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
                          {durationDays} Days
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", mb: 0.5 }}>VALIDITY</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "primary.main" }}>
                          {(() => {
                             const actualStart = business?.paymentBreakdown?.startDate ? new Date(business.paymentBreakdown.startDate) : (business?.planStartDate ? new Date(business.planStartDate) : new Date());
                             const actualEnd = business?.paymentBreakdown?.endDate ? new Date(business.paymentBreakdown.endDate) : (business?.planEndDate ? new Date(business.planEndDate) : new Date(actualStart.getTime() + durationDays * 24 * 3600 * 1000));
                             const totalValidityDays = Math.round((actualEnd.getTime() - actualStart.getTime()) / (1000 * 3600 * 24));
                             const hasBonus = totalValidityDays > durationDays;
                             return `${totalValidityDays} Days ${hasBonus ? '(Includes Bonus)' : ''}`;
                          })()}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "text.secondary", mb: 0.5 }}>DATE SELECTED</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 800, color: "text.primary" }}>
                          {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                      </Grid>
                    </Grid>

                    {(discountPercent > 0 || appliedCouponsList.length > 0) && (
                      <Box sx={{ p: 1.5, mb: 2, border: '1px dashed #88BDA4', borderRadius: 1.5, bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18, color: '#d97706' }} />
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'success.dark' }}>
                          Coupons Applied: <span style={{ color: '#0f172a' }}>{appliedCouponsList.join(', ') || 'Platform Discount'}</span> (discount applied)
                        </Typography>
                      </Box>
                    )}

                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", justifyContent: "flex-end", mt: 2 }}>
                      <Button variant="outlined" size="small" onClick={() => {
                        const link = business?.paymentToken ? `${window.location.origin}/pay/${business.paymentToken}` : null;
                        if (link) { navigator.clipboard.writeText(link); dispatch(showNotification({ message: 'Selection Link Copied!' })); }
                        else { dispatch(showNotification({ message: 'Please generate link first', failure: true })); }
                      }} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, bgcolor: "#fff", borderColor: "#659287", color: "#659287" }}>
                        <ContentCopyIcon sx={{ fontSize: 16, mr: 0.5 }} /> Copy Selection Link
                      </Button>

                      <Button variant="outlined" size="small" onClick={handleGeneratePaymentLink} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, bgcolor: "#fff", borderColor: "#659287", color: "#659287" }}>
                        <LinkIcon sx={{ fontSize: 16, mr: 0.5 }} /> Send Selection Link
                      </Button>

                      <Button variant="outlined" size="small" onClick={() => {
                        const link = business?.paymentToken ? `${window.location.origin}/pay/${business.paymentToken}` : null;
                        if (link) { navigator.clipboard.writeText(link); dispatch(showNotification({ message: 'Payment Link Copied!' })); }
                        else { dispatch(showNotification({ message: 'Please generate link first', failure: true })); }
                      }} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}>
                        <ContentCopyIcon sx={{ fontSize: 16, mr: 0.5 }} /> Copy Payment Link
                      </Button>

                      <Button variant="outlined" size="small" onClick={handleGeneratePaymentLink} disabled={business?.paymentStatus === 'Paid'} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, borderColor: "#f59e0b", color: "#d97706" }}>
                        <LinkIcon sx={{ fontSize: 16, mr: 0.5 }} /> {business?.paymentStatus === 'Paid' ? "Send Upgrade Payment Link" : "Send Payment Link"}
                      </Button>

                      <Button variant="contained" color={business?.paymentStatus === 'Paid' ? "warning" : "primary"} size="small" disableElevation onClick={() => setIsChangingPlan(true)} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}>
                        <AutorenewIcon sx={{ fontSize: 18, mr: 0.5 }} /> {business?.paymentStatus === 'Paid' ? "Override & Change Paid Plan" : "Change Plan"}
                      </Button>
                    </Box>
                  </Box>
                );
              })()}
            </StageSection>

            <StageSection
              index={5}
              title="Verification & Decision"
              description="Review the application and take action"
              statusLabel={isApproved ? "APPROVED" : isRejected ? "REJECTED" : isChangesRequested ? "CHANGES REQ." : isDemoConducted ? "PENDING" : "NOT STARTED"}
              tone={isApproved ? "success" : isRejected ? "error" : isChangesRequested ? "warning" : isDemoConducted ? "warning" : "idle"}
              expanded={expanded === 5}
              onToggle={() => toggle(5)}
              isLast
            >
              <Stack spacing={2.5}>
                <TextField fullWidth multiline rows={3} label="Decision Notes / Changes Requested" placeholder="Required for rejection or when requesting changes" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }} />

                <Divider sx={{ borderColor: "#f1f4f9" }} />

                <Box>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED, mb: 1.5 }}>Decision</Typography>

                  <Stack direction="row" spacing={1.25} useFlexGap sx={{ mb: 1.5, flexWrap: "wrap" }}>
                    <Button variant="contained" disableElevation color="primary" onClick={onApprove} disabled={!isDemoConducted} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: "none" }}>
                      Approve Shop
                    </Button>
                    <Button variant="contained" disableElevation onClick={onOpenTrialModal} disabled={!isDemoConducted} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: "none" }}>
                      Activate Trial
                    </Button>
                    <Button variant="outlined" color="warning" onClick={onRequestChanges} disabled={!isDemoConducted} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5 }}>
                      Request Changes
                    </Button>
                    <Button variant="outlined" color="error" onClick={onReject} disabled={!isDemoConducted} sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5, px: 2.5 }}>
                      Reject Shop
                    </Button>
                  </Stack>

                  {onAskToReRegister && (
                    <Button variant="text" size="small" onClick={onAskToReRegister} sx={{ textTransform: "none", fontWeight: 600, color: MUTED, "&:hover": { color: "#dc2626", bgcolor: alpha("#dc2626", 0.06) } }}>
                      Ask to Re-Register
                    </Button>
                  )}
                </Box>
              </Stack>
            </StageSection>
          </Box>

          <Box sx={{ position: { md: "sticky" }, top: { md: 88 }, alignSelf: "start" }}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: "0 1px 2px rgba(15,23,42,0.03)" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pb: 3 }}>
                <Box sx={{ position: "relative", width: 128, height: 128 }}>
                  <svg width="128" height="128" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={R} fill="none" stroke="#eef2f7" strokeWidth="9" />
                    <circle cx="64" cy="64" r={R} fill="none" stroke="#659287" strokeWidth="9" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progressPct / 100)} transform="rotate(-90 64 64)" style={{ transition: "stroke-dashoffset .6s ease" }} />
                  </svg>
                  <Box sx={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <Typography sx={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1, color: "text.primary" }}>{progressPct}%</Typography>
                    <Typography sx={{ fontSize: 10.5, color: MUTED, mt: 0.5, fontWeight: 600, letterSpacing: 0.4 }}>COMPLETE</Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#f1f4f9" }} />

              <Box sx={{ pt: 3 }}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: MUTED, mb: 2 }}>Onboarding Progress</Typography>

                <Stack spacing={0}>
                  <TimelineItem done title="Registration Received" caption={`Submitted ${formatDate(business.createdAt)}`} />
                  <TimelineItem done={isDemoProvided} active={!isDemoProvided} title="Demo Sandbox Provisioned" caption={isDemoProvided ? "Sandbox ready" : "Awaiting provisioning"} />
                  <TimelineItem done={isDemoConducted} active={isDemoProvided && !isDemoConducted} title="Meeting Conducted" caption={isDemoConducted ? "Call completed" : "Not yet conducted"} />
                  <TimelineItem done={!!reviewPlanId} active={isDemoConducted && !reviewPlanId} title="Plan Selected" caption={reviewPlanId ? "Plan allocated" : "Awaiting allocation"} />
                  <TimelineItem done={isApproved || isRejected || isChangesRequested} error={isRejected} active={!!reviewPlanId && isDemoConducted && !isApproved && !isRejected && !isChangesRequested} title={isApproved ? "Verification Approved" : isRejected ? "Verification Rejected" : isChangesRequested ? "Changes Requested" : "Verification Decision"} caption={isApproved || isRejected || isChangesRequested ? "Decision recorded" : "Pending review"} isLast />
                </Stack>
              </Box>

              <Divider sx={{ borderColor: "#f1f4f9", my: 2.5 }} />
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontSize: 11.5, color: MUTED }}>Requested Plan</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary", textAlign: "right" }}>{business.requestedPlanId?.name || "—"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontSize: 11.5, color: MUTED }}>Owner</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary", textAlign: "right" }}>{business.ownerName || "—"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography sx={{ fontSize: 11.5, color: MUTED }}>Demo Status</Typography>
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: "text.primary", textAlign: "right" }}>{business.demoStatus || "Not Started"}</Typography>
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
