import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, Grid, Button, IconButton, Chip, Stack, LinearProgress
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import StoreRoundedIcon from '@mui/icons-material/StoreRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchBusinesses, fetchPlans, generatePaymentLink, updateBusiness } from '../../features/superadmin/superadminSlice';
import { showNotification } from '../../features/notifications/notificationSlice';
import { alpha } from '@mui/material/styles';

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | React.ReactNode }) => (
  <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
    <Box sx={{ color: '#64748b', mt: 0.5 }}>{icon}</Box>
    <Box>
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, color: '#0f172a', fontWeight: 500, mt: 0.5 }}>{value}</Typography>
    </Box>
  </Box>
);

const AllocatePlan = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businesses, plans } = useAppSelector((state) => state.superadmin);

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (businesses.length === 0) dispatch(fetchBusinesses());
    if (plans.length === 0) dispatch(fetchPlans());
  }, [dispatch, businesses.length, plans.length]);

  const shop = businesses.find((b: any) => b._id === id || b.id === id);

  useEffect(() => {
    if (shop?.requestedPlanId && !selectedPlanId) {
      setSelectedPlanId(shop.requestedPlanId);
      const reqPlan = plans.find((p: any) => p._id === shop.requestedPlanId);
      if (reqPlan?.variants?.length) {
        setSelectedVariantId(reqPlan.variants[0]._id);
      }
    }
  }, [shop, plans, selectedPlanId]);

  if (!shop) {
    return <Box sx={{ p: 4 }}><LinearProgress /></Box>;
  }

  const calculateProration = () => {
    if (!shop.planEndDate || !shop.paymentBreakdown?.totalAmount) return 0;
    const endDate = new Date(shop.planEndDate).getTime();
    const startDate = shop.planStartDate 
      ? new Date(shop.planStartDate).getTime() 
      : (shop.subscriptionStart ? new Date(shop.subscriptionStart).getTime() : 0);
    
    if (!startDate) return 0;
    const now = Date.now();
    if (endDate <= now) return 0;
    
    const totalDays = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, (endDate - now) / (1000 * 60 * 60 * 24));
    const pricePaid = (shop.paymentBreakdown?.basePrice || 0) - (shop.paymentBreakdown?.discountAmount || 0); 
    return Math.max(0, Math.round((daysRemaining / totalDays) * pricePaid));
  };

  const proratedCredit = calculateProration();

  const handleForceOverride = async () => {
    if (!selectedPlanId || !selectedVariantId) {
      dispatch(showNotification({ message: 'Please select a plan and variant', failure: true }));
      return;
    }
    const selectedPlan = plans.find((p: any) => p._id === selectedPlanId);
    const selectedVariant = selectedPlan?.variants?.find((v: any) => v._id === selectedVariantId);
    if (!selectedPlan || !selectedVariant) return;

    setIsGenerating(true);
    try {
      const now = new Date();
      const endDate = new Date(now.getTime() + selectedVariant.durationDays * 24 * 60 * 60 * 1000);
      
      const payload = {
        planId: selectedPlanId,
        planVariantId: selectedVariantId,
        planStartDate: now.toISOString(),
        planEndDate: endDate.toISOString(),
        subscriptionStart: now.toISOString(),
        subscriptionEnd: endDate.toISOString(),
        clearRequestedPlan: true,
      };
      
      await dispatch(updateBusiness({ id: shop._id, data: payload })).unwrap();
      dispatch(showNotification({ message: 'Plan forcefully overridden successfully!' }));
      dispatch(fetchBusinesses());
      navigate(`/superadmin/shops/${shop._id || shop.id}`);
    } catch (error: any) {
      dispatch(showNotification({ message: error || 'Failed to override plan', failure: true }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAllocate = async () => {
    if (!selectedPlanId || !selectedVariantId) {
      dispatch(showNotification({ message: 'Please select a plan and variant', failure: true }));
      return;
    }
    
    const selectedPlan = plans.find((p: any) => p._id === selectedPlanId);
    const selectedVariant = selectedPlan?.variants?.find((v: any) => v._id === selectedVariantId);
    if (!selectedPlan || !selectedVariant) return;

    const basePrice = selectedVariant.price;
    const gstRate = 18;
    const discountPercent = shop.discountPercentage || 0;
    
    const discountAmount = (basePrice * (discountPercent / 100));
    const afterDiscount = Math.max(0, basePrice - discountAmount - proratedCredit);
    const gst = afterDiscount * (gstRate / 100);
    const totalAmount = afterDiscount + gst;

    setIsGenerating(true);
    try {
      const breakdown = {
        planId: selectedPlanId,
        planVariantId: selectedVariantId,
        planName: selectedPlan.name,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + selectedVariant.durationDays * 24 * 60 * 60 * 1000).toISOString(),
        basePrice,
        discountPercent,
        discountAmount: discountAmount + proratedCredit,
        gstRate,
        totalAmount
      };
      const resultAction = await dispatch(generatePaymentLink({ id: shop._id, paymentBreakdown: breakdown }));
      if (generatePaymentLink.fulfilled.match(resultAction)) {
        navigator.clipboard.writeText(window.location.origin + resultAction.payload.paymentLink);
        dispatch(showNotification({ message: 'Payment link generated and copied to clipboard!' }));
        dispatch(fetchBusinesses());
        const isAgent = window.location.pathname.startsWith('/agent');
        navigate(isAgent ? `/agent/shops/${shop._id || shop.id}` : `/superadmin/shops/${shop._id || shop.id}`);
      } else {
        dispatch(showNotification({ message: resultAction.payload as string || 'Failed to generate link', failure: true }));
      }
    } catch (error: any) {
      dispatch(showNotification({ message: error || 'Failed to generate link', failure: true }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3, lg: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', '&:hover': { bgcolor: '#f8fafc' } }}>
          <ArrowBackRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
          Expired Shop Plan Allocation
        </Typography>
      </Box>

      <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #fecaca', bgcolor: '#fef2f2', mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <StoreRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{shop.name}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5, alignItems: 'center' }}>
              <Chip label={shop.category || 'RETAIL'} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: '#f59e0b', color: '#fff' }} />
              <Typography sx={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>ID: {shop.registrationNumber || shop._id.slice(-6).toUpperCase()}</Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          <Chip icon={<ErrorOutlineRoundedIcon style={{ color: '#fff' }} />} label="Plan Status: Expired" size="small" sx={{ height: 24, fontSize: 11, fontWeight: 700, bgcolor: '#dc2626', color: '#fff', '& .MuiChip-icon': { fontSize: 14, ml: 1 } }} />
          <Chip label="No Plan" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 600, bgcolor: '#e2e8f0', color: '#475569' }} />
        </Box>
      </Card>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0f172a', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StoreRoundedIcon sx={{ fontSize: 18, color: '#10b981' }} /> Shop Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow icon={<StoreRoundedIcon sx={{ fontSize: 18 }} />} label="Official Name" value={shop.name} />
                <InfoRow icon={<CategoryRoundedIcon sx={{ fontSize: 18 }} />} label="Business Sector" value={shop.category || 'N/A'} />
                <InfoRow icon={<PhoneRoundedIcon sx={{ fontSize: 18 }} />} label="Primary Phone" value={shop.phone || 'N/A'} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow icon={<CalendarTodayRoundedIcon sx={{ fontSize: 18 }} />} label="Registered Date" value={new Date(shop.createdAt).toLocaleDateString()} />
                <InfoRow icon={<ReceiptLongRoundedIcon sx={{ fontSize: 18 }} />} label="Additional Notes" value={shop.description || 'N/A'} />
              </Grid>
            </Grid>
          </Card>

          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0f172a', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#10b981' }} /> Owner / Account Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow icon={<StoreRoundedIcon sx={{ fontSize: 18 }} />} label="Full Name" value={shop.ownerName || 'N/A'} />
                <InfoRow icon={<EmailRoundedIcon sx={{ fontSize: 18 }} />} label="Registered Email" value={shop.ownerEmail || shop.email || 'N/A'} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <InfoRow icon={<PhoneRoundedIcon sx={{ fontSize: 18 }} />} label="Registered Mobile" value={shop.ownerPhone || 'N/A'} />
                <InfoRow 
                  icon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />} 
                  label="Verification Status" 
                  value={<Chip label={shop.verificationStatus?.toUpperCase() || 'VERIFIED'} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: '#dcfce7', color: '#16a34a' }} />} 
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0f172a', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReceiptLongRoundedIcon sx={{ fontSize: 18, color: '#10b981' }} /> Billing & Tax Structure
            </Typography>
            <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', mb: 1 }}>Pricing Charge Type</Typography>
              <Chip label="INCLUSIVE" size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, bgcolor: '#f59e0b', color: '#fff', mb: 2 }} />
              
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', mb: 0.5 }}>Configured GST Slabs</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff', p: 1.5, borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>GST Rate: 18%</Typography>
                <Typography sx={{ fontSize: 11, color: '#94a3b8' }}>CGST 9% | SGST 9%</Typography>
              </Box>
            </Box>

            {selectedPlanId && selectedVariantId && (() => {
              const selectedPlan = plans.find((p: any) => p._id === selectedPlanId);
              const selectedVariant = selectedPlan?.variants?.find((v: any) => v._id === selectedVariantId);
              if (!selectedVariant) return null;
              
              const basePrice = selectedVariant.price;
              const discountPercent = shop.discountPercentage || 0;
              const discountAmount = basePrice * (discountPercent / 100);
              const afterDiscount = Math.max(0, basePrice - discountAmount - proratedCredit);
              const gst = afterDiscount * 0.18;
              const totalAmount = afterDiscount + gst;

              return (
                <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', mb: 2 }}>Checkout Preview</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 13, color: '#64748b' }}>Base Price</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>₹{basePrice.toLocaleString()}</Typography>
                  </Box>
                  {discountAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: 13, color: '#16a34a' }}>Coupon Discount ({discountPercent}%)</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>-₹{discountAmount.toLocaleString()}</Typography>
                    </Box>
                  )}
                  {proratedCredit > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography sx={{ fontSize: 13, color: '#16a34a' }}>Prorated Credit (Unused time)</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>-₹{proratedCredit.toLocaleString()}</Typography>
                    </Box>
                  )}
                  {proratedCredit > 0 && (basePrice - discountAmount - proratedCredit) < 0 && (
                    <Typography sx={{ fontSize: 11, color: '#ef4444', fontStyle: 'italic', mb: 1 }}>
                      Credit exceeds new plan cost. Remainder will be forfeited.
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontSize: 13, color: '#64748b' }}>GST (18%)</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>+₹{gst.toLocaleString()}</Typography>
                  </Box>
                  <Box sx={{ pt: 1.5, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Amount to Pay</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#10b981' }}>₹{totalAmount.toLocaleString()}</Typography>
                  </Box>
                </Box>
              );
            })()}
          </Card>
        </Grid>
      </Grid>

      <Card elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid #e2e8f0', mt: 3, mb: 8 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0f172a', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StoreRoundedIcon sx={{ fontSize: 18, color: '#10b981' }} /> Plan Selection & Allocation Showcase
        </Typography>
        <Typography sx={{ fontSize: 12, color: '#64748b', mb: 3 }}>
          Select an active plan and variant to allocate to this shop. This will generate a payment link and send it to the owner.
        </Typography>

        <Grid container spacing={2}>
          {plans.map((plan: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={plan._id}>
              <Box 
                onClick={() => { setSelectedPlanId(plan._id); setSelectedVariantId(plan.variants?.[0]?._id || null); }}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 2.5, 
                  border: `2px solid ${selectedPlanId === plan._id ? '#10b981' : '#e2e8f0'}`,
                  bgcolor: selectedPlanId === plan._id ? alpha('#10b981', 0.04) : '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: selectedPlanId === plan._id ? '#10b981' : '#cbd5e1' }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>{plan.name}</Typography>
                  <Chip label="PRIMARY" size="small" sx={{ height: 20, fontSize: 9, fontWeight: 700, bgcolor: '#10b981', color: '#fff' }} />
                </Box>
                
                {plan.variants && plan.variants.length > 0 ? (
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {plan.variants.map((v: any) => (
                      <Box 
                        key={v._id} 
                        onClick={(e) => { e.stopPropagation(); setSelectedPlanId(plan._id); setSelectedVariantId(v._id); }}
                        sx={{p: 1.5, borderRadius: 1.5, border: `1px solid ${selectedVariantId === v._id ? '#10b981' : '#e2e8f0'}`, bgcolor: selectedVariantId === v._id ? alpha('#10b981', 0.1) : '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{v.name}</Typography>
                          <Typography sx={{ fontSize: 11, color: '#64748b' }}>{v.durationDays} days</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>₹{v.price}</Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography sx={{ fontSize: 13, color: '#64748b', mt: 2 }}>No variants available</Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Card>

      <Box sx={{ position: 'fixed', bottom: 0, left: { xs: 0, sm: 240 }, right: 0, bgcolor: '#fff', borderTop: '1px solid #e2e8f0', p: 2, display: 'flex', justifyContent: 'flex-end', gap: 2, zIndex: 10 }}>
        <Button 
          variant="outlined" 
          disabled={!selectedPlanId || !selectedVariantId || isGenerating}
          onClick={handleForceOverride}
          sx={{color: '#d97706', borderColor: '#d97706', textTransform: 'none', fontWeight: 700, px: 4, py: 1.5, borderRadius: 2, '&:hover': { bgcolor: '#fffbeb', borderColor: '#b45309' }}}
        >
          {isGenerating ? 'Wait...' : 'Force Override Active Plan'}
        </Button>
        <Button 
          variant="contained" 
          disabled={!selectedPlanId || !selectedVariantId || isGenerating}
          onClick={handleAllocate}
          sx={{bgcolor: '#16a34a', color: '#fff', textTransform: 'none', fontWeight: 700, px: 4, py: 1.5, borderRadius: 2,boxShadow: '0 4px 12px rgba(22, 163, 74, 0.2)','&:hover': { bgcolor: '#15803d' },'&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' }}}
        >
          {isGenerating ? 'Generating...' : 'Allocate Selected Plan'}
        </Button>
      </Box>
    </Box>
  );
};

export default AllocatePlan;
