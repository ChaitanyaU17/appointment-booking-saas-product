import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, TextField, MenuItem, IconButton, Switch, FormControlLabel, Radio, RadioGroup, Paper, Grid, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../hook';
import { createPlan, updatePlan, fetchPlans } from '../../features/superadmin/superadminSlice';
import { showNotification } from '../../features/notifications/notificationSlice';


const PREDEFINED_CONTROLS = [
  "Google Calendar Sync",
  "Google Meet Integration",
  "Custom Branding",
  "Priority Support",
  "Analytics Access",
  "Staff Management",
  "Automated Reminders",
  "Custom Booking Page",
  "WhatsApp Notifications"
];

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
    currency: 'INR'
  });



  useEffect(() => {
    if (id) {
      if (plans.length === 0) {
        dispatch(fetchPlans());
      } else {
        const existingPlan = plans.find(p => p._id === id);
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
            currency: existingPlan.currency || 'INR'
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
      gstSettings: Yup.object({
        type: Yup.string().oneOf(['inclusive', 'exclusive']).required(),
        rate: Yup.number().min(0).max(100).required()
      }),
      planLimits: Yup.object({
        maxBookingsPerMonth: Yup.number().min(1).required('Required'),
        maxServices: Yup.number().min(1).required('Required'),
        maxAdmins: Yup.number().min(1).required('Required')
      })
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

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/superadmin/plans')} sx={{ mr: 2, bgcolor: '#e2e8f0' }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>{id ? 'Edit Plan' : 'Create Plan'}</Typography>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: { xs: 'block', md: 'flex' }, gap: 4 }}>
          {/* LEFT COLUMN: Core Settings */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField 
                    fullWidth label="Plan Name *" 
                    name="name" value={formik.values.name} onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && (formik.errors.name as string)}
                  />
                  <TextField 
                    select fullWidth label="Plan Type" 
                    name="planType" value={formik.values.planType} onChange={formik.handleChange}
                  >
                    <MenuItem value="PRIMARY">PRIMARY</MenuItem>
                    <MenuItem value="SECONDARY">SECONDARY</MenuItem>
                    <MenuItem value="ADDON">ADDON</MenuItem>
                  </TextField>
                </Box>

                <TextField 
                  fullWidth label="URL Slug *" 
                  name="slug" value={formik.values.slug} onChange={formik.handleChange}
                  error={formik.touched.slug && Boolean(formik.errors.slug)}
                />

                <TextField 
                  fullWidth label="Number of Shops *" type="number"
                  name="numberOfShops" value={formik.values.numberOfShops} onChange={formik.handleChange}
                />

                <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>GST SETTINGS</Typography>
                  <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <RadioGroup 
                      row name="gstSettings.type" 
                      value={formik.values.gstSettings.type} 
                      onChange={formik.handleChange}
                    >
                      <FormControlLabel value="exclusive" control={<Radio color="primary" />} label="Price excl. GST" />
                      <FormControlLabel value="inclusive" control={<Radio color="primary" />} label="Price incl. GST" />
                    </RadioGroup>
                    <TextField 
                      label="GST Rate (%) *" type="number" size="small" sx={{ width: 120 }}
                      name="gstSettings.rate" value={formik.values.gstSettings.rate} onChange={formik.handleChange}
                    />
                  </Box>
                </Box>

                <Box sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: '#475569' }}>PLAN LIMITS</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField 
                      fullWidth label="Max Bookings/Mo *" type="number" size="small"
                      name="planLimits.maxBookingsPerMonth" value={formik.values.planLimits.maxBookingsPerMonth} onChange={formik.handleChange}
                    />
                    <TextField 
                      fullWidth label="Max Services *" type="number" size="small"
                      name="planLimits.maxServices" value={formik.values.planLimits.maxServices} onChange={formik.handleChange}
                    />
                    <TextField 
                      fullWidth label="Max Admins *" type="number" size="small"
                      name="planLimits.maxAdmins" value={formik.values.planLimits.maxAdmins} onChange={formik.handleChange}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField 
                    fullWidth label="Number Of Users *" type="number"
                    name="numberOfUsers" value={formik.values.numberOfUsers} onChange={formik.handleChange}
                  />
                  <TextField 
                    fullWidth label="One-Time fee (₹) (Optional)" type="number"
                    name="oneTimeFee" value={formik.values.oneTimeFee} onChange={formik.handleChange}
                  />
                </Box>

                <FormControlLabel
                  control={<Switch checked={formik.values.isPublic} onChange={(e) => formik.setFieldValue('isPublic', e.target.checked)} color="primary" />}
                  label="Make Plan Public (visible to customers)"
                />
              </Stack>
            </Paper>
          </Box>

          {/* RIGHT COLUMN: Controls & Variants */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Plan Controls</Typography>
              </Box>

              <Grid container spacing={1}>
                {PREDEFINED_CONTROLS.map((ctrl) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={ctrl}>
                    <FormControlLabel
                      control={
                        <Switch 
                          size="small"
                          checked={formik.values.controls.includes(ctrl)}
                          onChange={() => toggleControl(ctrl)}
                          color="primary"
                        />
                      }
                      label={<Typography sx={{ fontSize: 13, fontWeight: 600 }}>{ctrl}</Typography>}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Plan Variants</Typography>
                <Button variant="contained" color="primary" size="small" disableElevation onClick={() => {
                  formik.setFieldValue('variants', [
                    ...formik.values.variants,
                    { name: '', billingCycle: 'monthly', durationDays: 30, price: 0 }
                  ]);
                }}>ADD VARIANTS</Button>
              </Box>

              {formik.values.variants.length === 0 && <Typography color="text.secondary" variant="body2">No variants added.</Typography>}
              
              <Stack spacing={1.5}>
                {formik.values.variants.map((v: any, i: number) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', p: 1.5, border: '1px solid #e2e8f0', borderRadius: 1, bgcolor: '#f8fafc' }}>
                    <TextField size="small" label="Title" value={v.name} onChange={(e) => formik.setFieldValue(`variants[${i}].name`, e.target.value)} sx={{ flex: 1.5, bgcolor: '#fff' }} />
                    <TextField size="small" select label="Cycle" value={v.billingCycle} onChange={(e) => formik.setFieldValue(`variants[${i}].billingCycle`, e.target.value)} sx={{ flex: 1, bgcolor: '#fff' }}>
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="half-yearly">Half Yearly</MenuItem>
                      <MenuItem value="yearly">Yearly</MenuItem>
                      <MenuItem value="one-time">One Time</MenuItem>
                    </TextField>
                    <TextField size="small" type="number" label="Days" value={v.durationDays} onChange={(e) => formik.setFieldValue(`variants[${i}].durationDays`, Number(e.target.value))} sx={{ flex: 1, bgcolor: '#fff' }} />
                    <TextField size="small" type="number" label="Price (₹)" value={v.price} onChange={(e) => formik.setFieldValue(`variants[${i}].price`, Number(e.target.value))} sx={{ flex: 1, bgcolor: '#fff' }} />
                    <IconButton color="error" onClick={() => {
                      const newV = [...formik.values.variants];
                      newV.splice(i, 1);
                      formik.setFieldValue('variants', newV);
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button type="submit" variant="contained" color="primary" size="large" disableElevation sx={{ px: 8, py: 1.5, fontWeight: 800, borderRadius: 2 }}>
            {id ? 'Update Plan' : 'Create Plan'}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
