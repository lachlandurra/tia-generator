import React from 'react';
import { Button, Box, Paper, Typography, Card, CardContent, Grid } from '@mui/material';
import axios from 'axios';

const sectionHeadings = {
  introduction_purpose: "Introduction (Purpose)",
  existing_conditions_site_location: "Existing Conditions: Site Location",
  existing_conditions_land_use: "Existing Conditions: Land Use",
  existing_conditions_road_network: "Existing Conditions: Road Network",
  existing_conditions_public_transport: "Existing Conditions: Public Transport",
  proposal_description: "The Proposal: Description",
  proposal_facilities: "The Proposal: Facilities",
  proposal_parking: "The Proposal: Parking",
  parking_existing_provision: "Parking Assessment: Existing Provision",
  parking_proposed_provision: "Parking Assessment: Proposed Provision",
  parking_rates_calculations: "Parking Assessment: Rates and Calculations",
  parking_expected_patrons: "Parking Assessment: Expected Patrons",
  parking_justification: "Parking Assessment: Justification",
  parking_design_dimensions: "Parking Space Design: Dimensions & Layout",
  parking_design_compliance: "Parking Space Design: Compliance",
  other_bicycle_parking: "Other Matters: Bicycle Parking",
  other_loading_waste: "Other Matters: Loading & Waste",
  other_traffic_generation: "Other Matters: Traffic Generation",
  conclusion_summary: "Conclusion: Summary"
};

function TiaReport({ report, formData }) {
  const handleDownloadDocx = async () => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    try {
      const response = await axios.post(
        `${BACKEND_URL}/download-docx`,
        JSON.stringify({ ...formData, ...report }),
        {
          headers: { 'Content-Type': 'application/json' },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(response.data);
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
    <Box mt={4}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Generated TIA Report
      </Typography>
      <Paper elevation={3} sx={{ p: 3, maxHeight: '60vh', overflowY: 'auto', mb: 3 }}>
        <Grid container spacing={3}>
          {Object.entries(report).map(([key, value]) => (
            <Grid item xs={12} key={key}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {sectionHeadings[key] || key.replace(/_/g, ' ')}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="secondary" onClick={handleDownloadDocx}>
          Download as Word Document
        </Button>
      </Box>
    </Box>
  );
}

export default TiaReport;
