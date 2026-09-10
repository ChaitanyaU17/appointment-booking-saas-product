import { Box, Typography, Container, Grid, Link, TextField, Button, Divider } from '@mui/material';

export default function Footer() {
  return (
    <Box sx={{ bgcolor: '#0f172a', color: 'white', pt: 8, pb: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ color: 'primary.main' }}>Slotify</Box>
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mb: 3, maxWidth: 300 }}>
              The simplest way to schedule meetings, manage appointments, and grow your business online without the back-and-forth emails.
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Subscribe to our newsletter</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField 
                size="small" 
                placeholder="Email address" 
                variant="outlined" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.05)', 
                  borderRadius: 1, 
                  input: { color: 'white', py: 1 },
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                  flexGrow: 1
                }} 
              />
              <Button variant="contained" color="primary">Subscribe</Button>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 6, md: 2, mdOffset: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Product</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="/#features" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Features</Link>
              <Link href="/integrations" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Integrations</Link>
              <Link href="/#pricing" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Pricing</Link>
              <Link href="/contact-sales" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Enterprise</Link>
              <Link href="/security" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Security</Link>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Solutions</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="/#solutions" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>For Salons</Link>
              <Link href="/#solutions" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>For Clinics</Link>
              <Link href="/#solutions" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>For Tutors</Link>
              <Link href="/contact-sales" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>For Consultants</Link>
              <Link href="/contact-sales" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>For Teams</Link>
            </Box>
          </Grid>
          
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Resources</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="/help-center" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Help Center</Link>
              <Link href="/#resources" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Guides & Tutorials</Link>
              <Link href="/#resources" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>API & Developers</Link>
              <Link href="/#resources" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>System Status</Link>
              <Link href="/#resources" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Blog</Link>
            </Box>
          </Grid>

          <Grid size={{ xs: 6, md: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Company</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>About Us</Link>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Contact Sales</Link>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Careers</Link>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Privacy Policy</Link>
              <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7 }}>Terms of Service</Link>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 4 }} />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Slotify. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Privacy</Link>
            <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Terms</Link>
            <Link href="#" color="inherit" underline="hover" sx={{ opacity: 0.7, fontSize: '0.875rem' }}>Cookie Preferences</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
