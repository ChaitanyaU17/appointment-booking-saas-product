import { Box, Typography, Container, Grid, Paper, Chip } from '@mui/material';
import ExtensionIcon from '@mui/icons-material/Extension';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PaymentIcon from '@mui/icons-material/Payment';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import ContactsIcon from '@mui/icons-material/Contacts';

const integrations = [
  { icon: <CalendarMonthIcon sx={{ fontSize: 40 }} />, title: 'Google Calendar', type: 'Calendar', desc: 'Sync your bookings directly with your Google Calendar to prevent double-booking.' },
  { icon: <PaymentIcon sx={{ fontSize: 40 }} />, title: 'Stripe', type: 'Payments', desc: 'Accept credit card payments securely when customers book their appointments.' },
  { icon: <VideoCameraFrontIcon sx={{ fontSize: 40 }} />, title: 'Zoom', type: 'Video Conferencing', desc: 'Automatically generate Zoom meeting links for virtual appointments.' },
  { icon: <ContactsIcon sx={{ fontSize: 40 }} />, title: 'Mailchimp', type: 'Marketing', desc: 'Sync your customer list to Mailchimp for automated marketing campaigns.' }
];

export default function Integrations() {
  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <ExtensionIcon color="primary" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
            Connect your favorite tools
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
            Slotify integrates seamlessly with the software you already use to run your business, automating your entire workflow from end to end.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {integrations.map((app, i) => (
             <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #e2e8f0', transition: '0.2s', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: '0 10px 30px rgba(15,23,42,0.05)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: 3, bgcolor: 'rgba(101,146,135,0.1)', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {app.icon}
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>{app.title}</Typography>
                        <Chip label={app.type} size="small" sx={{ fontWeight: 600, bgcolor: 'rgba(15,23,42,0.05)' }} />
                      </Box>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>{app.desc}</Typography>
                    </Box>
                  </Box>
                </Paper>
             </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}