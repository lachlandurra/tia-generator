// src/components/TiaReport.js
import React from 'react';
import { Paper, Typography, Divider } from '@mui/material';

function TiaReport({ report }) {
  return (
    <Paper elevation={3} className="p-6 mt-6 bg-white shadow-lg">
      <Typography variant="h5" gutterBottom className="text-gray-800 font-semibold">
        Generated TIA Report
      </Typography>
      <Divider className="mb-4" />
      <Typography
        variant="body1"
        component="pre"
        className="whitespace-pre-wrap text-gray-700 leading-relaxed"
      >
        {report}
      </Typography>
    </Paper>
  );
}

export default TiaReport;
