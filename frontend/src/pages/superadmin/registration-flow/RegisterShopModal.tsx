import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, TextField, FormControlLabel, Checkbox,
  InputAdornment, IconButton, CircularProgress
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch, useAppSelector } from '../../../hook';
import { registerBusinessByAdmin, fetchBusinesses } from '../../../features/superadmin/superadminSlice';
import { registerShopByAgent, fetchAssignedShops } from '../../../features/agent/agentSlice';
import { notifyRegistrationEvent } from '../../../utils/registrationEvents';
import { showNotification } from '../../../features/notifications/notificationSlice';

interface RegisterShopModalProps {
  open: boolean;
  onClose: () => void;
  plans?: any[];
  onSuccess?: () => void;
}

export const RegisterShopModal: React.FC<RegisterShopModalProps> = ({ open, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      additionalNotes: '',
      sendWelcomeEmail: true,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Full name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      phone: Yup.string().required('Phone number is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
      additionalNotes: Yup.string().optional(),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          name: values.name.trim(),
          ownerName: values.name.trim(),
          businessName: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          password: values.password.trim(),
          additionalNotes: values.additionalNotes.trim() || undefined,
          sendWelcomeEmail: values.sendWelcomeEmail,
        };

        if (user?.role === 'Agent') {
          const res: any = await dispatch(registerShopByAgent(payload)).unwrap();
          dispatch(showNotification({ message: res.message || 'Shop registered! Now pending verification in Registration queue.' }));
          dispatch(fetchAssignedShops());
          dispatch(fetchBusinesses());
          notifyRegistrationEvent(res);
          navigate('/agent/registration');
        } else {
          const res: any = await dispatch(registerBusinessByAdmin(payload)).unwrap();
          dispatch(showNotification({ message: res.message || 'Shop registered and onboarded successfully!' }));
          dispatch(fetchBusinesses());
          notifyRegistrationEvent(res);
        }
        formik.resetForm();
        if (onSuccess) onSuccess();
        onClose();
      } catch (err: any) {
        dispatch(showNotification({ message: err || 'Registration failed', failure: true }));
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleModalClose = () => {
    if (!formik.isSubmitting) {
      formik.resetForm();
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleModalClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 0.5 } } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #e2e8f0' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b' }}>
            Register Shop Owner
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quickly onboard a business shop directly to your active shops list.
          </Typography>
        </Box>
        <IconButton onClick={handleModalClose} size="small" disabled={formik.isSubmitting}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2.2 }}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Owner Full Name *"
            placeholder="e.g. Alex Smith"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && (formik.errors.name as string)}
          />

          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address *"
            type="email"
            placeholder="alex@example.com"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && (formik.errors.email as string)}
          />

          <TextField
            fullWidth
            id="phone"
            name="phone"
            label="Phone Number *"
            placeholder="e.g. 9876543210"
            value={formik.values.phone}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && (formik.errors.phone as string)}
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password *"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter password for owner account"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && (formik.errors.password as string)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password *"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter password to confirm"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && (formik.errors.confirmPassword as string)}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      size="small"
                    >
                      {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            multiline
            rows={2.5}
            id="additionalNotes"
            name="additionalNotes"
            label="Additional Note (Optional)"
            placeholder="Any special notes, client requirements, or remarks..."
            value={formik.values.additionalNotes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.sendWelcomeEmail}
                onChange={(e) => formik.setFieldValue('sendWelcomeEmail', e.target.checked)}
                size="small"
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Send welcome email with credentials to owner
              </Typography>
            }
            sx={{ mt: -0.5 }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1, borderTop: '1px solid #e2e8f0', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={handleModalClose}
            disabled={formik.isSubmitting}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            type="submit"
            disabled={formik.isSubmitting}
            startIcon={formik.isSubmitting ? undefined : <PersonAddIcon />}
            sx={{
              bgcolor: '#659287',
              '&:hover': { bgcolor: '#4a6b62' },
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              px: 3,
            }}
          >
            {formik.isSubmitting ? <CircularProgress size={22} color="inherit" /> : 'Register Shop'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegisterShopModal;
