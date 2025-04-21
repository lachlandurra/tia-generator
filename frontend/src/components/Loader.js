// Loader.js - Enhanced version with progress feedback
import React from 'react';
import { 
  Box, CircularProgress, Typography, 
  LinearProgress, Paper
} from '@mui/material';
import { alpha } from '@mui/material/styles';

function Loader() {
  const [progress, setProgress] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        // Simulate progress that slows down as it approaches 100%
        if (prevProgress >= 95) {
          return 95;
        }
        const diff = Math.random() * 10;
        return Math.min(prevProgress + diff, 95);
      });
    }, 800);
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  return (
    <Box 
      sx={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.7),
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
    >
      <Paper 
        elevation={4}
        sx={{ 
          p: 4, 
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 320,
        }}
      >
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Generating TIA Report
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
          Our AI is analyzing your inputs and preparing a comprehensive traffic impact assessment...
        </Typography>
        <Box sx={{ width: '100%', mt: 1 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Typography variant="caption" color="textSecondary">
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Loader;