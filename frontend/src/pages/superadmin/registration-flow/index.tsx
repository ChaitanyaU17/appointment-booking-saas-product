import { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../hook";
import {
  fetchBusinesses, deleteBusiness, fetchPlans, fetchAdmins,
  requestChangesBusiness, rejectBusiness, approveBusiness, activateTrial,
  createDemoForRegistration, markDemoConducted
} from "../../../features/superadmin/superadminSlice";
import { showNotification } from "../../../features/notifications/notificationSlice";

import RegistrationTable from "./RegistrationTable";
import RegistrationPipeline from "./RegistrationPipeline";
import RegistrationModals from "./RegistrationModals";

type ViewMode = "table" | "pipeline";

const RegistrationRoot = () => {
  const dispatch = useAppDispatch();
  const { businesses, plans, admins } = useAppSelector((state) => state.superadmin);
  const loading = useAppSelector((state: any) => state.superadmin?.loading ?? false);

  const [view, setView] = useState<ViewMode>("table");
  const [pipelineBiz, setPipelineBiz] = useState<any>(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewBiz, setSelectedReviewBiz] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewPlanId, setReviewPlanId] = useState("");
  const [reviewVariantId, setReviewVariantId] = useState("");

  const [trialModalOpen, setTrialModalOpen] = useState(false);
  const [trialDays, setTrialDays] = useState(14);
  const [trialPlanId, setTrialPlanId] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMeetLink, setDemoMeetLink] = useState("");

  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>({
    new: false,
    demo: false,
    conducted: false,
  });

  const fetchAll = () => {
    dispatch(fetchBusinesses());
    dispatch(fetchAdmins());
    dispatch(fetchPlans());
  };

  useEffect(() => {
    fetchAll();
  }, [dispatch]);

  const toggleStage = (key: string) =>
    setExpandedStages((prev) => ({ ...prev, [key]: !prev[key] }));


  const handleOpenPipeline = (biz: any) => {
    setPipelineBiz(biz);
    setSelectedReviewBiz(biz);
    setReviewNote("");
    const reqPlan = biz.requestedPlanId?._id || "";
    setReviewPlanId(reqPlan);
    if (biz.planVariantId) {
      setReviewVariantId(biz.planVariantId);
    } else if (reqPlan) {
      const p = plans.find((p: any) => p._id === reqPlan);
      if (p?.variants?.length) {
        setReviewVariantId(p.variants[0]._id);
      } else {
        setReviewVariantId("");
      }
    } else {
      setReviewVariantId("");
    }
    const autoLink = `https://meet.google.com/phu-sbez-ufu`;
    setDemoMeetLink(biz.onboardingMeetLink || autoLink);
    setView("pipeline");
  };

  const handleBackToTable = () => {
    setPipelineBiz(null);
    setView("table");
  };

  const handleOpenReview = (biz: any) => {
    setSelectedReviewBiz(biz);
    setReviewNote("");
    setReviewPlanId(biz.requestedPlanId?._id || "");
    const autoLink = `https://meet.google.com/phu-sbez-ufu`;
    setDemoMeetLink(biz.onboardingMeetLink || autoLink);
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
        const updated = { ...selectedReviewBiz, verificationStatus: "ChangesRequested" };
        setSelectedReviewBiz(updated);
        setPipelineBiz(updated);
      })
      .catch((error: any) => dispatch(showNotification({ message: error || "Error", failure: true })));
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
        const updated = { ...selectedReviewBiz, verificationStatus: "Rejected" };
        setSelectedReviewBiz(updated);
        setPipelineBiz(updated);
      })
      .catch((error: any) => dispatch(showNotification({ message: error || "Error", failure: true })));
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
        const updated = { ...selectedReviewBiz, verificationStatus: "Approved", trialStatus: "Active" };
        setSelectedReviewBiz(updated);
        setPipelineBiz(updated);
      })
      .catch((error: any) => dispatch(showNotification({ message: error || "Error", failure: true })));
  };

  const handleApprove = () => {
    if (!selectedReviewBiz) return;
    dispatch(approveBusiness({ id: selectedReviewBiz._id, data: { planId: reviewPlanId || null, planVariantId: reviewVariantId || null } }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: "Business approved!" }));
        setReviewModalOpen(false);
        fetchAll();
        const updated = { ...selectedReviewBiz, verificationStatus: "Approved" };
        setSelectedReviewBiz(updated);
        setPipelineBiz(updated);
      })
      .catch((error: any) => dispatch(showNotification({ message: error || "Error", failure: true })));
  };

  const handleCreateDemo = () => {
    if (!selectedReviewBiz) return;
    setDemoLoading(true);
    dispatch(createDemoForRegistration({ id: selectedReviewBiz._id, data: { meetLink: demoMeetLink } }))
      .unwrap()
      .then((res: any) => {
        dispatch(showNotification({ message: res.message }));
        fetchAll();
        const updated = { ...selectedReviewBiz, demoStatus: "Provided", onboardingMeetLink: demoMeetLink, demoBusinessId: res.demoBusinessId || res.business?.demoBusinessId };
        setSelectedReviewBiz(updated);
        setPipelineBiz(updated);
      })
      .catch((error: any) => dispatch(showNotification({ message: error || "Error creating demo", failure: true })))
      .finally(() => setDemoLoading(false));
  };

  const handleMarkDemoConducted = () => {
    if (!selectedReviewBiz) return;
    dispatch(markDemoConducted(selectedReviewBiz._id))
      .unwrap()
      .then((res: any) => {
        dispatch(showNotification({ message: res.message }));
        fetchAll();
        const updated = { ...selectedReviewBiz, demoStatus: "Conducted" };
        setSelectedReviewBiz(updated);
        setPipelineBiz(updated);
      })
      .catch((error: any) => dispatch(showNotification({ message: error || "Error marking demo as conducted", failure: true })));
  };

  const handleAskToReRegister = () => {
    if (!selectedReviewBiz) return;
    dispatch(deleteBusiness(selectedReviewBiz._id))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: "Business data cleared. They can now re-register." }));
        setReviewModalOpen(false);
        fetchAll();
        setPipelineBiz(null);
        setView("table");
      })
      .catch((error: any) => dispatch(showNotification({ message: error?.message || "Failed to delete business", failure: true })));
  };

  const pendingBusinesses = businesses?.filter((b: any) =>
    ["Pending", "ChangesRequested"].includes(b.verificationStatus)
  ) || [];

  return (
    <Box sx={{ pb: 4 }}>
      {view === "table" ? (
        <RegistrationTable
          businesses={pendingBusinesses}
          loading={loading && !businesses}
          onOpenPipeline={handleOpenPipeline}
        />
      ) : (
        <RegistrationPipeline
          business={pipelineBiz}
          onBack={handleBackToTable}
          demoMeetLink={demoMeetLink}
          setDemoMeetLink={setDemoMeetLink}
          reviewNote={reviewNote}
          setReviewNote={setReviewNote}
          reviewPlanId={reviewPlanId}
          setReviewPlanId={setReviewPlanId}
          reviewVariantId={reviewVariantId}
          setReviewVariantId={setReviewVariantId}
          plans={plans}
          onProvisionDemo={handleCreateDemo}
          onMarkConducted={handleMarkDemoConducted}
          onApprove={handleApprove}
          onRequestChanges={handleRequestChanges}
          onReject={handleReject}
          onOpenTrialModal={() => setTrialModalOpen(true)}
          onAskToReRegister={handleAskToReRegister}
          demoLoading={demoLoading}
        />
      )}

      <RegistrationModals
        reviewModalOpen={reviewModalOpen}
        setReviewModalOpen={setReviewModalOpen}
        selectedReviewBiz={selectedReviewBiz}
        reviewNote={reviewNote}
        setReviewNote={setReviewNote}
        reviewPlanId={reviewPlanId}
        setReviewPlanId={setReviewPlanId}
        demoMeetLink={demoMeetLink}
        setDemoMeetLink={setDemoMeetLink}
        demoLoading={demoLoading}
        plans={plans}
        trialModalOpen={trialModalOpen}
        setTrialModalOpen={setTrialModalOpen}
        trialDays={trialDays}
        setTrialDays={setTrialDays}
        trialPlanId={trialPlanId}
        setTrialPlanId={setTrialPlanId}
        handleCreateDemo={handleCreateDemo}
        handleMarkDemoConducted={handleMarkDemoConducted}
        handleApprove={handleApprove}
        handleRequestChanges={handleRequestChanges}
        handleReject={handleReject}
        handleAskToReRegister={handleAskToReRegister}
        handleActivateTrial={handleActivateTrial}
      />
    </Box>
  );
};

export default RegistrationRoot;
