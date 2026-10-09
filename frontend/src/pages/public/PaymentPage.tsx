import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hook';
import { fetchPaymentDetails, processPayment } from '../../features/public/publicSlice';
import {
  Box, Typography, Button, Divider, CircularProgress,
  Chip, Container, Stack, alpha, Checkbox, FormControlLabel, Paper,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

const ACCENT = '#659287';
const ACCENT_DARK = '#4a6b62';

const SURFACE = '#ffffff';
const PAGE_BG = '#f6f8f7';
const BORDER = '#e6e9ef';
const MUTED = '#64748b';
const INK = '#0f172a';

const SUCCESS = '#059669';
const SUCCESS_SOFT = '#ecfdf5';
const SUCCESS_BORDER = '#a7f3d0';

const ERROR = '#dc2626';
const ERROR_SOFT = '#fef2f2';
const ERROR_BORDER = '#fecaca';

const formatINR = (v?: number | string) =>
  `₹${Number(v || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function PaymentPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    paymentDetails: business,
    receiptData,
    paymentDetailsLoading: loading,
    paymentDetailsError: error,
    paymentProcessing: processing,
    paymentSuccess: success,
    paymentError,
  } = useAppSelector((state) => state.public);

  const displayError = error || paymentError;
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (token) dispatch(fetchPaymentDetails(token));
  }, [token, dispatch]);

  const handlePayment = () => {
    if (token) dispatch(processPayment(token));
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={32} thickness={4} sx={{ color: ACCENT }} />
      </Box>
    );
  }

  if (displayError && !success) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Paper elevation={0} sx={{ maxWidth: 460, width: '100%', borderRadius: 3, bgcolor: SURFACE, border: `1px solid ${ERROR_BORDER}`, boxShadow: '0 20px 60px -24px rgba(15,23,42,0.18)', p: { xs: 3, md: 4.5 }, textAlign: 'center' }}>
          <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: ERROR_SOFT, color: ERROR, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5, border: `1px solid ${ERROR_BORDER}` }}>
            <ErrorOutlineRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 700, color: INK, letterSpacing: -0.3 }}>Something went wrong</Typography>
          <Typography sx={{ fontSize: 13.5, color: MUTED, mt: 1, mb: 3, lineHeight: 1.6 }}>{displayError}</Typography>
          <Button variant="contained" disableElevation onClick={() => navigate('/')} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>
            Return Home
          </Button>
        </Paper>
      </Box>
    );
  }

  if (success) {
    const breakdown = receiptData?.paymentBreakdown || business?.paymentBreakdown;
    const refId = receiptData?.paymentReferenceId || business?.paymentReferenceId || (token?.length === 24 ? token.toUpperCase() : token?.slice(0, 12).toUpperCase());
    const date = receiptData?.createdAt ? new Date(receiptData.createdAt) : new Date();
    const customer = receiptData?.customerSnapshot || business;

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 } }}>
        <style>
          {`
            @media print {
              body, html, main, .MuiBox-root { background-color: #fff !important; min-height: auto !important; height: auto !important; }
              header, footer, nav, .MuiAppBar-root, #main-sidebar { display: none !important; }
              .no-print { display: none !important; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              .MuiPaper-root { box-shadow: none !important; border: none !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; overflow: visible !important; }
              @page { margin: 1cm; size: auto; }
            }
          `}
        </style>
        <Paper elevation={0} sx={{ maxWidth: 700, width: '100%', borderRadius: 3, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px -24px rgba(15,23,42,0.18)', overflow: 'hidden' }}>
          <Box sx={{ height: 6, background: `linear-gradient(90deg, ${SUCCESS} 0%, ${alpha(SUCCESS, 0.35)} 100%)` }} />
          
          <Box sx={{ p: { xs: 3, md: 5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: INK }}>INVOICE</Typography>
                <Typography sx={{ fontSize: 13, color: MUTED, mt: 0.5 }}>Receipt / Tax Invoice</Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: 1.5, bgcolor: SUCCESS_SOFT, border: `1px solid ${SUCCESS_BORDER}`, mb: 1.5 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 16, color: SUCCESS }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 800, color: SUCCESS, letterSpacing: 0.5, textTransform: 'uppercase' }}>Paid</Typography>
                </Box>
                <Typography sx={{ fontSize: 12.5, color: MUTED, mb: 0.25, fontWeight: 500 }}>Date: <span style={{ color: INK }}>{date.toLocaleDateString()}</span></Typography>
                <Typography sx={{ fontSize: 12.5, color: MUTED, fontWeight: 500 }}>Txn ID: <span style={{ fontFamily: '"SF Mono", monospace', color: INK }}>{refId}</span></Typography>
              </Box>
            </Box>

            {/* Billed To */}
            <Box sx={{ mb: 4, p: 3, borderRadius: 2.5, bgcolor: '#f8fafc', border: `1px solid ${BORDER}` }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>Billed To</Typography>
              <Typography sx={{ fontSize: 17, fontWeight: 700, color: INK }}>{customer?.businessName || customer?.name || 'Customer'}</Typography>
              <Typography sx={{ fontSize: 13.5, color: MUTED, mt: 0.5 }}>{customer?.email || 'No email provided'}</Typography>
              <Typography sx={{ fontSize: 13.5, color: MUTED, mt: 0.25 }}>{customer?.phone || ''}</Typography>
            </Box>

            {/* Line Items */}
            <Box sx={{ mb: 5 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK, mb: 2 }}>Subscription Details</Typography>
              
              <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: 2.5, overflow: 'hidden' }}>
                {/* Header Row */}
                <Box sx={{ display: 'flex', bgcolor: '#f8fafc', p: 2, px: 3, borderBottom: `1px solid ${BORDER}` }}>
                  <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 700, color: MUTED }}>Description</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: MUTED }}>Amount</Typography>
                </Box>
                
                {/* Item Row */}
                <Box sx={{ display: 'flex', p: 2, px: 3, borderBottom: `1px solid ${BORDER}` }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 600, color: INK }}>{breakdown?.planName || 'Subscription Plan'}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: INK }}>{formatINR(breakdown?.basePrice)}</Typography>
                </Box>

                {/* Subtotals */}
                <Box sx={{ p: 2, px: 3, bgcolor: '#ffffff' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography sx={{ fontSize: 13.5, color: MUTED, fontWeight: 500 }}>Base Price</Typography>
                    <Typography sx={{ fontSize: 14, color: INK, fontWeight: 600 }}>{formatINR(breakdown?.basePrice)}</Typography>
                  </Box>
                  
                  {(breakdown?.platformDiscountAmount > 0) && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography sx={{ fontSize: 13.5, color: ERROR, fontWeight: 500 }}>Platform Discount</Typography>
                      <Typography sx={{ fontSize: 14, color: ERROR, fontWeight: 600 }}>-{formatINR(breakdown.platformDiscountAmount)}</Typography>
                    </Box>
                  )}
                  
                  {(breakdown?.couponDiscountAmount > 0) && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography sx={{ fontSize: 13.5, color: ERROR, fontWeight: 500 }}>
                        Coupon Discount {breakdown?.couponCodes?.length ? `(${breakdown.couponCodes.join(', ')})` : ''}
                      </Typography>
                      <Typography sx={{ fontSize: 14, color: ERROR, fontWeight: 600 }}>-{formatINR(breakdown.couponDiscountAmount)}</Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pt: 1.5, borderTop: `1px dashed ${BORDER}` }}>
                    <Typography sx={{ fontSize: 13.5, color: MUTED, fontWeight: 500 }}>Taxable Amount</Typography>
                    <Typography sx={{ fontSize: 14, color: INK, fontWeight: 600 }}>{formatINR((breakdown?.basePrice || 0) - (breakdown?.discountAmount || 0))}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: 13.5, color: MUTED, fontWeight: 500 }}>GST (18%)</Typography>
                    <Typography sx={{ fontSize: 14, color: INK, fontWeight: 600 }}>{formatINR(breakdown?.gstAmount)}</Typography>
                  </Box>
                </Box>
                
                {/* Total Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 3, bgcolor: '#f8fafc', borderTop: `1px solid ${BORDER}` }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, color: INK }}>Total Paid</Typography>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, color: ACCENT }}>{formatINR(breakdown?.totalAmount)}</Typography>
                </Box>
              </Box>
            </Box>

            {/* Actions */}
            <Box className="no-print" sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="outlined" onClick={() => window.print()} sx={{ px: 4, py: 1.25, borderRadius: 2, textTransform: 'none', fontWeight: 600, color: INK, borderColor: BORDER, '&:hover': { bgcolor: '#f1f5f9', borderColor: '#cbd5e1' } }}>
                Print Invoice
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }

  const breakdown = business?.paymentBreakdown;

  const hasAnyDiscount =
    breakdown?.platformDiscountAmount > 0 ||
    breakdown?.couponDiscountAmount > 0 ||
    breakdown?.discountAmount > 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, pb: 8 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`, borderBottom: `1px solid ${alpha('#000', 0.08)}`, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px -18px rgba(15,23,42,0.35)', overflow: 'hidden', '&::after': { content: '""', position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(120% 120% at 0% 0%, ${alpha('#ffffff', 0.1)} 0%, transparent 45%)` } }}>
        <Box sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 2, md: 4 }, py: 2, display: 'flex', alignItems: 'center', gap: 2, position: 'relative', zIndex: 1 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: alpha('#ffffff', 0.14), border: `1px solid ${alpha('#ffffff', 0.24)}`, backdropFilter: 'blur(10px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.05), 0 0 0 3px rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 24, color: '#fff', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.15))' }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.2, color: '#fff', lineHeight: 1.2, textShadow: '0 1px 1px rgba(0,0,0,0.08)' }}>Secure Checkout</Typography>
            <Typography sx={{ fontSize: 11.5, color: alpha('#ffffff', 0.78), mt: 0.2, letterSpacing: 0.1 }}>Complete your subscription payment</Typography>
          </Box>

          <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', background: alpha('#ffffff', 0.12), border: `1px solid ${alpha('#ffffff', 0.18)}`, flexShrink: 0 }}>
            <LockRoundedIcon sx={{ fontSize: 16, color: '#fff' }} />
          </Box>
        </Box>
      </Box>

      <Container maxWidth="sm" sx={{ pt: { xs: 4, md: 5 } }}>
        <Box sx={{ maxWidth: 520, mx: 'auto', filter: 'drop-shadow(0px 16px 48px rgba(15, 23, 42, 0.08))' }}>
          <Box sx={{ bgcolor: SURFACE, borderRadius: '0 0 16px 16px', position: 'relative', mt: 1.25, '&::before': { content: '""', position: 'absolute', top: -10, left: 0, width: '100%', height: '10px', background: `linear-gradient(-45deg, ${SURFACE} 5px, transparent 0), linear-gradient(45deg, ${SURFACE} 5px, transparent 0)`, backgroundPosition: 'left top', backgroundRepeat: 'repeat-x', backgroundSize: '10px 10px' } }}>
            <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, pb: 2.5 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800, color: INK, letterSpacing: -0.3, lineHeight: 1.2 }}>Payment Details</Typography>
              <Typography sx={{ fontSize: 13, color: MUTED, mt: 0.5 }}>{breakdown?.planName || 'SaaS Plan'}</Typography>

              {business?.businessName && (
                <Box sx={{ mt: 2.5, px: 2, py: 1.5, borderRadius: 1.5, bgcolor: '#f8fafc', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, mb: 0.35 }}>Billing To</Typography>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{business.businessName}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{business.email}</Typography>
                  </Box>
                  <ReceiptLongRoundedIcon sx={{ fontSize: 22, color: ACCENT, flexShrink: 0 }} />
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: '#f1f4f9' }} />

            <Box sx={{ p: { xs: 3, md: 4 }, pt: { xs: 3, md: 3.5 } }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontSize: 14, color: MUTED }}>Base Amount</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: INK }}>{formatINR(breakdown?.basePrice)}</Typography>
                </Box>

                {breakdown?.platformDiscountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ fontSize: 14, color: MUTED }}>Platform Discount</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: SUCCESS }}>−{formatINR(breakdown?.platformDiscountAmount)}</Typography>
                  </Box>
                )}

                {breakdown?.couponDiscountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontSize: 14, color: MUTED }}>Coupon Discount</Typography>
                      {breakdown.couponCodes && breakdown.couponCodes.length > 0 ? (
                        breakdown.couponCodes.map((code: string) => (
                          <Chip key={code} label={code} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, bgcolor: SUCCESS_SOFT, color: SUCCESS, border: `1px solid ${SUCCESS_BORDER}`, '& .MuiChip-label': { px: 1.2 } }} />
                        ))
                      ) : breakdown.couponCode ? (
                        <Chip label={breakdown.couponCode} size="small" sx={{ height: 22, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, bgcolor: SUCCESS_SOFT, color: SUCCESS, border: `1px solid ${SUCCESS_BORDER}`, '& .MuiChip-label': { px: 1.2 } }} />
                      ) : null}
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: SUCCESS }}>−{formatINR(breakdown?.couponDiscountAmount)}</Typography>
                  </Box>
                )}

                {!breakdown?.platformDiscountAmount &&
                  !breakdown?.couponDiscountAmount &&
                  breakdown?.discountAmount > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: 14, color: MUTED }}>Total Discount</Typography>
                      <Typography sx={{ fontSize: 14, fontWeight: 700, color: SUCCESS }}>−{formatINR(breakdown?.discountAmount)}</Typography>
                    </Box>
                  )}
              </Stack>

              <Divider sx={{ my: 2.5, borderStyle: 'dashed', borderColor: BORDER }} />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontSize: 14, color: INK, fontWeight: 600 }}>Amount to be paid</Typography>
                  <Typography sx={{ fontSize: 14, color: INK, fontWeight: 600 }}>
                    {formatINR(Math.max(0, (breakdown?.basePrice || 0) - (breakdown?.discountAmount || 0)))}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ fontSize: 14, color: MUTED }}>GST (18%)</Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 600, color: INK }}>+{formatINR(breakdown?.gstAmount)}</Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2.5, borderStyle: 'dashed', borderColor: BORDER }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: hasAnyDiscount ? 2.5 : 3 }}>
                <Typography sx={{ fontSize: 15.5, fontWeight: 800, color: INK }}>Total Amount</Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color: ACCENT_DARK, lineHeight: 1 }}>{formatINR(breakdown?.totalAmount)}</Typography>
              </Box>

              {breakdown?.discountAmount > 0 && (
                <Box sx={{ border: `1.5px dashed ${SUCCESS_BORDER}`, borderRadius: 2, p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, bgcolor: SUCCESS_SOFT }}>
                  <Typography sx={{ fontSize: 13.5, color: SUCCESS, fontWeight: 700 }}>Total Saved 🎉</Typography>
                  <Typography sx={{ fontSize: 13.5, color: SUCCESS, fontWeight: 800 }}>{formatINR(breakdown?.discountAmount)}</Typography>
                </Box>
              )}

              <Box sx={{ mb: 2.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} sx={{ color: MUTED, '&.Mui-checked': { color: ACCENT }, p: 0.5, mr: 0.5 }} />
                  }
                  label={
                    <Typography sx={{ fontSize: 12.5, color: MUTED }}>
                      I agree to the{' '}
                      <Box component="span" sx={{ color: ACCENT, cursor: 'pointer', fontWeight: 600 }}>Terms</Box>{' '}
                      and{' '}
                      <Box component="span" sx={{ color: ACCENT, cursor: 'pointer', fontWeight: 600 }}>Policies</Box>
                    </Typography>
                  }
                />
              </Box>

              <Button fullWidth variant="contained" disableElevation disabled={processing || !termsAccepted} onClick={handlePayment} sx={{ py: 1.5, borderRadius: 1.5, fontSize: 15, fontWeight: 700, textTransform: 'none', boxShadow: 'none', bgcolor: ACCENT, color: '#fff', '&:hover': { bgcolor: ACCENT_DARK }, '&:disabled': { bgcolor: alpha(ACCENT, 0.4), color: '#fff' } }}>
                {processing ? (
                  <CircularProgress size={20} thickness={4} sx={{ color: '#fff' }} />
                ) : (
                  <>Proceed to pay {formatINR(breakdown?.totalAmount)}</>
                )}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.6, mt: 2 }}>
                <LockRoundedIcon sx={{ fontSize: 12, color: MUTED }} />
                <Typography sx={{ fontSize: 11, color: MUTED, fontWeight: 500 }}>Secured by 256-bit SSL encryption</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}