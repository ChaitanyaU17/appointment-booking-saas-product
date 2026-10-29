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
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

import { ACCENT, ACCENT_DARK, ACCENT_SOFT, ACCENT_BORDER, SURFACE, PAGE_BG, BORDER, MUTED, INK, SUCCESS, SUCCESS_SOFT, SUCCESS_BORDER, ERROR, ERROR_SOFT, ERROR_BORDER } from '../../theme/colors';

const formatINR = (v?: number | string) =>
  `₹${Number(v || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const MetaPill = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) => (
  <Box className="invoice-pill" sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 0.9, borderRadius: 1.5, bgcolor: '#f8fafc', border: `1px solid ${BORDER}` }}>
    <Box sx={{ color: MUTED, display: 'flex' }}>{icon}</Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, lineHeight: 1 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK, mt: 0.25, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</Typography>
    </Box>
  </Box>
);

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

  if (success || business?.paymentStatus === 'Paid' || Boolean(business?.paymentReferenceId)) {
    const breakdown = receiptData?.paymentBreakdown || business?.paymentBreakdown;
    const refId = receiptData?.paymentReferenceId || business?.paymentReferenceId || (token?.length === 24 ? token.toUpperCase() : token?.slice(0, 12).toUpperCase());
    const date = receiptData?.createdAt ? new Date(receiptData.createdAt) : (business?.updatedAt ? new Date(business.updatedAt) : new Date());
    const customer = receiptData?.customerSnapshot || business;

    const basePrice = breakdown?.basePrice || 0;
    const platformDiscount = breakdown?.platformDiscountAmount || 0;
    const couponDiscount = breakdown?.couponDiscountAmount || 0;
    const totalDiscount = breakdown?.discountAmount || platformDiscount + couponDiscount;
    const taxable = Math.max(0, basePrice - totalDiscount);
    const gst = breakdown?.gstAmount || 0;
    const total = breakdown?.totalAmount || 0;

    return (
      <Box className="invoice-wrap" sx={{ minHeight: '100vh', bgcolor: PAGE_BG, py: { xs: 3, sm: 6 }, px: { xs: 2, sm: 3 } }}>
        <style>
          {`
            @media print {
              html, body, main {
                background: #fff !important;
                margin: 0 !important;
                padding: 0 !important;
                min-height: 0 !important;
                height: auto !important;
              }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              header, footer, nav, .MuiAppBar-root, #main-sidebar, .no-print { display: none !important; }

              /* Strip shadows, filters, borders from the card shell */
              .invoice-wrap { padding: 0 !important; margin: 0 !important; min-height: 0 !important; background: #fff !important; }
              .invoice-wrap > .MuiBox-root { filter: none !important; box-shadow: none !important; max-width: 100% !important; margin: 0 !important; }
              .invoice-paper { box-shadow: none !important; border: none !important; border-radius: 0 !important; }

              /* ============ Compress vertical rhythm ============ */
              .invoice-header { padding: 12px 20px !important; }
              .invoice-meta { padding: 8px 20px !important; }
              .invoice-body { padding: 12px 20px !important; }
              .invoice-footer { padding: 8px 20px !important; }

              .invoice-parties { margin-bottom: 12px !important; gap: 10px !important; }
              .invoice-party-card { padding: 10px 12px !important; }
              .invoice-party-card .MuiTypography-root { line-height: 1.35 !important; }

              .invoice-section-title { margin-bottom: 6px !important; }

              .invoice-table { margin-bottom: 10px !important; }
              .invoice-table-header { padding: 6px 14px !important; }
              .invoice-table-row { padding: 8px 14px !important; }
              .invoice-subtotals { padding: 10px 14px !important; }
              .invoice-total-row { padding: 10px 14px !important; }

              .invoice-savings { margin-bottom: 10px !important; padding: 8px 12px !important; }
              .invoice-thanks { padding: 8px 0 !important; }

              /* Slightly tighter internal spacing so it all fits */
              .invoice-pill { padding: 6px 12px !important; }
              .invoice-subtotals > * { margin-bottom: 6px !important; }

              /* Avoid breaking the invoice across pages */
              .invoice-paper { page-break-inside: avoid !important; break-inside: avoid !important; }
              .invoice-table { page-break-inside: avoid !important; break-inside: avoid !important; }

              @page { margin: 8mm; size: A4 portrait; }
            }
          `}
        </style>

        <Box sx={{ maxWidth: 780, mx: 'auto', filter: 'drop-shadow(0px 20px 60px rgba(15, 23, 42, 0.1))' }}>
          <Paper className="invoice-paper" elevation={0} sx={{ borderRadius: 3, bgcolor: SURFACE, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <Box className="invoice-header" sx={{ position: 'relative', background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`, color: '#fff', px: { xs: 3, md: 4.5 }, py: { xs: 3, md: 4 }, overflow: 'hidden' }}>
              <Box sx={{ position: 'absolute', inset: 0, background: `radial-gradient(120% 120% at 0% 0%, ${alpha('#ffffff', 0.12)} 0%, transparent 50%)`, pointerEvents: 'none' }} />
              <Typography sx={{ position: 'absolute', right: { xs: -20, md: 20 }, bottom: -30, fontSize: { xs: 100, md: 140 }, fontWeight: 900, letterSpacing: -6, color: alpha('#ffffff', 0.06), lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>PAID</Typography>

              <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', background: alpha('#ffffff', 0.16), border: `1px solid ${alpha('#ffffff', 0.24)}`, backdropFilter: 'blur(10px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)' }}>
                      <ReceiptLongRoundedIcon sx={{ fontSize: 20, color: '#fff' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: alpha('#ffffff', 0.75), lineHeight: 1 }}>Invoice</Typography>
                      <Typography sx={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, color: '#fff', mt: 0.25, lineHeight: 1.1 }}>Tax Receipt</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: alpha('#ffffff', 0.78), letterSpacing: 0.1 }}>Official record of your subscription payment</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.75, py: 1, borderRadius: 1.75, background: alpha('#ffffff', 0.14), border: `1px solid ${alpha('#ffffff', 0.22)}`, backdropFilter: 'blur(10px)' }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#fff' }} />
                  <Box>
                    <Typography sx={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: alpha('#ffffff', 0.7), lineHeight: 1 }}>Status</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 800, color: '#fff', mt: 0.2, lineHeight: 1.1 }}>Paid in Full</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box className="invoice-meta" sx={{ px: { xs: 3, md: 4.5 }, py: 2.5, bgcolor: '#fbfcfe', borderBottom: `1px solid ${BORDER}`, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              <MetaPill icon={<CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />} label="Invoice Date" value={date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} />
              <MetaPill icon={<TagRoundedIcon sx={{ fontSize: 14 }} />} label="Transaction ID" value={<Box component="span" sx={{ fontFamily: '"SF Mono", monospace', fontSize: 11.5, letterSpacing: 0.4 }}>{refId}</Box>} />
              <MetaPill icon={<AccountBalanceRoundedIcon sx={{ fontSize: 14 }} />} label="Payment Mode" value="Online · Card / UPI" />
            </Box>

            <Box className="invoice-body" sx={{ p: { xs: 3, md: 4.5 } }}>
              <Box className="invoice-parties" sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 4 }}>
                <Box className="invoice-party-card" sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${BORDER}`, bgcolor: SURFACE }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PersonRoundedIcon sx={{ fontSize: 15 }} />
                    </Box>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED }}>Billed To</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: INK, lineHeight: 1.3 }}>{customer?.businessName || customer?.name || 'Customer'}</Typography>
                  <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.75, lineHeight: 1.5 }}>{customer?.email || 'No email provided'}</Typography>
                  {customer?.phone && <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.25, lineHeight: 1.5 }}>{customer.phone}</Typography>}
                </Box>

                <Box className="invoice-party-card" sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${BORDER}`, bgcolor: SURFACE }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: 1.5, bgcolor: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <WorkspacePremiumRoundedIcon sx={{ fontSize: 15 }} />
                    </Box>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED }}>Issued By</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 15.5, fontWeight: 700, color: INK, lineHeight: 1.3 }}>Subscription Platform</Typography>
                  <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.75, lineHeight: 1.5 }}>GST-compliant tax invoice</Typography>
                  <Typography sx={{ fontSize: 12.5, color: MUTED, mt: 0.25, lineHeight: 1.5 }}>Auto-generated receipt</Typography>
                </Box>
              </Box>

              <Box className="invoice-table" sx={{ mb: 4 }}>
                <Typography className="invoice-section-title" sx={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, mb: 1.5 }}>Subscription Details</Typography>

                <Box sx={{ border: `1px solid ${BORDER}`, borderRadius: 2, overflow: 'hidden' }}>
                  <Box className="invoice-table-header" sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 2, px: 2.5, py: 1.5, bgcolor: '#f8fafc', borderBottom: `1px solid ${BORDER}` }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED }}>Description</Typography>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED }}>Amount</Typography>
                  </Box>

                  <Box className="invoice-table-row" sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 2, px: 2.5, py: 2, borderBottom: `1px solid ${BORDER}`, alignItems: 'center' }}>
                    <Box>
                      <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK, letterSpacing: -0.1 }}>{breakdown?.planName || 'Subscription Plan'}</Typography>
                      <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.35 }}>One-time subscription charge</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK, textAlign: 'right' }}>{formatINR(basePrice)}</Typography>
                  </Box>

                  <Box className="invoice-subtotals" sx={{ px: 2.5, py: 2, bgcolor: '#fbfcfe' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
                      <Typography sx={{ fontSize: 13, color: MUTED }}>Subtotal</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: INK }}>{formatINR(basePrice)}</Typography>
                    </Box>

                    {platformDiscount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
                        <Typography sx={{ fontSize: 13, color: MUTED }}>Platform Discount</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: SUCCESS }}>−{formatINR(platformDiscount)}</Typography>
                      </Box>
                    )}

                    {couponDiscount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25, alignItems: 'center', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography sx={{ fontSize: 13, color: MUTED }}>Coupon Discount</Typography>
                          {breakdown?.couponCodes?.length > 0 ? (
                            breakdown.couponCodes.map((code: string) => (
                              <Chip key={code} label={code} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, bgcolor: SUCCESS_SOFT, color: SUCCESS, border: `1px solid ${SUCCESS_BORDER}`, '& .MuiChip-label': { px: 1 } }} />
                            ))
                          ) : breakdown?.couponCode ? (
                            <Chip label={breakdown.couponCode} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, bgcolor: SUCCESS_SOFT, color: SUCCESS, border: `1px solid ${SUCCESS_BORDER}`, '& .MuiChip-label': { px: 1 } }} />
                          ) : null}
                        </Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: SUCCESS }}>−{formatINR(couponDiscount)}</Typography>
                      </Box>
                    )}

                    {totalDiscount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.25, mt: 0.5, borderTop: `1px dashed ${BORDER}` }}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: INK }}>Taxable Amount</Typography>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: INK }}>{formatINR(taxable)}</Typography>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.25 }}>
                      <Typography sx={{ fontSize: 13, color: MUTED }}>GST (18%)</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: INK }}>+{formatINR(gst)}</Typography>
                    </Box>
                  </Box>

                  <Box className="invoice-total-row" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2.5, bgcolor: ACCENT_SOFT, borderTop: `1px solid ${ACCENT_BORDER}` }}>
                    <Box>
                      <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: ACCENT_DARK, lineHeight: 1 }}>Total Paid</Typography>
                      <Typography sx={{ fontSize: 11.5, color: ACCENT_DARK, mt: 0.4, opacity: 0.85 }}>Inclusive of all taxes</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.6, color: ACCENT_DARK, lineHeight: 1 }}>{formatINR(total)}</Typography>
                  </Box>
                </Box>
              </Box>

              {totalDiscount > 0 && (
                <Box className="invoice-savings" sx={{ mb: 4, p: 2, borderRadius: 2, border: `1.5px dashed ${SUCCESS_BORDER}`, bgcolor: SUCCESS_SOFT, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 18, color: SUCCESS }} />
                    <Typography sx={{ fontSize: 13.5, color: SUCCESS, fontWeight: 700 }}>You saved on this invoice</Typography>
                  </Box>
                  <Typography sx={{ fontSize: 15, color: SUCCESS, fontWeight: 800 }}>{formatINR(totalDiscount)}</Typography>
                </Box>
              )}

              <Box className="invoice-thanks" sx={{ textAlign: 'center', py: 2, borderTop: `1px dashed ${BORDER}` }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, letterSpacing: -0.1 }}>Thank you for your business.</Typography>
                <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.5, lineHeight: 1.55, maxWidth: 480, mx: 'auto' }}>
                  This is a computer-generated invoice and does not require a physical signature. For any payment-related queries, please contact support with your transaction ID.
                </Typography>
              </Box>
            </Box>

            <Box className="no-print invoice-footer" sx={{ px: { xs: 3, md: 4.5 }, py: 2.5, bgcolor: '#fbfcfe', borderTop: `1px solid ${BORDER}`, display: 'flex', gap: 1.5, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<PrintRoundedIcon sx={{ fontSize: 17 }} />}
                onClick={() => window.print()}
                sx={{ textTransform: 'none', fontWeight: 700, fontSize: 13, borderRadius: 1.5, px: 2.5, color: INK, borderColor: BORDER, '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f1f5f9' } }}
              >
                Print Invoice
              </Button>
            </Box>
          </Paper>

        </Box>
      </Box>
    );
  }

  const breakdown = business?.paymentBreakdown;

  const hasAnyDiscount =
    breakdown?.platformDiscountAmount > 0 ||
    breakdown?.couponDiscountAmount > 0 ||
    breakdown?.discountAmount > 0;
    
  const planObj = business?.planId || breakdown?.planId;
  const variantId = breakdown?.planVariantId;
  const selectedVariant = planObj?.variants?.find((v: any) => v._id === variantId);
  const durationDays = selectedVariant?.durationDays || 30;
  const variantName = selectedVariant?.name;
  const actualValidityDays = (breakdown?.startDate && breakdown?.endDate) 
    ? Math.round((new Date(breakdown.endDate).getTime() - new Date(breakdown.startDate).getTime()) / (1000 * 3600 * 24)) 
    : durationDays;
  const hasBonus = actualValidityDays > durationDays;
  const dateSelected = business?.paymentLinkGeneratedAt ? new Date(business.paymentLinkGeneratedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

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
              
              <Box sx={{ mt: 2.5, p: 2.5, borderRadius: 2, bgcolor: '#f8fafc', border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Plan Name</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK }}>{breakdown?.planName || 'SaaS Plan'}</Typography>
                </Box>
                {variantName && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Variant</Typography>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{variantName}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Base Duration</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{durationDays} Days</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Total Validity</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: ACCENT }}>{actualValidityDays} Days {hasBonus ? '(Includes Bonus)' : ''}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 13, color: MUTED, fontWeight: 500 }}>Date Selected</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: INK }}>{dateSelected}</Typography>
                </Box>
              </Box>

              {(business?.name || business?.businessName) && (
                <Box sx={{ mt: 2.5, px: 2, py: 1.5, borderRadius: 1.5, bgcolor: '#ffffff', border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, mb: 0.35 }}>Billing To</Typography>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{business.name || business.businessName}</Typography>
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
                  <Typography sx={{ fontSize: 13.5, color: SUCCESS, fontWeight: 700 }}>Total Saved</Typography>
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