import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  AppBar, Toolbar, Typography, Box, Drawer, 
  List, ListItem, ListItemIcon, ListItemText, 
  Divider, IconButton, Avatar, Tooltip, Menu, 
  MenuItem, Container, Badge
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Dashboard, 
  Person, 
  Assessment, 
  School, 
  QrCodeScanner,
  Logout,
  PersonAdd,
  DevicesOther
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { isAuthenticated } from '../utils/auth';
import toast from 'react-hot-toast';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: 0,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: drawerWidth,
    }),
  }),
);

export default function Layout({ children }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const auth = isAuthenticated();
    if (auth) {
      setUser(auth.user);
    }
  }, []);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/',
      roles: ['admin', 'teacher', 'staff']
    },
    {
      text: 'Attendance',
      icon: <QrCodeScanner />,
      path: '/attendance',
      roles: ['admin', 'teacher', 'staff']
    },
    {
      text: 'Students',
      icon: <Person />,
      path: '/students',
      roles: ['admin', 'teacher', 'staff']
    },
    {
      text: 'Devices',
      icon: <DevicesOther />,
      path: '/devices',
      roles: ['admin', 'teacher', 'staff']
    },
    {
      text: 'Reports',
      icon: <Assessment />,
      path: '/reports',
      roles: ['admin', 'teacher', 'staff']
    },
    {
      text: 'Register Student',
      icon: <PersonAdd />,
      path: '/register-student',
      roles: ['admin', 'teacher']
    },
  ];

  if (!user) {
    return <Box>{children}</Box>;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            School Attendance System
          </Typography>
          
          {/* User menu */}
          <Tooltip title="Account settings">
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem>
              <ListItemIcon>
                <School fontSize="small" />
              </ListItemIcon>
              <ListItemText 
                primary={user?.name}
                secondary={user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
              />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth 
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => (
              item.roles.includes(user.role) && (
                <ListItem 
                  button 
                  key={item.text}
                  onClick={() => {
                    router.push(item.path);
                    setDrawerOpen(false);
                  }}
                  selected={router.pathname === item.path}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              )
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
