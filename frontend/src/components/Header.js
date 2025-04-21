// Header.js - Modern version with improved styling
import React from 'react';
import { 
  AppBar, Toolbar, Typography, Box, IconButton, 
  useScrollTrigger, Slide, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Icons
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

// Hide app bar on scroll
function HideOnScroll(props) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

function Header({ darkMode, toggleDarkMode, toggleDrawer }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <HideOnScroll>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          backgroundColor: theme.palette.mode === 'dark' 
            ? theme.palette.background.paper 
            : theme.palette.primary.main,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton 
                edge="start" 
                color="inherit" 
                aria-label="menu" 
                onClick={toggleDrawer}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <DirectionsCarIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 600,
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              TIA Generator
              <Box 
                component="span" 
                sx={{ 
                  ml: 1,
                  fontSize: '0.7rem',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  display: { xs: 'none', sm: 'inline-block' }
                }}
              >
                BETA
              </Box>
            </Typography>
          </Box>
          
          <Box>
            <IconButton 
              color="inherit" 
              onClick={toggleDarkMode} 
              aria-label={darkMode ? "Light mode" : "Dark mode"}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}

export default Header;