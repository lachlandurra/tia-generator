import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import ArticleIcon from '@mui/icons-material/Article';

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <ArticleIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div">
          TIA Generator
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default Header;
