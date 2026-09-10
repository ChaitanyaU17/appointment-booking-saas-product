import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Toolbar } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import EventIcon from '@mui/icons-material/Event';
import SettingsIcon from '@mui/icons-material/Settings';
import CardMembershipIcon from '@mui/icons-material/CardMembership';

import HowToRegIcon from '@mui/icons-material/HowToReg';
import PeopleIcon from '@mui/icons-material/People';

export const drawerWidth = 240;

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

import Logo from '../common/Logo';

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const superadminLinks = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/superadmin' },
    { text: 'Registration', icon: <HowToRegIcon />, path: '/superadmin/registration' },
    { text: 'Onboarded Shops', icon: <StoreIcon />, path: '/superadmin/shops' },
    { text: 'Business Admins', icon: <PeopleIcon />, path: '/superadmin/admins' },
    { text: 'Plans', icon: <CardMembershipIcon />, path: '/superadmin/plans' },
    { text: 'Demo Requests', icon: <EventIcon />, path: '/superadmin/demo-requests' },
  ];

  const businessLinks = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/business' },
    { text: 'Appointments', icon: <EventIcon />, path: '/business/appointments' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/business/settings' },
  ];

  const links = user?.role === 'Superadmin' ? superadminLinks : user?.role === 'BusinessAdmin' ? businessLinks : [];

  const content = (
    <Box>
      <Toolbar sx={{ display: 'flex', gap: 1, py: 2 }}>
        <Logo size="medium" />
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List sx={{ px: 1 }}>
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <ListItem key={link.text} disablePadding sx={{ mb: 0.5 }} id={`tour-nav-${link.text.toLowerCase().replace(/\s+/g, '-')}`}>
                <ListItemButton
                  selected={active}
                  onClick={() => { navigate(link.path); onClose(); }}
                  sx={{borderRadius: 2, '&.Mui-selected': {bgcolor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' }, '&:hover': { bgcolor: 'primary.dark' }}}}
                >
                  <ListItemIcon sx={{ color: active ? 'white' : 'text.secondary' }}>
                    {link.icon}
                  </ListItemIcon>
                  <ListItemText primary={link.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider />
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: drawerWidth }}}
      >
        {content}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }}}
        open
      >
        {content}
      </Drawer>
    </Box>
  );
}