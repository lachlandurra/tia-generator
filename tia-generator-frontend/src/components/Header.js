// Header.js

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <SportsSoccerIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div">
          TIA Generator
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
