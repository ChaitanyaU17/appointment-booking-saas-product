import React, { useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid, TextField, Switch,
  FormControlLabel, InputAdornment, MenuItem, Divider, CircularProgress,
  Chip, Stack, alpha, IconButton,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../hook';
import { createCoupon, updateCoupon, fetchCoupons } from '../../features/superadmin/couponSlice';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import CurrencyRupeeRoundedIcon from '@mui/icons-material/CurrencyRupeeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

const ACCENT = '#659287';
const ACCENT_DARK = '#4a6b62';
const ACCENT_SOFT = alpha(ACCENT, 0.08);
const ACCENT_BORDER = alpha(ACCENT, 0.25);

const SURFACE = '#ffffff';
const PAGE_BG = '#f6f8f7';
const BORDER = '#e6e9ef';
const MUTED = '#64748b';
const INK = '#0f172a';

const SectionHeader = ({ title, caption }: { title: string; caption?: string }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
    <Box>
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, letterSpacing: -0.1 }}>{title}</Typography>
      {caption && <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>{caption}</Typography>}
    </Box>
  </Box>
);

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, mb: 0.75 }}>
    {children}
    {required && <Box component="span" sx={{ color: ACCENT, ml: 0.4 }}>*</Box>}
  </Typography>
);

const CouponForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { coupons } = useAppSelector((state) => state.coupons);

  const isEditMode = Boolean(id);
  const existingCoupon = isEditMode ? (coupons.find((c: any) => c._id === id) as any) : null;

  useEffect(() => {
    if (isEditMode && coupons.length === 0) {
      dispatch(fetchCoupons());
    }
  }, [dispatch, isEditMode, coupons.length]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      code: existingCoupon?.code || '',
      description: existingCoupon?.description || '',
      discountType: existingCoupon?.discountType || 'percentage',
      discountValue: existingCoupon?.discountValue || '',
      validityBonusDays: existingCoupon?.validityBonusDays || '',
      isActive: existingCoupon != null ? existingCoupon.isActive : true,
      maxUsageLimit: existingCoupon?.maxUsageLimit || '',
      minPurchaseAmount: existingCoupon?.minPurchaseAmount || '',
      maxDiscountAmount: existingCoupon?.maxDiscountAmount || '',
      startDate: existingCoupon?.startDate ? new Date(existingCoupon.startDate).toISOString().split('T')[0] : '',
      expiryDate: existingCoupon?.expiryDate ? new Date(existingCoupon.expiryDate).toISOString().split('T')[0] : '',
    },
    validationSchema: Yup.object({
      code: Yup.string().required('Code is required').trim().uppercase(),
      discountType: Yup.string().oneOf(['percentage', 'fixed']).required('Type is required'),
      discountValue: Yup.number().required('Value is required').positive('Must be positive').when('discountType', { is: 'percentage', then: (schema) => schema.max(100, 'Max 100%') }),
      validityBonusDays: Yup.number().min(0, 'Must be 0 or more').nullable(),
      maxUsageLimit: Yup.number().min(1, 'Must be at least 1').nullable(),
      minPurchaseAmount: Yup.number().min(0, 'Must be 0 or more').nullable(),
      maxDiscountAmount: Yup.number().min(0, 'Must be 0 or more').nullable(),
      startDate: Yup.date().nullable(),
      expiryDate: Yup.date().min(Yup.ref('startDate'), 'Expiry date cannot be before start date').nullable(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          discountValue: Number(values.discountValue),
          validityBonusDays: values.validityBonusDays ? Number(values.validityBonusDays) : 0,
          maxUsageLimit: values.maxUsageLimit ? Number(values.maxUsageLimit) : null,
          minPurchaseAmount: values.minPurchaseAmount ? Number(values.minPurchaseAmount) : null,
          maxDiscountAmount: values.maxDiscountAmount ? Number(values.maxDiscountAmount) : null,
          startDate: values.startDate ? new Date(values.startDate).toISOString() : null,
          expiryDate: values.expiryDate ? new Date(values.expiryDate).toISOString() : null,
        };

        if (isEditMode) {
          await dispatch(updateCoupon({ id: id as string, data: payload })).unwrap();
          dispatch(showNotification({ message: 'Coupon updated successfully', failure: false }));
        } else {
          await dispatch(createCoupon(payload)).unwrap();
          dispatch(showNotification({ message: 'Coupon created successfully', failure: false }));
        }
        navigate('/superadmin/coupons');
      } catch (err: any) {
        dispatch(showNotification({ message: err || 'Failed to save coupon', failure: true }));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: SURFACE, fontSize: 13.5, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(ACCENT, 0.5) }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT, borderWidth: 1.5 } },
    '& .MuiOutlinedInput-input': { py: 1 },
  } as const;

  const previewDiscount = useMemo(() => {
    if (!formik.values.discountValue) return '—';
    return formik.values.discountType === 'percentage' ? `${formik.values.discountValue}% OFF` : `₹${formik.values.discountValue} OFF`;
  }, [formik.values.discountValue, formik.values.discountType]);

  if (isEditMode && coupons.length === 0) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={28} thickness={4} sx={{ color: ACCENT }} />
      </Box>
    );
  }

  if (isEditMode && coupons.length > 0 && !existingCoupon) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography sx={{ color: MUTED }}>Coupon not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, pb: 12 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha(SURFACE, 0.85), backdropFilter: 'blur(12px)', borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 2, md: 4 }, py: 1.75, display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/superadmin/coupons')} size="small" sx={{ border: `1px solid ${BORDER}`, borderRadius: 1.5, width: 36, height: 36, color: '#334155', '&:hover': { bgcolor: ACCENT_SOFT, borderColor: ACCENT_BORDER, color: ACCENT } }}>
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.2, color: INK, lineHeight: 1.2 }}>{isEditMode ? 'Edit Coupon' : 'Create New Coupon'}</Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>{isEditMode ? `Editing ${existingCoupon?.code || ''}` : 'Define discount rules and validity for your customers'}</Typography>
          </Box>

          <Button variant="contained" disableElevation onClick={() => formik.handleSubmit()} disabled={formik.isSubmitting} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>
            {formik.isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 2, md: 4 }, pt: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' }, gap: 3, alignItems: 'start' }}>
            <Stack spacing={2.5}>
              <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <SectionHeader title="Basic Information" caption="Identify your coupon and control its visibility" />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FieldLabel required>Coupon Code</FieldLabel>
                      <TextField
                        size="small"
                        fullWidth
                        name="code"
                        value={formik.values.code}
                        onChange={(e) => { e.target.value = e.target.value.toUpperCase(); formik.handleChange(e); }}
                        onBlur={formik.handleBlur}
                        error={formik.touched.code && Boolean(formik.errors.code)}
                        helperText={formik.touched.code && formik.errors.code ? String(formik.errors.code) : 'Letters and numbers only'}
                        placeholder="e.g. SUMMER50"
                        sx={{ ...fieldSx, '& .MuiOutlinedInput-input': { py: 1, fontFamily: '"SF Mono", "Roboto Mono", monospace', fontWeight: 600, letterSpacing: 1 } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                      <FieldLabel>Status</FieldLabel>
                      <Box sx={{ height: 36, display: 'flex', alignItems: 'center', px: 1.5, borderRadius: 1.5, border: `1px solid ${BORDER}`, bgcolor: formik.values.isActive ? ACCENT_SOFT : '#f8fafc', borderColor: formik.values.isActive ? ACCENT_BORDER : BORDER, transition: 'all .2s' }}>
                        <FormControlLabel
                          sx={{ m: 0, gap: 0.5 }}
                          control={<Switch size="small" checked={formik.values.isActive} onChange={formik.handleChange} name="isActive" sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT, opacity: 1 } }} />}
                          label={<Typography sx={{ fontSize: 12.5, fontWeight: 600, color: formik.values.isActive ? ACCENT_DARK : MUTED }}>{formik.values.isActive ? 'Active' : 'Inactive'}</Typography>}
                        />
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                      <FieldLabel>Internal Description</FieldLabel>
                      <TextField size="small" fullWidth name="description" value={formik.values.description} onChange={formik.handleChange} placeholder="e.g. 50% off for summer campaign" sx={fieldSx} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <SectionHeader title="Discount Configuration" caption="Define how much customers save" />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel required>Discount Type</FieldLabel>
                      <TextField select size="small" fullWidth name="discountType" value={formik.values.discountType} onChange={formik.handleChange} sx={fieldSx}>
                        <MenuItem value="percentage" sx={{ fontSize: 13.5 }}>Percentage (%)</MenuItem>
                        <MenuItem value="fixed" sx={{ fontSize: 13.5 }}>Fixed Amount (₹)</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel required>Discount Value</FieldLabel>
                      <TextField
                        size="small"
                        fullWidth
                        name="discountValue"
                        type="number"
                        value={formik.values.discountValue}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.discountValue && Boolean(formik.errors.discountValue)}
                        helperText={formik.touched.discountValue && formik.errors.discountValue ? String(formik.errors.discountValue) : formik.values.discountType === 'percentage' ? 'Between 1 and 100' : 'Any positive amount'}
                        placeholder={formik.values.discountType === 'percentage' ? '10' : '100'}
                        sx={fieldSx}
                        slotProps={{ input: {
                          startAdornment: formik.values.discountType === 'fixed' ? (<InputAdornment position="start"><CurrencyRupeeRoundedIcon sx={{ fontSize: 15, color: MUTED }} /></InputAdornment>) : null,
                          endAdornment: formik.values.discountType === 'percentage' ? (<InputAdornment position="end"><PercentRoundedIcon sx={{ fontSize: 15, color: MUTED }} /></InputAdornment>) : null,
                        } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel>Extra Validity</FieldLabel>
                      <TextField
                        size="small"
                        fullWidth
                        name="validityBonusDays"
                        type="number"
                        placeholder="30"
                        value={formik.values.validityBonusDays}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.validityBonusDays && Boolean(formik.errors.validityBonusDays)}
                        helperText={formik.touched.validityBonusDays && formik.errors.validityBonusDays ? String(formik.errors.validityBonusDays) : 'Bonus days added on redemption'}
                        sx={fieldSx}
                        slotProps={{ input: { endAdornment: (<InputAdornment position="end"><Typography sx={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>days</Typography></InputAdornment>) } }}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <SectionHeader title="Conditions & Limits" caption="Control when and how the coupon can be used" />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>Start Date</FieldLabel>
                      <TextField
                        size="small"
                        fullWidth
                        name="startDate"
                        type="date"
                        value={formik.values.startDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                        helperText={formik.touched.startDate && formik.errors.startDate ? String(formik.errors.startDate) : 'Leave empty to activate immediately'}
                        sx={fieldSx}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FieldLabel>End Date</FieldLabel>
                      <TextField
                        size="small"
                        fullWidth
                        name="expiryDate"
                        type="date"
                        value={formik.values.expiryDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                        helperText={formik.touched.expiryDate && formik.errors.expiryDate ? String(formik.errors.expiryDate) : 'Leave empty for no expiry'}
                        sx={fieldSx}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel>Min Purchase Amount</FieldLabel>
                      <TextField
                        size="small"
                        fullWidth
                        name="minPurchaseAmount"
                        type="number"
                        value={formik.values.minPurchaseAmount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.minPurchaseAmount && Boolean(formik.errors.minPurchaseAmount)}
                        helperText={formik.touched.minPurchaseAmount && formik.errors.minPurchaseAmount ? String(formik.errors.minPurchaseAmount) : 'Order value required to apply'}
                        placeholder="0"
                        sx={fieldSx}
                        slotProps={{ input: { startAdornment: (<InputAdornment position="start"><CurrencyRupeeRoundedIcon sx={{ fontSize: 15, color: MUTED }} /></InputAdornment>) } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel>Max Discount Cap</FieldLabel>
                      <TextField
                        size="small"
                        fullWidth
                        name="maxDiscountAmount"
                        type="number"
                        value={formik.values.maxDiscountAmount}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.maxDiscountAmount && Boolean(formik.errors.maxDiscountAmount)}
                        helperText={formik.values.discountType === 'fixed' ? 'Not applicable for fixed discounts' : formik.touched.maxDiscountAmount && formik.errors.maxDiscountAmount ? String(formik.errors.maxDiscountAmount) : 'Upper limit on savings'}
                        placeholder="0"
                        disabled={formik.values.discountType === 'fixed'}
                        sx={fieldSx}
                        slotProps={{ input: { startAdornment: (<InputAdornment position="start"><CurrencyRupeeRoundedIcon sx={{ fontSize: 15, color: MUTED }} /></InputAdornment>) } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FieldLabel>Max Total Uses</FieldLabel>
                      <TextField
                        size="small"
                        fullWidth
                        name="maxUsageLimit"
                        type="number"
                        placeholder="Unlimited"
                        value={formik.values.maxUsageLimit}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.maxUsageLimit && Boolean(formik.errors.maxUsageLimit)}
                        helperText={formik.touched.maxUsageLimit && formik.errors.maxUsageLimit ? String(formik.errors.maxUsageLimit) : 'Leave empty for unlimited'}
                        sx={fieldSx}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>

            <Box sx={{ position: { md: 'sticky' }, top: { md: 88 }, alignSelf: 'start' }}>
              <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`, color: '#fff', position: 'relative' }}>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.85 }}>Live Preview</Typography>
                  <Typography sx={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.4, mt: 0.5 }}>{previewDiscount}</Typography>
                  <Typography sx={{ fontSize: 12.5, mt: 0.5, opacity: 0.85, fontFamily: '"SF Mono", "Roboto Mono", monospace', letterSpacing: 1.5 }}>{formik.values.code || 'COUPONCODE'}</Typography>

                  <Box sx={{ position: 'absolute', left: -8, bottom: -8, width: 16, height: 16, borderRadius: '50%', bgcolor: SURFACE }} />
                  <Box sx={{ position: 'absolute', right: -8, bottom: -8, width: 16, height: 16, borderRadius: '50%', bgcolor: SURFACE }} />
                </Box>

                <CardContent sx={{ p: 2.5 }}>
                  <Stack spacing={1.75}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: 11.5, color: MUTED }}>Status</Typography>
                      <Chip
                        size="small"
                        icon={formik.values.isActive ? (<CheckCircleRoundedIcon sx={{ fontSize: 13 }} />) : undefined}
                        label={formik.values.isActive ? 'Active' : 'Inactive'}
                        sx={{ height: 22, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, bgcolor: formik.values.isActive ? ACCENT_SOFT : '#f1f5f9', color: formik.values.isActive ? ACCENT_DARK : MUTED, border: `1px solid ${formik.values.isActive ? ACCENT_BORDER : BORDER}`, '& .MuiChip-icon': { color: ACCENT, ml: 0.75 }, '& .MuiChip-label': { px: 1 } }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: 11.5, color: MUTED }}>Min purchase</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: INK }}>{formik.values.minPurchaseAmount ? `₹${formik.values.minPurchaseAmount}` : '—'}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: 11.5, color: MUTED }}>Usage limit</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: INK }}>{formik.values.maxUsageLimit || 'Unlimited'}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Typography sx={{ fontSize: 11.5, color: MUTED }}>Valid until</Typography>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: INK }}>{formik.values.expiryDate ? new Date(formik.values.expiryDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'No expiry'}</Typography>
                    </Box>

                    {formik.values.validityBonusDays && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        <Typography sx={{ fontSize: 11.5, color: MUTED }}>Bonus days</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: INK }}>+{formik.values.validityBonusDays} days</Typography>
                      </Box>
                    )}
                  </Stack>

                  <Divider sx={{ my: 2, borderColor: '#f1f4f9' }} />

                  <Box sx={{ display: 'flex', gap: 1, p: 1.5, borderRadius: 1.5, bgcolor: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}` }}>
                    <InfoOutlinedIcon sx={{ fontSize: 15, color: ACCENT, mt: 0.15, flexShrink: 0 }} />
                    <Typography sx={{ fontSize: 11.5, color: ACCENT_DARK, lineHeight: 1.5 }}>Verify the code and rules carefully — customers will see this at checkout.</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default CouponForm;