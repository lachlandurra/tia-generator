import React, { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Card,
  CardContent,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
} from '@mui/material';

const steps = [
  'Project Details',
  'Introduction',
  'Existing Conditions',
  'The Proposal',
  'Parking Assessment',
  'Parking Space Design',
  'Other Matters',
  'Conclusion',
];

function TiaForm({ formData, handleChange, handleSubmit, loading }) {
  const [activeStep, setActiveStep] = useState(0);
  const [condensedMode, setCondensedMode] = useState(false);

  const sectionFields = useMemo(() => [
    // Project Details
    {
      title: 'Project Details',
      fields: [
        {
          label: 'Project Title',
          section: 'project_details',
          field: 'project_title',
        },
        {
          label: 'Site Address',
          section: 'project_details',
          field: 'site_address',
        },
        {
          label: 'Client Name',
          section: 'project_details',
          field: 'client_name',
        },
        {
          label: 'Report Date',
          section: 'project_details',
          field: 'report_date',
          type: 'date',
          InputLabelProps: { shrink: true },
        },
      ],
    },
    // Introduction
    {
      title: 'Introduction',
      fields: [
        {
          label: 'Purpose of the Report',
          section: 'introduction',
          field: 'purpose',
          multiline: true,
        },
        {
          label: 'Council Feedback',
          section: 'introduction',
          field: 'council_feedback',
          multiline: true,
        },
      ],
    },
    // Existing Conditions
    {
      title: 'Existing Conditions',
      fields: [
        {
          label: 'Site Location Description',
          section: 'existing_conditions',
          field: 'site_location_description',
          multiline: true,
        },
        {
          label: 'Existing Land Use and Layout',
          section: 'existing_conditions',
          field: 'existing_land_use_and_layout',
          multiline: true,
        },
        {
          label: 'Surrounding Road Network Details',
          section: 'existing_conditions',
          field: 'surrounding_road_network_details',
          multiline: true,
        },
        {
          label: 'Public Transport Options',
          section: 'existing_conditions',
          field: 'public_transport_options',
          multiline: true,
        },
      ],
    },
    // The Proposal
    {
      title: 'The Proposal',
      fields: [
        {
          label: 'Description of Proposed Development',
          section: 'proposal',
          field: 'description',
          multiline: true,
        },
        {
          label: 'Details of Proposed Facilities',
          section: 'proposal',
          field: 'facilities_details',
          multiline: true,
        },
        {
          label: 'Proposed Parking Arrangement',
          section: 'proposal',
          field: 'parking_arrangement',
          multiline: true,
        },
      ],
    },
    // Parking Assessment
    {
      title: 'Parking Assessment',
      fields: [
        {
          label: 'Existing Parking Provision',
          section: 'parking_assessment',
          field: 'existing_parking_provision',
          multiline: true,
        },
        {
          label: 'Proposed Parking Provision',
          section: 'parking_assessment',
          field: 'proposed_parking_provision',
          multiline: true,
        },
        {
          label: 'Applicable Parking Rates and Calculations',
          section: 'parking_assessment',
          field: 'parking_rates_calculations',
          multiline: true,
        },
        {
          label: 'Expected Number of Patrons',
          section: 'parking_assessment',
          field: 'expected_patrons',
          multiline: true,
        },
        {
          label: 'Justification for Parking Provision',
          section: 'parking_assessment',
          field: 'justification',
          multiline: true,
        },
      ],
    },
    // Parking Space Design
    {
      title: 'Parking Space Design',
      fields: [
        {
          label: 'Dimensions and Layout',
          section: 'parking_design',
          field: 'dimensions_layout',
          multiline: true,
        },
        {
          label: 'Compliance with Standards',
          section: 'parking_design',
          field: 'compliance',
          multiline: true,
        },
      ],
    },
    // Other Matters
    {
      title: 'Other Matters',
      fields: [
        {
          label: 'Bicycle Parking Requirements and Provision',
          section: 'other_matters',
          field: 'bicycle_parking',
          multiline: true,
        },
        {
          label: 'Loading and Waste Collection Details',
          section: 'other_matters',
          field: 'loading_and_waste',
          multiline: true,
        },
        {
          label: 'Traffic Generation Estimates',
          section: 'other_matters',
          field: 'traffic_generation',
          multiline: true,
        },
      ],
    },
    // Conclusion
    {
      title: 'Conclusion',
      fields: [
        {
          label: 'Summary of Findings',
          section: 'conclusion',
          field: 'summary',
          multiline: true,
        },
      ],
    },
  ], []);

  const isLastStep = activeStep === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setActiveStep((prev) => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleStepClick = (stepIndex) => {
    // Allow jumping directly to a step if not condensed
    if (!condensedMode) {
      setActiveStep(stepIndex);
    }
  };

  const currentFields = sectionFields[activeStep];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ position: 'relative' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4, textAlign: 'center' }}>
        Traffic Impact Assessment Form
      </Typography>

      {/* Toggle for condensed mode */}
      <Box sx={{ textAlign: 'right', mb: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={condensedMode}
              onChange={() => setCondensedMode(!condensedMode)}
              color="primary"
            />
          }
          label="Condensed Mode"
        />
      </Box>

      <Grid container spacing={2}>
        {!condensedMode && (
          <Grid item xs={12} md={3}>
            <Paper elevation={2} sx={{ p: 2, position: 'sticky', top: '20px' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Progress
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel
                      onClick={() => handleStepClick(index)}
                      sx={{
                        cursor: 'pointer',
                        '& .MuiStepLabel-label': {
                          color: index === activeStep ? 'primary.main' : 'inherit',
                        },
                      }}
                    >
                      {label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={condensedMode ? 12 : 9}>
          {condensedMode ? (
            // Condensed mode: Show all sections and fields at once.
            <Box>
              {sectionFields.map((section, secIndex) => (
                <Card elevation={1} sx={{ mb: 4 }} key={section.title}>
                  <CardContent>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                      {section.title}
                    </Typography>
                    <Grid container spacing={2}>
                      {section.fields.map((fieldObj, i) => (
                        <Grid item xs={12} sm={fieldObj.type === 'date' ? 6 : 12} key={i}>
                          <TextField
                            label={fieldObj.label}
                            type={fieldObj.type || 'text'}
                            value={formData[fieldObj.section][fieldObj.field]}
                            onChange={(e) => handleChange(fieldObj.section, fieldObj.field, e.target.value)}
                            fullWidth
                            multiline={fieldObj.multiline}
                            minRows={fieldObj.multiline ? 3 : 1}
                            variant="outlined"
                            InputLabelProps={fieldObj.InputLabelProps || {}}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            // Wizard mode: Show only fields for the current step.
            <Card elevation={1} sx={{ mb: 8 }}>
              <CardContent>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                  {steps[activeStep]}
                </Typography>
                <Grid container spacing={2}>
                  {currentFields.fields.map((fieldObj, i) => (
                    <Grid item xs={12} sm={fieldObj.type === 'date' ? 6 : 12} key={i}>
                      <TextField
                        label={fieldObj.label}
                        type={fieldObj.type || 'text'}
                        value={formData[fieldObj.section][fieldObj.field]}
                        onChange={(e) => handleChange(fieldObj.section, fieldObj.field, e.target.value)}
                        fullWidth
                        multiline={fieldObj.multiline}
                        minRows={fieldObj.multiline ? 3 : 1}
                        variant="outlined"
                        InputLabelProps={fieldObj.InputLabelProps || {}}
                      />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {!condensedMode && (
        <>
          <Divider />
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              background: '#fff',
              py: 2,
              mt: 2,
              textAlign: 'right',
              borderTop: '1px solid #eee'
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              sx={{ mr: 2 }}
            >
              Back
            </Button>
            {!isLastStep && (
              <Button variant="contained" color="primary" onClick={handleNext} disabled={loading}>
                Next
              </Button>
            )}
            {isLastStep && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                Generate TIA Report
              </Button>
            )}
          </Box>
        </>
      )}

      {condensedMode && (
        <Box
          sx={{
            textAlign: 'right',
            mt: 3,
          }}
        >
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Generate TIA Report
          </Button>
        </Box>
      )}
    </Box>
  );
}

export default TiaForm;
