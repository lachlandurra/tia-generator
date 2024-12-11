// In TiaReport.js
import React from 'react';
import { Button } from '@mui/material';
import axios from 'axios';

function TiaReport({ report, formData }) {
  const handleDownloadDocx = async () => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999/download-docx',
        formData,  // Make sure formData is a plain JS object, not FormData
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob'
        }
      );
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'TIA_Report.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading docx:', err);
    }
  };
  

  return (
    <div>
      <pre>{report}</pre>
      <Button variant="contained" color="secondary" onClick={handleDownloadDocx}>
        Download as Word Document
      </Button>
    </div>
  );
}

export default TiaReport;
