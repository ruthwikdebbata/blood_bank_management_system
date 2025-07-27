// src/client/components/Navbar.jsx
import React, { useState, useContext } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user, signOut } = useContext(AuthContext);

  // Link sets by role
  const guestLinks = [
    { label: 'Home',       to: '/' },
    { label: 'About Us',   to: '/about' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Login',      to: '/login' },
    { label: 'Register',   to: '/register' },
  ];

  const userLinks = [
    { label: 'User Dashboard',  to: '/user_dashboard' },
    { label: 'Inventory',       to: '/inventory' },
    { label: 'Donate/Request', to: '/transact' },
    { label: 'Donation History', to: '/donations' },
    { label: 'Support', to: '/support' },
    { label: 'Profile', to: '/profile' },
  ];

  const staffLinks = [
    { label: 'Inventory',        to: '/inventory' },
    { label: 'Staff Dashboard',  to: '/staff_dashboard' },
    { label: 'Profile', to: '/profile' },
  ];

  const adminLinks = [
    { label: 'Inventory',        to: '/inventory' },
    { label: 'Admin Dashboard',  to: '/admin_dashboard' },
    { label: 'Manage Users',     to: '/admin/users' },
    { label: 'Profile', to: '/profile' },
  ];

  // Pick which links to show
  let linksToShow;
  if (!user) {
    linksToShow = guestLinks;
  } else if (user.role === 'Admin') {
    linksToShow = adminLinks;
  } else if (user.role === 'Staff') {
    linksToShow = staffLinks;
  } else {
    // default regular user
    linksToShow = userLinks;
  }

  const [drawerOpen, setDrawerOpen] = useState(false);
  const toggleDrawer = open => () => setDrawerOpen(open);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}
          >
            BloodBankPro
          </Typography>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {linksToShow.map(link => (
                <Button
                  key={link.label}
                  color="inherit"
                  component={Link}
                  to={link.to}
                  sx={{ textTransform: 'none' }}
                >
                  {link.label}
                </Button>
              ))}

              {user && (
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ textTransform: 'none' }}
                >
                  Logout
                </Button>
              )}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {linksToShow.map(link => (
              <ListItem
                button
                key={link.label}
                component={Link}
                to={link.to}
              >
                <ListItemText primary={link.label} />
              </ListItem>
            ))}

            {user && (
              <>
                <Divider />
                <ListItem button onClick={handleLogout}>
                  <ListItemText primary="Logout" />
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
