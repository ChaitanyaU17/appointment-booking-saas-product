import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, IconButton, Switch,
  Grid, Stack, Card, CardContent, alpha,
  ToggleButton, ToggleButtonGroup, InputAdornment, Tooltip, Chip,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../hook';
import { createPlan, updatePlan, fetchPlans } from '../../features/superadmin/superadminSlice';
import { showNotification } from '../../features/notifications/notificationSlice';

const ACCENT = '#659287';
const ACCENT_DARK = '#4a6b62';
const ACCENT_SOFT = alpha(ACCENT, 0.08);
const ACCENT_BORDER = alpha(ACCENT, 0.25);

const SURFACE = '#ffffff';
const PAGE_BG = '#f6f8f7';
const BORDER = '#e6e9ef';
const MUTED = '#64748b';
const INK = '#0f172a';

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  'Google Calendar Sync': <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />,
  'Google Meet Integration': <VideocamRoundedIcon sx={{ fontSize: 16 }} />,
  'Custom Branding': <PaletteRoundedIcon sx={{ fontSize: 16 }} />,
  'Priority Support': <SupportAgentRoundedIcon sx={{ fontSize: 16 }} />,
  'Analytics Access': <InsightsRoundedIcon sx={{ fontSize: 16 }} />,
  'Staff Management': <GroupsRoundedIcon sx={{ fontSize: 16 }} />,
  'Automated Reminders': <NotificationsActiveRoundedIcon sx={{ fontSize: 16 }} />,
  'Custom Booking Page': <PublicRoundedIcon sx={{ fontSize: 16 }} />,
  'WhatsApp Notifications': <ChatBubbleRoundedIcon sx={{ fontSize: 16 }} />,
};

const PREDEFINED_CONTROLS = Object.keys(FEATURE_ICONS);

const SectionCard = ({ icon, title, caption, action, children }: { icon: React.ReactNode; title: string; caption?: string; action?: React.ReactNode; children: React.ReactNode }) => (
  <Card elevation={0} sx={{ borderRadius: 2.5, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 1px 2px rgba(15,23,42,0.03)' }}>
    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: ACCENT_SOFT, color: ACCENT, border: `1px solid ${ACCENT_BORDER}`, flexShrink: 0 }}>{icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: INK, letterSpacing: -0.1 }}>{title}</Typography>
          {caption && <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>{caption}</Typography>}
        </Box>
        {action}
      </Box>
      {children}
    </CardContent>
  </Card>
);

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: MUTED, mb: 0.75 }}>
    {children}
    {required && <Box component="span" sx={{ color: ACCENT, ml: 0.4 }}>*</Box>}
  </Typography>
);

const fieldSx = {
  '& .MuiOutlinedInput-root': { borderRadius: 1.5, bgcolor: SURFACE, fontSize: 13.5, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(ACCENT, 0.5) }, '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: ACCENT, borderWidth: 1.5 } },
  '& .MuiOutlinedInput-input': { py: 1 },
} as const;

const FeatureTile = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <Box onClick={onChange} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1.75, border: `1px solid ${checked ? ACCENT_BORDER : BORDER}`, bgcolor: checked ? ACCENT_SOFT : SURFACE, cursor: 'pointer', transition: 'all .18s ease', '&:hover': { borderColor: checked ? ACCENT : alpha(ACCENT, 0.4), bgcolor: checked ? alpha(ACCENT, 0.11) : '#f8fafc' } }}>
    <Box sx={{ width: 30, height: 30, borderRadius: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: checked ? ACCENT : alpha(MUTED, 0.09), color: checked ? '#fff' : MUTED, transition: 'all .18s ease', flexShrink: 0 }}>{FEATURE_ICONS[label]}</Box>
    <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 600, color: checked ? INK : MUTED, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</Typography>
    <Switch size="small" checked={checked} onChange={onChange} onClick={(e) => e.stopPropagation()} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT, opacity: 1 } }} />
  </Box>
);

export default function PlanForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { plans } = useAppSelector((state) => state.superadmin);

  const [initialValues, setInitialValues] = useState<any>({
    name: '',
    slug: '',
    planType: 'PRIMARY',
    numberOfShops: 1,
    numberOfUsers: 1,
    oneTimeFee: 0,
    gstSettings: { type: 'exclusive', rate: 18 },
    planLimits: { maxBookingsPerMonth: 50, maxServices: 5, maxAdmins: 1 },
    isPublic: false,
    controls: [],
    variants: [],
    displayOrder: 0,
    currency: 'INR',
  });

  useEffect(() => {
    if (id) {
      if (plans.length === 0) {
        dispatch(fetchPlans());
      } else {
        const existingPlan = plans.find((p: any) => p._id === id);
        if (existingPlan) {
          setInitialValues({
            name: existingPlan.name || '',
            slug: existingPlan.slug || '',
            planType: existingPlan.planType || 'PRIMARY',
            numberOfShops: existingPlan.numberOfShops || 1,
            numberOfUsers: existingPlan.numberOfUsers || 1,
            oneTimeFee: existingPlan.oneTimeFee || 0,
            gstSettings: existingPlan.gstSettings || { type: 'exclusive', rate: 18 },
            planLimits: existingPlan.planLimits || { maxBookingsPerMonth: 50, maxServices: 5, maxAdmins: 1 },
            isPublic: existingPlan.isPublic || false,
            controls: existingPlan.controls || [],
            variants: existingPlan.variants || [],
            displayOrder: existingPlan.displayOrder || 0,
            currency: existingPlan.currency || 'INR',
          });
        }
      }
    }
  }, [id, plans, dispatch]);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      slug: Yup.string().required('Required').matches(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
      planType: Yup.string().required('Required'),
      numberOfShops: Yup.number().min(1, 'Minimum 1').required('Required'),
      numberOfUsers: Yup.number().min(1, 'Minimum 1').required('Required'),
      oneTimeFee: Yup.number().min(0, 'Minimum 0'),
      gstSettings: Yup.object({ type: Yup.string().oneOf(['inclusive', 'exclusive']).required(), rate: Yup.number().min(0).max(100).required() }),
      planLimits: Yup.object({ maxBookingsPerMonth: Yup.number().min(1).required('Required'), maxServices: Yup.number().min(1).required('Required'), maxAdmins: Yup.number().min(1).required('Required') }),
    }),
    onSubmit: async (values) => {
      try {
        if (id) {
          await dispatch(updatePlan({ id, data: values })).unwrap();
          dispatch(showNotification({ message: 'Plan updated successfully!' }));
        } else {
          await dispatch(createPlan(values)).unwrap();
          dispatch(showNotification({ message: 'Plan created successfully!' }));
        }
        navigate('/superadmin/plans');
      } catch (error: any) {
        dispatch(showNotification({ message: error || 'Failed to save plan', failure: true }));
      }
    },
  });

  const toggleControl = (ctrl: string) => {
    const current = formik.values.controls;
    if (current.includes(ctrl)) {
      formik.setFieldValue('controls', current.filter((c: string) => c !== ctrl));
    } else {
      formik.setFieldValue('controls', [...current, ctrl]);
    }
  };

  const isEditMode = Boolean(id);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, pb: 12 }}>
      <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: alpha(SURFACE, 0.85), backdropFilter: 'blur(12px)', borderBottom: `1px solid ${BORDER}` }}>
        <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, md: 4 }, py: 1.75, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.2, color: INK, lineHeight: 1.2 }}>{isEditMode ? 'Edit Plan' : 'Create New Plan'}</Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>Define subscription package, limits, and capabilities</Typography>
          </Box>

          <Button variant="contained" disableElevation onClick={() => formik.handleSubmit()} disabled={formik.isSubmitting} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.5, boxShadow: 'none', bgcolor: ACCENT, '&:hover': { bgcolor: ACCENT_DARK } }}>
            {formik.isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Create Plan'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 960, mx: 'auto', px: { xs: 2, md: 4 }, pt: 4 }}>
        <form onSubmit={formik.handleSubmit}>
          <Stack spacing={2.5}>
            <SectionCard icon={<BadgeRoundedIcon sx={{ fontSize: 17 }} />} title="Basic Information" caption="Identify the plan and control its visibility">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <FieldLabel required>Plan Name</FieldLabel>
                  <TextField size="small" fullWidth name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name ? String(formik.errors.name) : 'Shown to admins and customers'} placeholder="e.g. Growth Plan" sx={fieldSx} />
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
                  <FieldLabel required>Plan Type</FieldLabel>
                  <TextField select size="small" fullWidth name="planType" value={formik.values.planType} onChange={formik.handleChange} sx={fieldSx}>
                    <MenuItem value="PRIMARY" sx={{ fontSize: 13.5 }}>PRIMARY</MenuItem>
                    <MenuItem value="SECONDARY" sx={{ fontSize: 13.5 }}>SECONDARY</MenuItem>
                    <MenuItem value="ADDON" sx={{ fontSize: 13.5 }}>ADDON</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FieldLabel required>URL Slug</FieldLabel>
                  <TextField
                    size="small"
                    fullWidth
                    name="slug"
                    value={formik.values.slug}
                    onChange={(e) => { e.target.value = e.target.value.toLowerCase(); formik.handleChange(e); }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.slug && Boolean(formik.errors.slug)}
                    helperText={formik.touched.slug && formik.errors.slug ? String(formik.errors.slug) : 'Lowercase letters, numbers, and hyphens only'}
                    placeholder="growth-plan"
                    sx={{ ...fieldSx, '& .MuiOutlinedInput-input': { py: 1, fontFamily: '"SF Mono", "Roboto Mono", monospace', fontWeight: 500, letterSpacing: 0.3 } }}
                    slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Typography sx={{ fontSize: 12.5, color: MUTED, fontWeight: 500 }}>/plans/</Typography></InputAdornment>) } }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.75, borderRadius: 1.75, border: `1px solid ${formik.values.isPublic ? ACCENT_BORDER : BORDER}`, bgcolor: formik.values.isPublic ? ACCENT_SOFT : '#fbfcfe', transition: 'all .2s ease' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: INK }}>Make Plan Public</Typography>
                      <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>Public plans are visible to customers on the pricing page.</Typography>
                    </Box>
                    <Switch checked={formik.values.isPublic} onChange={(e) => formik.setFieldValue('isPublic', e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: ACCENT }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: ACCENT, opacity: 1 } }} />
                  </Box>
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard icon={<StorefrontRoundedIcon sx={{ fontSize: 17 }} />} title="Capacity & Scale" caption="How much a tenant can grow under this plan">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel required>Number of Shops</FieldLabel>
                  <TextField size="small" fullWidth type="number" name="numberOfShops" value={formik.values.numberOfShops} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.numberOfShops && Boolean(formik.errors.numberOfShops)} helperText={formik.touched.numberOfShops && formik.errors.numberOfShops ? String(formik.errors.numberOfShops) : 'Business outlets allowed'} sx={fieldSx} />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel required>Number of Users</FieldLabel>
                  <TextField size="small" fullWidth type="number" name="numberOfUsers" value={formik.values.numberOfUsers} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.numberOfUsers && Boolean(formik.errors.numberOfUsers)} helperText={formik.touched.numberOfUsers && formik.errors.numberOfUsers ? String(formik.errors.numberOfUsers) : 'Team members included'} sx={fieldSx} />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel>Display Order</FieldLabel>
                  <TextField size="small" fullWidth type="number" name="displayOrder" value={formik.values.displayOrder} onChange={formik.handleChange} helperText="Lower numbers show first" sx={fieldSx} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard icon={<PaymentsRoundedIcon sx={{ fontSize: 17 }} />} title="Pricing & Tax" caption="Base pricing and GST configuration">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>One-Time Fee</FieldLabel>
                  <TextField size="small" fullWidth type="number" name="oneTimeFee" value={formik.values.oneTimeFee} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.oneTimeFee && Boolean(formik.errors.oneTimeFee)} helperText="Optional setup fee — leave 0 if none" sx={fieldSx} slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Typography sx={{ fontSize: 13.5, color: MUTED, fontWeight: 600 }}>₹</Typography></InputAdornment>) } }} />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FieldLabel>Currency</FieldLabel>
                  <TextField select size="small" fullWidth name="currency" value={formik.values.currency} onChange={formik.handleChange} sx={fieldSx}>
                    <MenuItem value="INR" sx={{ fontSize: 13.5 }}>INR — Indian Rupee</MenuItem>
                    <MenuItem value="USD" sx={{ fontSize: 13.5 }}>USD — US Dollar</MenuItem>
                    <MenuItem value="AED" sx={{ fontSize: 13.5 }}>AED — UAE Dirham</MenuItem>
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ p: 2, borderRadius: 1.75, bgcolor: '#fbfcfe', border: `1px solid ${BORDER}` }}>
                    <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, mb: 1.5 }}>GST Configuration</Typography>

                    <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <FieldLabel>Price Mode</FieldLabel>
                        <ToggleButtonGroup exclusive size="small" value={formik.values.gstSettings.type} onChange={(_, val) => { if (val) formik.setFieldValue('gstSettings.type', val); }} sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontSize: 12.5, fontWeight: 700, borderRadius: 1.5, px: 2, py: 0.75, color: '#475569', bgcolor: SURFACE, borderColor: BORDER, '&:hover': { bgcolor: alpha(ACCENT, 0.06), borderColor: alpha(ACCENT, 0.5) }, '&.Mui-selected': { bgcolor: ACCENT, color: '#fff', borderColor: ACCENT, fontWeight: 700, '&:hover': { bgcolor: ACCENT_DARK, borderColor: ACCENT_DARK } }, '&.Mui-selected + .MuiToggleButton-root': { borderLeftColor: ACCENT } } }}>
                          <ToggleButton value="exclusive">Price excl. GST</ToggleButton>
                          <ToggleButton value="inclusive">Price incl. GST</ToggleButton>
                        </ToggleButtonGroup>
                      </Grid>

                      <Grid size={{ xs: 12, sm: 4 }}>
                        <FieldLabel required>GST Rate</FieldLabel>
                        <TextField size="small" fullWidth type="number" name="gstSettings.rate" value={formik.values.gstSettings.rate} onChange={formik.handleChange} sx={fieldSx} slotProps={{ input: { endAdornment: (<InputAdornment position="end"><Typography sx={{ fontSize: 13.5, color: MUTED, fontWeight: 600 }}>%</Typography></InputAdornment>) } }} />
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard icon={<TuneRoundedIcon sx={{ fontSize: 17 }} />} title="Operational Limits" caption="Monthly caps and resource ceilings">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel required>Max Bookings / Month</FieldLabel>
                  <TextField size="small" fullWidth type="number" name="planLimits.maxBookingsPerMonth" value={formik.values.planLimits.maxBookingsPerMonth} onChange={formik.handleChange} sx={fieldSx} />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel required>Max Services</FieldLabel>
                  <TextField size="small" fullWidth type="number" name="planLimits.maxServices" value={formik.values.planLimits.maxServices} onChange={formik.handleChange} sx={fieldSx} />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <FieldLabel required>Max Admins</FieldLabel>
                  <TextField size="small" fullWidth type="number" name="planLimits.maxAdmins" value={formik.values.planLimits.maxAdmins} onChange={formik.handleChange} sx={fieldSx} />
                </Grid>
              </Grid>
            </SectionCard>

            <SectionCard
              icon={<ExtensionRoundedIcon sx={{ fontSize: 17 }} />}
              title="Feature Controls"
              caption="Toggle the capabilities bundled with this plan"
              action={<Chip label={`${formik.values.controls.length} / ${PREDEFINED_CONTROLS.length} enabled`} size="small" sx={{ height: 24, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, bgcolor: formik.values.controls.length > 0 ? ACCENT : '#94a3b8', color: '#fff', border: `1px solid ${formik.values.controls.length > 0 ? ACCENT : '#94a3b8'}`, transition: 'background-color .2s ease, border-color .2s ease', '& .MuiChip-label': { px: 1.5 } }} />}
            >
              <Grid container spacing={1.5}>
                {PREDEFINED_CONTROLS.map((ctrl) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={ctrl}>
                    <FeatureTile label={ctrl} checked={formik.values.controls.includes(ctrl)} onChange={() => toggleControl(ctrl)} />
                  </Grid>
                ))}
              </Grid>
            </SectionCard>

            <SectionCard
              icon={<LayersRoundedIcon sx={{ fontSize: 17 }} />}
              title="Plan Variants"
              caption="Pricing tiers with different billing cycles"
              action={<Button variant="contained" size="small" disableElevation onClick={() => { formik.setFieldValue('variants', [...formik.values.variants, { name: '', billingCycle: 'monthly', durationDays: 30, price: 0 }]); }} sx={{ textTransform: 'none', fontWeight: 700, fontSize: 12.5, borderRadius: 1.5, px: 2, py: 0.75, bgcolor: ACCENT, color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: ACCENT_DARK, boxShadow: 'none' } }}>Add Variant</Button>}
            >
              {formik.values.variants.length === 0 ? (
                <Box sx={{ p: 3, borderRadius: 1.75, bgcolor: '#fbfcfe', border: `1px dashed ${BORDER}`, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: INK }}>No variants added yet</Typography>
                  <Typography sx={{ fontSize: 12, color: MUTED, mt: 0.5 }}>Add pricing tiers for monthly, quarterly, or yearly billing.</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5}>
                  {formik.values.variants.map((v: any, i: number) => (
                    <Box key={i} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.6fr 1.1fr 0.7fr 1fr auto' }, gap: 1.5, alignItems: 'center', p: 1.75, borderRadius: 1.75, border: `1px solid ${BORDER}`, bgcolor: '#fbfcfe', transition: 'border-color .2s ease', '&:hover': { borderColor: alpha(ACCENT, 0.35) } }}>
                      <TextField size="small" label="Title" placeholder="e.g. Monthly" value={v.name} onChange={(e) => formik.setFieldValue(`variants[${i}].name`, e.target.value)} sx={fieldSx} />

                      <TextField size="small" select label="Cycle" value={v.billingCycle} onChange={(e) => formik.setFieldValue(`variants[${i}].billingCycle`, e.target.value)} sx={fieldSx}>
                        <MenuItem value="monthly" sx={{ fontSize: 13.5 }}>Monthly</MenuItem>
                        <MenuItem value="half-yearly" sx={{ fontSize: 13.5 }}>Half Yearly</MenuItem>
                        <MenuItem value="yearly" sx={{ fontSize: 13.5 }}>Yearly</MenuItem>
                        <MenuItem value="one-time" sx={{ fontSize: 13.5 }}>One Time</MenuItem>
                      </TextField>

                      <TextField size="small" type="number" label="Days" value={v.durationDays} onChange={(e) => formik.setFieldValue(`variants[${i}].durationDays`, Number(e.target.value))} sx={fieldSx} />

                      <TextField size="small" type="number" label="Price" value={v.price} onChange={(e) => formik.setFieldValue(`variants[${i}].price`, Number(e.target.value))} sx={fieldSx} slotProps={{ input: { startAdornment: (<InputAdornment position="start"><Typography sx={{ fontSize: 13.5, color: MUTED, fontWeight: 600 }}>₹</Typography></InputAdornment>) } }} />

                      <Tooltip title="Remove variant" arrow>
                        <IconButton size="small" onClick={() => { const newV = [...formik.values.variants]; newV.splice(i, 1); formik.setFieldValue('variants', newV); }} sx={{ width: 36, height: 36, color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 1.5, bgcolor: SURFACE, '&:hover': { color: '#dc2626', borderColor: '#fecaca', bgcolor: '#fef2f2' } }}>
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Stack>
              )}
            </SectionCard>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}