// Footer.js - New component for improved layout
import React from 'react';
import { Box, Typography, Container, Link, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';

function Footer() {
  return (
    <Box 
      component="footer" 
      sx={{ 
        mt: 'auto',
        py: 3,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        '@media print': {
          display: 'none'
        }
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'center', md: 'flex-start' },
          textAlign: { xs: 'center', md: 'left' },
        }}>
          <Box sx={{ mb: { xs: 2, md: 0 } }}>
            <Typography variant="h6" color="textPrimary" gutterBottom>
              TrafficAble Consultants
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Professional traffic engineering consultancy services
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="body2" color="textSecondary">
              &copy; {new Date().getFullYear()} TrafficAble Consultants
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Email: trafficable@gmail.com | Tel: 0450461917
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;