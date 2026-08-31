import { Box, Typography, Container, Grid, Link, TextField, Button, Divider } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ bgcolor: '#0f172a', color: 'white', pt: 8, pb: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ color: 'primary.main' }}>Slotify</Box>
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 2, maxWidth: 300 }}>
              The simplest way to schedule meetings, manage appointments, and grow your business online without the back-and-forth emails.
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Product</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Features</Link>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Pricing</Link>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Integrations</Link>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Resources</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Help Center</Link>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Guides</Link>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>API Status</Link>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Subscribe to our newsletter</Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 2 }}>
              Get the latest news and updates delivered to your inbox.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField 
                size="small" 
                placeholder="Email address" 
                variant="outlined" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  borderRadius: 1, 
                  input: { color: 'white' },
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' }
                }} 
              />
              <Button variant="contained" color="primary">Subscribe</Button>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 4 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Slotify. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Privacy Policy</Link>
            <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Terms of Service</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
