// src/components/TiaForm.js
import React from 'react';
import { TextField, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';

function TiaForm({ formData, handleChange, handleSubmit, loading }) {
  return (
    <form onSubmit={handleSubmit}>
      {/* Project Details */}
      <Typography variant="h5" gutterBottom className="text-gray-800 font-semibold">
        Project Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Project Title"
            value={formData.project_details.project_title}
            onChange={(e) => handleChange('project_details', 'project_title', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Site Address"
            value={formData.project_details.site_address}
            onChange={(e) => handleChange('project_details', 'site_address', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Client Name"
            value={formData.project_details.client_name}
            onChange={(e) => handleChange('project_details', 'client_name', e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Report Date"
            value={formData.project_details.report_date}
            onChange={(e) => handleChange('project_details', 'report_date', e.target.value)}
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            label="Report Version"
            value={formData.project_details.report_version}
            onChange={(e) => handleChange('project_details', 'report_version', e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>

      {/* Introduction */}
      <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
        Introduction
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Purpose of the Report"
            value={formData.introduction.purpose}
            onChange={(e) => handleChange('introduction', 'purpose', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Council Feedback"
            value={formData.introduction.council_feedback}
            onChange={(e) => handleChange('introduction', 'council_feedback', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
      </Grid>

      {/* Existing Conditions */}
      <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
        Existing Conditions
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Site Location Description"
            value={formData.existing_conditions.site_location_description}
            onChange={(e) => handleChange('existing_conditions', 'site_location_description', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Existing Land Use and Layout"
            value={formData.existing_conditions.existing_land_use_and_layout}
            onChange={(e) => handleChange('existing_conditions', 'existing_land_use_and_layout', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Surrounding Road Network Details"
            value={formData.existing_conditions.surrounding_road_network_details}
            onChange={(e) => handleChange('existing_conditions', 'surrounding_road_network_details', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Public Transport Options"
            value={formData.existing_conditions.public_transport_options}
            onChange={(e) => handleChange('existing_conditions', 'public_transport_options', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
      </Grid>

      {/* The Proposal */}
      <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
        The Proposal
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Description of Proposed Development"
            value={formData.proposal.description}
            onChange={(e) => handleChange('proposal', 'description', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Details of Proposed Facilities"
            value={formData.proposal.facilities_details}
            onChange={(e) => handleChange('proposal', 'facilities_details', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Proposed Parking Arrangement"
            value={formData.proposal.parking_arrangement}
            onChange={(e) => handleChange('proposal', 'parking_arrangement', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
      </Grid>

      {/* Parking Assessment */}
      <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
        Parking Assessment
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Existing Parking Provision"
            value={formData.parking_assessment.existing_parking_provision}
            onChange={(e) => handleChange('parking_assessment', 'existing_parking_provision', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Proposed Parking Provision"
            value={formData.parking_assessment.proposed_parking_provision}
            onChange={(e) => handleChange('parking_assessment', 'proposed_parking_provision', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Applicable Parking Rates and Calculations"
            value={formData.parking_assessment.parking_rates_calculations}
            onChange={(e) => handleChange('parking_assessment', 'parking_rates_calculations', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Expected Number of Patrons"
            value={formData.parking_assessment.expected_patrons}
            onChange={(e) => handleChange('parking_assessment', 'expected_patrons', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Justification for Parking Provision"
            value={formData.parking_assessment.justification}
            onChange={(e) => handleChange('parking_assessment', 'justification', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
      </Grid>

      {/* Parking Space Design */}
      <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
        Parking Space Design
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Dimensions and Layout"
            value={formData.parking_design.dimensions_layout}
            onChange={(e) => handleChange('parking_design', 'dimensions_layout', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Compliance with Standards"
            value={formData.parking_design.compliance}
            onChange={(e) => handleChange('parking_design', 'compliance', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
      </Grid>

      {/* Other Matters */}
      <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
        Other Matters
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Bicycle Parking Requirements and Provision"
            value={formData.other_matters.bicycle_parking}
            onChange={(e) => handleChange('other_matters', 'bicycle_parking', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Loading and Waste Collection Details"
            value={formData.other_matters.loading_and_waste}
            onChange={(e) => handleChange('other_matters', 'loading_and_waste', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Traffic Generation Estimates"
            value={formData.other_matters.traffic_generation}
            onChange={(e) => handleChange('other_matters', 'traffic_generation', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
      </Grid>

      {/* Conclusion */}
      <Typography variant="h5" gutterBottom sx={{ marginTop: 4 }}>
        Conclusion
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            label="Summary of Findings"
            value={formData.conclusion.summary}
            onChange={(e) => handleChange('conclusion', 'summary', e.target.value)}
            fullWidth
            multiline
          />
        </Grid>
      </Grid>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={loading}
        sx={{ marginTop: 4 }}
      >
        Generate TIA Report
      </Button>
    </form>
  );
}

export default TiaForm;
