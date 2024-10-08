// TiaReport.js

import React from 'react';
import { Paper, Typography, Divider } from '@mui/material';

function TiaReport({ report }) {
  return (
    <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        Generated TIA Report
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />
      <Typography variant="body1" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
        {report}
      </Typography>
    </Paper>
  );
}

export default TiaReport;
