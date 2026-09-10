import { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, CircularProgress, TextField } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hook';
import { logoutThunk } from '../../features/auth/authSlice';
import { fetchBusinessSettings, resubmitVerification } from '../../features/business/businessSlice';
import { showNotification } from '../../features/notifications/notificationSlice';

const PendingVerification = () => {
  const dispatch = useAppDispatch();
  const { settingsData, settingsLoading } = useAppSelector((state) => state.business);
  const business = settingsData?.business || null;
  
  const [category, setCategory] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [description, setDescription] = useState('');
  const [resubmitNote, setResubmitNote] = useState('');

  useEffect(() => {
    dispatch(fetchBusinessSettings());
  }, [dispatch]);

  useEffect(() => {
    if (business) {
      setCategory(business.category || '');
      setRegistrationNumber(business.registrationNumber || '');
      setDescription(business.description || '');
    }
  }, [business]);

  const handleResubmit = () => {
    dispatch(resubmitVerification({ category, registrationNumber, description, resubmitNote }))
      .unwrap()
      .then(() => {
        dispatch(showNotification({ message: 'Verification resubmitted successfully' }));
        dispatch(fetchBusinessSettings());
      })
      .catch((error: any) => {
        dispatch(showNotification({ message: typeof error === 'string' ? error : error?.message || 'Failed to resubmit', failure: true }));
      });
  };

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    window.location.href = '/login';
  };

  if (settingsLoading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (business?.verificationStatus === 'Approved') {
    window.location.href = '/business';
    return null;
  }

  return (
    <Box sx={{ height: '100vh', bgcolor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 650, width: '100%', borderRadius: 4, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <Box sx={{ height: 8, bgcolor: 'primary.main', width: '100%' }} />
        <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>

          {business?.verificationStatus === 'Pending' && (
            <>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 800, color: '#1e293b' }}>
                We're reviewing your details
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 500, mx: 'auto', mb: 2 }}>
                Thanks for registering! To keep our platform safe and secure for all customers, our team manually verifies every new business.
                <br /><br />
                This usually takes less than 24 hours. We'll email you as soon as your account is approved and ready to accept bookings!
              </Typography>
            </>
          )}

          {business?.verificationStatus === 'Rejected' && (
            <>
              <Typography variant="h4" color="error.main" gutterBottom sx={{ fontWeight: 800 }}>
                Registration Declined
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 2, fontSize: '1.1rem', mb: 2 }}>
                Unfortunately, we were unable to verify your business details at this time.
              </Typography>
              <Box sx={{ bgcolor: '#fef2f2', p: 3, borderRadius: 3, mb: 3, textAlign: 'left', border: '1px solid #fecaca' }}>
                <Typography variant="subtitle2" color="error.dark" sx={{ fontWeight: 700, mb: 1 }}>Reason for decline:</Typography>
                <Typography variant="body1" color="error.dark">{business.rejectionReason}</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                If you believe this was a mistake or have updated your details, you can resubmit for review below.
              </Typography>
              <Box sx={{ textAlign: 'left', mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Business Category"
                  fullWidth
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <TextField
                  label="Registration / License Number"
                  fullWidth
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
                <TextField
                  label="Business Description (optional)"
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <TextField
                  label="Note to Reviewer"
                  fullWidth
                  multiline
                  rows={2}
                  value={resubmitNote}
                  onChange={(e) => setResubmitNote(e.target.value)}
                  placeholder="E.g., I've corrected my registration number and updated category."
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleResubmit}
                  disabled={
                    category === (business?.category || '') &&
                    registrationNumber === (business?.registrationNumber || '') &&
                    description === (business?.description || '') &&
                    !resubmitNote.trim()
                  }
                >
                  Resubmit for Review
                </Button>
              </Box>
            </>
          )}

          {business?.verificationStatus === 'ChangesRequested' && (
            <>
              <Typography variant="h4" color="info.main" gutterBottom sx={{ fontWeight: 800 }}>
                Action Required
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontSize: '1.1rem', mb: 2 }}>
                We need a little more information from you before we can approve your account.
              </Typography>
              <Box sx={{ bgcolor: '#f0f9ff', p: 3, borderRadius: 3, mb: 4, textAlign: 'left', border: '1px solid #bae6fd' }}>
                <Typography variant="subtitle2" color="info.dark" sx={{ fontWeight: 700, mb: 1 }}>Note from our review team:</Typography>
                <Typography variant="body1" color="info.dark">{business.changesRequestedNote}</Typography>
              </Box>

              <Box sx={{ textAlign: 'left', mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Business Category"
                  fullWidth
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
                <TextField
                  label="Registration / License Number"
                  fullWidth
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                />
                <TextField
                  label="Business Description (optional)"
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <TextField 
                  label="Note to Reviewer (Optional)" 
                  fullWidth 
                  multiline 
                  rows={2} 
                  value={resubmitNote} 
                  onChange={(e) => setResubmitNote(e.target.value)} 
                  placeholder="E.g., I've updated my registration number as requested."
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleResubmit}
                  disabled={
                    category === (business?.category || '') &&
                    registrationNumber === (business?.registrationNumber || '') &&
                    description === (business?.description || '') &&
                    !resubmitNote.trim()
                  }
                >
                  Update & Resubmit
                </Button>
              </Box>
            </>
          )}

          <Button variant="outlined" color="inherit" onClick={handleLogout} sx={{ mt: 2 }}>
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PendingVerification;