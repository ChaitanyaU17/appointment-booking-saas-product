import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, Box, TextField, Button, 
  Typography, IconButton, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { showNotification } from '../../features/notifications/notificationSlice';
import { useAppDispatch } from '../../hook';
import { createDemoRequest } from '../../features/public/publicSlice';

interface BookDemoModalProps {
  open: boolean;
  onClose: () => void;
}

const BookDemoModal: React.FC<BookDemoModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();

  const formik = useFormik({
    initialValues: {
      name: '',
      mobile: '',
      businessName: '',
      category: '',
      cityState: '',
      monthlyAppointments: ''
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
      mobile: Yup.string().length(10, 'Must be exactly 10 digits').required('Required'),
      businessName: Yup.string().required('Required'),
      category: Yup.string().required('Required'),
      cityState: Yup.string().required('Required'),
      monthlyAppointments: Yup.string().required('Required'),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await dispatch(createDemoRequest(values)).unwrap();
        dispatch(showNotification({ message: 'Demo request submitted successfully. We will contact you soon!' }));
        resetForm();
        onClose();
      } catch (error: any) {
        dispatch(showNotification({ message: error || 'Failed to submit demo request', failure: true }));
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedUserIcon color="success" />
          <Typography variant="h6" sx={{fontWeight: 'bold'}}>Book a Demo</Typography>
        </Box>
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          See the platform in action! Fill in your details and our team will schedule a personalized demo tailored to your business needs.
        </Typography>

        <form onSubmit={formik.handleSubmit}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField 
              fullWidth size="small" label="Name"
              name="name"
              value={formik.values.name} onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField 
              fullWidth size="small" label="Mobile Number (10 digit)"
              name="mobile"
              value={formik.values.mobile} onChange={formik.handleChange}
              error={formik.touched.mobile && Boolean(formik.errors.mobile)}
              helperText={formik.touched.mobile && formik.errors.mobile}
            />

            <TextField 
              fullWidth size="small" label="Store / Business Name"
              name="businessName"
              value={formik.values.businessName} onChange={formik.handleChange}
              error={formik.touched.businessName && Boolean(formik.errors.businessName)}
              helperText={formik.touched.businessName && formik.errors.businessName}
            />

            <TextField 
              fullWidth size="small" label="Business Category"
              name="category"
              value={formik.values.category} onChange={formik.handleChange}
              error={formik.touched.category && Boolean(formik.errors.category)}
              helperText={formik.touched.category && formik.errors.category}
            />

            <TextField 
              fullWidth size="small" label="City & State (e.g. Pune, MH)"
              name="cityState"
              value={formik.values.cityState} onChange={formik.handleChange}
              error={formik.touched.cityState && Boolean(formik.errors.cityState)}
              helperText={formik.touched.cityState && formik.errors.cityState}
            />

            <TextField 
              select
              fullWidth 
              size="small" 
              label="Monthly Appointments"
              name="monthlyAppointments"
              value={formik.values.monthlyAppointments} 
              onChange={formik.handleChange}
              error={formik.touched.monthlyAppointments && Boolean(formik.errors.monthlyAppointments)}
              helperText={formik.touched.monthlyAppointments && formik.errors.monthlyAppointments}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
                select: {
                  displayEmpty: true,
                  renderValue: (selected: unknown) =>
                    selected ? (
                      (selected as string)
                    ) : (
                      <Typography component="span" color="text.secondary">
                        Select Volume
                      </Typography>
                    ),
                  MenuProps: {
                    slotProps: {
                      paper: {
                        style: { maxHeight: 250 },
                      },
                    },
                  },
                },
              }}
            >
              <MenuItem value="" disabled>
                Select Volume
              </MenuItem>
              <MenuItem value="Starting out (0 - 50)">Starting out (0 - 50)</MenuItem>
              <MenuItem value="Moderate (50 - 200)">Moderate (50 - 200)</MenuItem>
              <MenuItem value="High (200 - 500)">High (200 - 500)</MenuItem>
              <MenuItem value="Enterprise (500+)">Enterprise (500+)</MenuItem>
            </TextField>
          </Box>

          <Button 
            fullWidth variant="contained" color="primary" 
            type="submit" disabled={formik.isSubmitting}
            sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
          >
            Submit Request
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: '#f0fdf4', borderRadius: 1 }}>
            <VerifiedUserIcon color="success" fontSize="small" />
            <Typography variant="caption" color="success.main">
              By submitting, you agree to be contacted by our team regarding your enquiry.
            </Typography>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookDemoModal;