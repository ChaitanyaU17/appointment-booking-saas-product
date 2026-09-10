import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';

const features = [
  { icon: <LockOutlinedIcon sx={{ fontSize: 40 }} />, title: 'Data Encryption', desc: 'All data is encrypted in transit and at rest using industry-standard AES-256 encryption.' },
  { icon: <CloudDoneOutlinedIcon sx={{ fontSize: 40 }} />, title: '99.99% Uptime', desc: 'Our infrastructure is distributed across multiple AWS zones to ensure maximum reliability.' },
  { icon: <VerifiedUserOutlinedIcon sx={{ fontSize: 40 }} />, title: 'Role-Based Access', desc: 'Strict RBAC controls ensure that your staff only sees what they are authorized to see.' },
  { icon: <PolicyOutlinedIcon sx={{ fontSize: 40 }} />, title: 'GDPR Compliant', desc: 'We adhere to strict data privacy laws and give you full control over your customer data.' }
];

export default function Security() {
  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <SecurityIcon color="primary" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h2" sx={{ fontWeight: 800, mb: 3 }}>
            Enterprise-Grade Security
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
            At Slotify, the security of your business and your customers is our top priority. 
            We build trust through continuous monitoring, rigorous compliance, and transparent practices.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feat, i) => (
             <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Paper elevation={0} sx={{ p: 5, borderRadius: 4, bgcolor: '#f8fafc', height: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feat.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>{feat.title}</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>{feat.desc}</Typography>
                </Paper>
             </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}