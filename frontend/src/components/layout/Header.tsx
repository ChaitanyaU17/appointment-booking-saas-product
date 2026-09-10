import { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Popover, Fade, Grid, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExtensionIcon from '@mui/icons-material/Extension';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import { logoutThunk } from '../../features/auth/authSlice';
import { useAppDispatch } from '../../hook';
import { showNotification } from '../../features/notifications/notificationSlice';
import Logo from '../common/Logo';

interface HeaderProps {
  onMenuClick?: () => void;
}

const NavItem = ({ icon, title, desc, onClick }: any) => (
  <Box 
    onClick={onClick}
    sx={{ 
      display: 'flex', alignItems: 'flex-start', gap: 2, p: 2, borderRadius: 2, 
      cursor: 'pointer', transition: 'background 0.2s',
      '&:hover': { bgcolor: 'rgba(101,146,135,0.06)' }
    }}
  >
    <Box sx={{ color: 'primary.main', mt: 0.5 }}>{icon}</Box>
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.2 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>{desc}</Typography>
    </Box>
  </Box>
);

export default function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [anchorElProduct, setAnchorElProduct] = useState<null | HTMLElement>(null);
  const [anchorElSolutions, setAnchorElSolutions] = useState<null | HTMLElement>(null);
  const [anchorElResources, setAnchorElResources] = useState<null | HTMLElement>(null);

  const handleScroll = (id: string, setter?: any) => {
    if (setter) setter(null);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (path: string, setter?: any) => {
    if (setter) setter(null);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      dispatch(showNotification({ message: 'Logged out successfully' }));
      navigate('/login');
    } catch (error: any) {
      const errorMsg = typeof error === 'string' ? error : error?.message || 'Failed to log out';
      dispatch(showNotification({ message: errorMsg, failure: true }));
    }
  };

  const publicRoutes = ['/', '/contact-sales', '/help-center', '/security', '/integrations'];
  const isPublicPage = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/b/');
  const isDashboardPage = location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/business') || location.pathname.startsWith('/customer');

  const navButtonSx = { color: 'text.primary', fontWeight: 600, textTransform: 'none', fontSize: '0.95rem' };

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e2e8f0', bgcolor: 'white', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between', height: 72 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isDashboardPage && onMenuClick && (
            <IconButton color="inherit" edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
              <MenuIcon />
            </IconButton>
          )}

          <Box sx={{ cursor: 'pointer', mr: { xs: 2, md: 5 } }} onClick={() => navigate('/')}>
            <Logo size="small" />
          </Box>

          {!isAuthenticated && isPublicPage && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button sx={navButtonSx} endIcon={<KeyboardArrowDownIcon sx={{ transition: '0.2s', transform: anchorElProduct ? 'rotate(180deg)' : 'none' }} />} onClick={(e) => setAnchorElProduct(e.currentTarget)}>Product</Button>
              <Popover 
                anchorEl={anchorElProduct} open={Boolean(anchorElProduct)} onClose={() => setAnchorElProduct(null)} 
                TransitionComponent={Fade} elevation={4}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { mt: 2, borderRadius: 3, p: 2, width: 360 } }}
              >
                <NavItem icon={<AutoAwesomeIcon />} title="Features" desc="Everything you need to automate your bookings and manage your day." onClick={() => handleScroll('features', setAnchorElProduct)} />
                <NavItem icon={<ExtensionIcon />} title="Integrations" desc="Connect Slotify with Google Calendar, Zoom, and Stripe seamlessly." onClick={() => handleNavigate('/integrations', setAnchorElProduct)} />
                <NavItem icon={<ShieldOutlinedIcon />} title="Security & Trust" desc="Enterprise-grade security to keep your client data safe." onClick={() => handleNavigate('/security', setAnchorElProduct)} />
              </Popover>

              <Button sx={navButtonSx} endIcon={<KeyboardArrowDownIcon sx={{ transition: '0.2s', transform: anchorElSolutions ? 'rotate(180deg)' : 'none' }} />} onClick={(e) => setAnchorElSolutions(e.currentTarget)}>Solutions</Button>
              <Popover 
                anchorEl={anchorElSolutions} open={Boolean(anchorElSolutions)} onClose={() => setAnchorElSolutions(null)} 
                TransitionComponent={Fade} elevation={4}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { mt: 2, borderRadius: 3, width: 650, overflow: 'hidden' } }}
              >
                <Grid container>
                  <Grid item xs={7} sx={{ p: 3 }}>
                    <Typography variant="overline" sx={{ fontWeight: 800, color: 'text.secondary', ml: 2, mb: 1, display: 'block' }}>By Industry</Typography>
                    <NavItem icon={<ContentCutIcon />} title="For Salons & Spas" desc="Manage chairs, staff, and walk-ins easily." onClick={() => handleScroll('solutions', setAnchorElSolutions)} />
                    <NavItem icon={<MedicalServicesOutlinedIcon />} title="For Clinics & Doctors" desc="Secure patient scheduling and history tracking." onClick={() => handleScroll('solutions', setAnchorElSolutions)} />
                    <NavItem icon={<SchoolOutlinedIcon />} title="For Tutors & Coaches" desc="Handle group classes and 1-on-1 sessions." onClick={() => handleScroll('solutions', setAnchorElSolutions)} />
                  </Grid>
                  <Grid item xs={5} sx={{ bgcolor: '#f8fafc', p: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ width: '100%', height: 140, borderRadius: 2, mb: 3, backgroundImage: 'url(https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=500&q=80&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Built for your growth</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>See how local businesses are scaling their revenue with Slotify.</Typography>
                    <Button endIcon={<ArrowRightAltIcon />} sx={{ alignSelf: 'flex-start', fontWeight: 700, p: 0 }} onClick={() => handleScroll('solutions', setAnchorElSolutions)}>Read Stories</Button>
                  </Grid>
                </Grid>
              </Popover>

              <Button sx={navButtonSx} endIcon={<KeyboardArrowDownIcon sx={{ transition: '0.2s', transform: anchorElResources ? 'rotate(180deg)' : 'none' }} />} onClick={(e) => setAnchorElResources(e.currentTarget)}>Resources</Button>
              <Popover 
                anchorEl={anchorElResources} open={Boolean(anchorElResources)} onClose={() => setAnchorElResources(null)} 
                TransitionComponent={Fade} elevation={4}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                PaperProps={{ sx: { mt: 2, borderRadius: 3, p: 2, width: 360 } }}
              >
                <NavItem icon={<HelpOutlineOutlinedIcon />} title="Help Center" desc="Get answers quickly with our detailed documentation." onClick={() => handleNavigate('/help-center', setAnchorElResources)} />
                <NavItem icon={<MenuBookOutlinedIcon />} title="Guides & Tutorials" desc="Step-by-step videos on how to maximize your bookings." onClick={() => handleScroll('resources', setAnchorElResources)} />
                <NavItem icon={<ArticleOutlinedIcon />} title="Slotify Blog" desc="Tips, news, and insights for growing your local business." onClick={() => handleScroll('resources', setAnchorElResources)} />
              </Popover>

              <Button sx={navButtonSx} onClick={() => handleScroll('pricing')}>Pricing</Button>
            </Box>
          )}
        </Box>

        <Box>
          {!isAuthenticated ? (
            isPublicPage && (
              <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, alignItems: 'center' }}>
                <Button sx={{ ...navButtonSx, display: { xs: 'none', md: 'block' } }} onClick={() => navigate('/contact-sales')}>Talk to sales</Button>
                <Button sx={navButtonSx} onClick={() => navigate('/login')}>
                  Log In
                </Button>
                <Button color="primary" variant="contained" sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2 }} onClick={() => navigate('/register')}>
                  Get started for free
                </Button>
              </Box>
            )
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user?.name}
              </Typography>
              {!isDashboardPage && (
                <Button color="primary" variant="text" onClick={() => {
                  if (user?.role === 'Superadmin') navigate('/superadmin');
                  else if (user?.role === 'BusinessAdmin') navigate('/business');
                  else if (user?.role === 'Customer') navigate('/customer/dashboard');
                }}>
                  {user?.role === 'Customer' ? 'My Appointments' : 'Dashboard'}
                </Button>
              )}
              <Button color="inherit" variant="outlined" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
























