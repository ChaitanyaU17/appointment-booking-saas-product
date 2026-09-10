import { Box, Typography, Container, Grid, TextField, InputAdornment, Card, CardContent } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';

const categories = [
  { title: 'Getting Started', desc: 'Set up your account, business page, and first service in minutes.', icon: <PlayCircleOutlineOutlinedIcon sx={{ fontSize: 40 }} /> },
  { title: 'Managing Bookings', desc: 'How to view, reschedule, cancel, or approve customer appointments.', icon: <EventAvailableOutlinedIcon sx={{ fontSize: 40 }} /> },
  { title: 'Account Settings', desc: 'Update your profile, business details, and working hours.', icon: <AccountCircleOutlinedIcon sx={{ fontSize: 40 }} /> },
  { title: 'Billing & Plans', desc: 'Manage your subscription, invoices, and payment methods.', icon: <CreditCardOutlinedIcon sx={{ fontSize: 40 }} /> },
  { title: 'Integrations', desc: 'Connect Google Calendar, Stripe, and other apps to your workflow.', icon: <ExtensionOutlinedIcon sx={{ fontSize: 40 }} /> },
  { title: 'Advanced Configuration', desc: 'Webhooks, API keys, and custom enterprise settings.', icon: <SettingsOutlinedIcon sx={{ fontSize: 40 }} /> },
];

export default function HelpCenter() {
  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 12 }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
            How can we help?
          </Typography>
          <TextField 
            fullWidth 
            placeholder="Search for articles, guides, or features..." 
            variant="outlined"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                sx: { 
                  bgcolor: 'white', 
                  borderRadius: 3, 
                  height: 60, 
                  fontSize: '1.1rem',
                  color: 'text.primary',
                }
              }
            }}
            sx={{ maxWidth: 600, mx: 'auto' }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -6 }}>
        <Grid container spacing={3}>
          {categories.map((cat, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
              <Card sx={{ height: '100%', borderRadius: 4, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 30px rgba(15,23,42,0.1)', cursor: 'pointer' } }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{cat.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{cat.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{cat.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}