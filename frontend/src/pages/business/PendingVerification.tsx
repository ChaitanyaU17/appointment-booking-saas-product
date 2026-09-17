import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, CircularProgress,
  TextField, Divider, Chip, Stack, IconButton, alpha,
} from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../hook';
import { logoutThunk } from '../../features/auth/authSlice';
import { fetchBusinessSettings, resubmitVerification } from '../../features/business/businessSlice';
import { showNotification } from '../../features/notifications/notificationSlice';

import HourglassTopRoundedIcon from '@mui/icons-material/HourglassTopRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';


const TONE: Record<string, { color: string; soft: string; border: string }> = {
  success: { color: '#059669', soft: '#ecfdf5', border: '#a7f3d0' },
  warning: { color: '#d97706', soft: '#fffbeb', border: '#fde68a' },
  error:   { color: '#dc2626', soft: '#fef2f2', border: '#fecaca' },
  info:    { color: '#2563eb', soft: '#eff6ff', border: '#bfdbfe' },
  idle:    { color: '#64748b', soft: '#f8fafc', border: '#e2e8f0' },
};

const SURFACE = '#ffffff';
const PAGE_BG = '#f6f8fb';
const BORDER = '#e6e9ef';
const MUTED = '#64748b';
const INK = '#0f172a';

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <Box>
    <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED, mb: 0.75}}>
      {label}
    </Typography>
    {children}
    {hint && (
      <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.5 }}>{hint}</Typography>
    )}
  </Box>
);

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
        dispatch(
          showNotification({
            message: typeof error === 'string' ? error : error?.message || 'Failed to resubmit',
            failure: true,
          })
        );
      });
  };

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    window.location.href = '/login';
  };

  if (settingsLoading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: PAGE_BG }}>
        <CircularProgress size={32} thickness={4} />
      </Box>
    );
  }

  if (business?.verificationStatus === 'Approved') {
    window.location.href = '/business';
    return null;
  }

  const status = business?.verificationStatus;

  const meta =
    status === 'Rejected'
      ? {
          tone: TONE.error,
          icon: <GavelRoundedIcon sx={{ fontSize: 24 }} />,
          eyebrow: 'Registration declined',
          title: 'Your application was not approved',
          subtitle:
            'Unfortunately we were unable to verify your business details at this time. Review the reason below — you can correct your details and resubmit.',
          noteLabel: 'Reason for decline',
          note: business?.rejectionReason,
          cta: 'Resubmit for Review',
        }
      : status === 'ChangesRequested'
      ? {
          tone: TONE.info,
          icon: <EditNoteRoundedIcon sx={{ fontSize: 24 }} />,
          eyebrow: 'Action required',
          title: 'A few details need updating',
          subtitle:
            'Our review team needs a little more information before we can approve your account. Please update the fields below.',
          noteLabel: 'Note from the review team',
          note: business?.changesRequestedNote,
          cta: 'Update & Resubmit',
        }
      : {
          tone: TONE.warning,
          icon: <HourglassTopRoundedIcon sx={{ fontSize: 24 }} />,
          eyebrow: 'Under review',
          title: "We're reviewing your details",
          subtitle:
            'Thanks for registering! To keep the platform safe for every customer, our team manually verifies each new business. This usually takes less than 24 hours.',
        };

  const isActionable = status === 'Rejected' || status === 'ChangesRequested';

  const canResubmit =
    category !== (business?.category || '') ||
    registrationNumber !== (business?.registrationNumber || '') ||
    description !== (business?.description || '') ||
    !!resubmitNote.trim();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: PAGE_BG, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 3 }, py: { xs: 4, sm: 6 }}}>
      <Card elevation={0} sx={{ maxWidth: 720, width: '100%', borderRadius: 3, bgcolor: SURFACE, border: `1px solid ${BORDER}`, boxShadow: '0 20px 60px -24px rgba(15,23,42,0.18), 0 1px 2px rgba(15,23,42,0.04)', overflow: 'hidden'}}>
        <Box sx={{ height: 5, background: `linear-gradient(90deg, ${meta.tone.color} 0%, ${alpha(meta.tone.color, 0.35)} 100%)`}}/>

        <Box sx={{ px: { xs: 3, md: 4.5 }, pt: 3, pb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5}}>
          <Box sx={{ width: 34, height: 34, borderRadius: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha('#2563eb', 0.08), color: '#2563eb'}}>
            <StorefrontRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: INK, letterSpacing: -0.2 }}>
              {business?.name || 'Business Account'}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: MUTED, mt: 0.15 }}>
              Business verification
            </Typography>
          </Box>
          <Chip
            label={meta.eyebrow.toUpperCase()}
            size="small"
            sx={{ height: 24, fontSize: 10, fontWeight: 700, letterSpacing: 0.6, bgcolor: meta.tone.soft, color: meta.tone.color, border: `1px solid ${meta.tone.border}`, '& .MuiChip-label': { px: 1.25 }}}
          />
        </Box>

        <Divider sx={{ borderColor: '#f1f4f9' }} />

        <CardContent sx={{ p: { xs: 3, md: 4.5 }, pt: { xs: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: meta.tone.soft, color: meta.tone.color, border: `1px solid ${meta.tone.border}`, flexShrink: 0}}>
              {meta.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.4, color: INK, lineHeight: 1.25}}>
                {meta.title}
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: MUTED, mt: 0.75, lineHeight: 1.55 }}>
                {meta.subtitle}
              </Typography>
            </Box>
          </Box>

          {isActionable && meta.note && (
            <Box sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: meta.tone.soft, border: `1px solid ${meta.tone.border}`, display: 'flex', gap: 1.5}}>
              <InfoOutlinedIcon sx={{ fontSize: 18, color: meta.tone.color, mt: 0.15, flexShrink: 0 }} />
              <Box>
                <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: meta.tone.color, mb: 0.5}}>
                  {meta.noteLabel}
                </Typography>
                <Typography sx={{ fontSize: 13.5, color: meta.tone.color, lineHeight: 1.55 }}>
                  {meta.note}
                </Typography>
              </Box>
            </Box>
          )}

          {isActionable && (
            <Stack spacing={2.25}>
              <Divider sx={{ borderColor: '#f1f4f9' }}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: MUTED, px: 1.5}}>
                  Update your details
                </Typography>
              </Divider>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.25}>
                <Box sx={{ flex: 1 }}>
                  <Field label="Business Category">
                    <TextField
                      fullWidth
                      size="small"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Field>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Field label="Registration / License Number">
                    <TextField
                      fullWidth
                      size="small"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                    />
                  </Field>
                </Box>
              </Stack>

              <Field label="Business Description" hint="Optional — a short paragraph about what your business offers.">
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Field>

              <Field
                label="Note to Reviewer"
                hint="Explain what you changed so the review team can process it faster."
              >
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={resubmitNote}
                  onChange={(e) => setResubmitNote(e.target.value)}
                  placeholder="E.g., I've corrected my registration number and updated the category."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Field>

              <Button
                variant="contained"
                disableElevation
                onClick={handleResubmit}
                disabled={!canResubmit}
                startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 700, borderRadius: 1.5, px: 2.75, py: 1.1, boxShadow: 'none'}}
                >
                {meta.cta}
              </Button>
            </Stack>
          )}

          {status === 'Pending' && (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ mt: 1 }}
            >
              {[
                { label: 'Manual review', value: 'Within 24 hours' },
                { label: 'Notification', value: 'Sent by email' },
                { label: 'Support', value: 'Available 24/7' },
              ].map((item) => (
                <Box key={item.label} sx={{ flex: 1, p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: `1px solid ${BORDER}`}}>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: MUTED}}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: INK, mt: 0.5 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>

        <Divider sx={{ borderColor: '#f1f4f9' }} />
        <Box sx={{ px: { xs: 3, md: 4.5 }, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#fbfcfe'}}>
          <Typography sx={{ fontSize: 11.5, color: MUTED }}>
            Signed in as <strong style={{ color: INK }}>{business?.email || '—'}</strong>
          </Typography>
          <IconButton
            size="small"
            onClick={handleLogout}
            sx={{ color: MUTED, borderRadius: 1.5, px: 1.25, gap: 0.75, fontSize: 12.5, fontWeight: 600, '&:hover': { color: '#dc2626', bgcolor: alpha('#dc2626', 0.06) }}}
          >
            <LogoutRoundedIcon sx={{ fontSize: 15 }} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>Logout</Typography>
          </IconButton>
        </Box>
      </Card>
    </Box>
  );
};

export default PendingVerification;