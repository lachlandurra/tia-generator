// frontend/src/components/TiaForm.js
import React, { useState, useMemo, useEffect } from 'react';
import {
  Box, Button, Typography, TextField, Stepper, Step, StepLabel, Paper,
  Card, CardContent, Grid, Divider, FormControlLabel, Switch, IconButton,
  LinearProgress, Tooltip, Chip, Accordion, AccordionSummary, AccordionDetails,
  Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText,
  useMediaQuery, Collapse, Badge, Zoom
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';

// Form field tooltips/help text
const fieldHelp = {
  project_title: "Enter the name of the project or development",
  site_address: "Full street address of the development site",
  client_name: "Name of the client or organization requesting the TIA",
  development_type: "Type of development (e.g., residential, commercial, mixed-use)",
  zoning: "Current zoning classification of the site",
  pptn: "Principal Public Transport Network status",
  council: "Local council or governing authority",
  purpose: "Describe the purpose of this TIA report and any specific requirements",
  council_feedback: "Include any preliminary feedback from council if available",
  site_location_description: "Describe the location of the site including nearby landmarks and major roads",
  existing_land_use_and_layout: "Detail the current use of the site and its general layout",
  surrounding_road_network_details: "Describe surrounding roads, intersections, and traffic conditions",
  public_transport_options: "List nearby public transport options (bus routes, train stations, tram routes)",
  description: "Comprehensive description of the proposed development",
  facilities_details: "Details of all facilities included in the development",
  parking_arrangement: "Overview of the proposed parking arrangement",
  existing_parking_provision: "Current parking spaces available on-site",
  proposed_parking_provision: "Number and type of parking spaces to be provided",
  parking_rates_calculations: "Calculations showing how parking requirements were determined",
  expected_patrons: "Estimated number of patrons/visitors and peak times",
  justification: "Justification for the proposed parking provision",
  dimensions_layout: "Dimensions and layout of parking spaces, aisles, and access points",
  compliance: "How the parking design complies with relevant standards",
  bicycle_parking: "Bicycle parking requirements and provision",
  loading_and_waste: "Loading zone and waste collection arrangements",
  traffic_generation: "Traffic generation estimates from the development",
  summary: "Summary of key findings and recommendations"
};

// Steps for the form wizard
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
  // Get saved condensed mode preference
  const savedCondensedMode = localStorage.getItem('condensedMode') === 'true';
  
  const [activeStep, setActiveStep] = useState(0);
  const [condensedMode, setCondensedMode] = useState(savedCondensedMode);
  const [completionStatus, setCompletionStatus] = useState({});
  const [helpDialog, setHelpDialog] = useState({ open: false, field: '', text: '' });
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Save condensed mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('condensedMode', condensedMode.toString());
  }, [condensedMode]);

  // Calculate form completion status
  useEffect(() => {
    const newStatus = {};
    
    // For each section, calculate the percentage of filled fields
    Object.entries(formData).forEach(([section, fields]) => {
      if (section === 'project_details') {
        // Skip fixed fields like consultant_name, etc.
        const userEditableFields = Object.entries(fields).filter(
          ([key]) => !['consultant_name', 'company_name', 'qualifications', 'contact_details', 'report_date'].includes(key)
        );
        
        const filledFields = userEditableFields.filter(([_, value]) => value && value.trim().length > 0);
        newStatus[section] = (filledFields.length / userEditableFields.length) * 100;
      } else {
        const totalFields = Object.keys(fields).length;
        const filledFields = Object.values(fields).filter(value => value && value.trim().length > 0).length;
        newStatus[section] = (filledFields / totalFields) * 100;
      }
    });
    
    setCompletionStatus(newStatus);
  }, [formData]);

  // Calculate overall completion percentage
  const overallCompletion = useMemo(() => {
    if (Object.keys(completionStatus).length === 0) return 0;
    
    const total = Object.values(completionStatus).reduce((sum, value) => sum + value, 0);
    return Math.round(total / Object.keys(completionStatus).length);
  }, [completionStatus]);

  // Get section-specific completion
  const getSectionCompletion = (section) => {
    return completionStatus[section] || 0;
  };

  // Define form field sections with added tooltips and validation
  const sectionFields = useMemo(() => [
    // Project Details
    {
      title: 'Project Details',
      section: 'project_details',
      fields: [
        {
          label: 'Project Title',
          field: 'project_title',
          required: true,
          helperText: fieldHelp.project_title,
          gridWidth: 12,
        },
        {
          label: 'Site Address',
          field: 'site_address',
          required: true,
          helperText: fieldHelp.site_address,
          gridWidth: 12,
        },
        {
          label: 'Client Name',
          field: 'client_name',
          required: true,
          helperText: fieldHelp.client_name,
          gridWidth: 6,
        },
        {
          label: 'Report Date',
          field: 'report_date',
          type: 'date',
          required: true,
          InputLabelProps: { shrink: true },
          gridWidth: 6,
        },
        {
          label: 'Development Type',
          field: 'development_type',
          helperText: fieldHelp.development_type,
          gridWidth: 6,
        },
        {
          label: 'Zoning',
          field: 'zoning',
          helperText: fieldHelp.zoning,
          gridWidth: 6,
        },
        {
          label: 'Principal Public Transport Network',
          field: 'pptn',
          helperText: fieldHelp.pptn,
          gridWidth: 6,
        },
        {
          label: 'Council',
          field: 'council',
          helperText: fieldHelp.council,
          gridWidth: 6,
        },
      ],
    },
    // Introduction
    {
      title: 'Introduction',
      section: 'introduction',
      fields: [
        {
          label: 'Purpose of the Report',
          field: 'purpose',
          multiline: true,
          required: true,
          helperText: fieldHelp.purpose,
          gridWidth: 12,
        },
        {
          label: 'Council Feedback',
          field: 'council_feedback',
          multiline: true,
          helperText: fieldHelp.council_feedback,
          gridWidth: 12,
        },
      ],
    },
    // Existing Conditions
    {
      title: 'Existing Conditions',
      section: 'existing_conditions',
      fields: [
        {
          label: 'Site Location Description',
          field: 'site_location_description',
          multiline: true,
          required: true,
          helperText: fieldHelp.site_location_description,
          gridWidth: 12,
        },
        {
          label: 'Existing Land Use and Layout',
          field: 'existing_land_use_and_layout',
          multiline: true,
          required: true,
          helperText: fieldHelp.existing_land_use_and_layout,
          gridWidth: 12,
        },
        {
          label: 'Surrounding Road Network Details',
          field: 'surrounding_road_network_details',
          multiline: true,
          required: true,
          helperText: fieldHelp.surrounding_road_network_details,
          gridWidth: 12,
        },
        {
          label: 'Public Transport Options',
          field: 'public_transport_options',
          multiline: true,
          helperText: fieldHelp.public_transport_options,
          gridWidth: 12,
        },
      ],
    },
    // The Proposal
    {
      title: 'The Proposal',
      section: 'proposal',
      fields: [
        {
          label: 'Description of Proposed Development',
          field: 'description',
          multiline: true,
          required: true,
          helperText: fieldHelp.description,
          gridWidth: 12,
        },
        {
          label: 'Details of Proposed Facilities',
          field: 'facilities_details',
          multiline: true,
          helperText: fieldHelp.facilities_details,
          gridWidth: 12,
        },
        {
          label: 'Proposed Parking Arrangement',
          field: 'parking_arrangement',
          multiline: true,
          required: true,
          helperText: fieldHelp.parking_arrangement,
          gridWidth: 12,
        },
      ],
    },
    // Parking Assessment
    {
      title: 'Parking Assessment',
      section: 'parking_assessment',
      fields: [
        {
          label: 'Existing Parking Provision',
          field: 'existing_parking_provision',
          multiline: true,
          helperText: fieldHelp.existing_parking_provision,
          gridWidth: 12,
        },
        {
          label: 'Proposed Parking Provision',
          field: 'proposed_parking_provision',
          multiline: true,
          required: true,
          helperText: fieldHelp.proposed_parking_provision,
          gridWidth: 12,
        },
        {
          label: 'Applicable Parking Rates and Calculations',
          field: 'parking_rates_calculations',
          multiline: true,
          required: true,
          helperText: fieldHelp.parking_rates_calculations,
          gridWidth: 12,
        },
        {
          label: 'Expected Number of Patrons',
          field: 'expected_patrons',
          multiline: true,
          helperText: fieldHelp.expected_patrons,
          gridWidth: 12,
        },
        {
          label: 'Justification for Parking Provision',
          field: 'justification',
          multiline: true,
          required: true,
          helperText: fieldHelp.justification,
          gridWidth: 12,
        },
      ],
    },
    // Parking Space Design
    {
      title: 'Parking Space Design',
      section: 'parking_design',
      fields: [
        {
          label: 'Dimensions and Layout',
          field: 'dimensions_layout',
          multiline: true,
          required: true,
          helperText: fieldHelp.dimensions_layout,
          gridWidth: 12,
        },
        {
          label: 'Compliance with Standards',
          field: 'compliance',
          multiline: true,
          required: true,
          helperText: fieldHelp.compliance,
          gridWidth: 12,
        },
      ],
    },
    // Other Matters
    {
      title: 'Other Matters',
      section: 'other_matters',
      fields: [
        {
          label: 'Bicycle Parking Requirements and Provision',
          field: 'bicycle_parking',
          multiline: true,
          helperText: fieldHelp.bicycle_parking,
          gridWidth: 12,
        },
        {
          label: 'Loading and Waste Collection Details',
          field: 'loading_and_waste',
          multiline: true,
          helperText: fieldHelp.loading_and_waste,
          gridWidth: 12,
        },
        {
          label: 'Traffic Generation Estimates',
          field: 'traffic_generation',
          multiline: true,
          required: true,
          helperText: fieldHelp.traffic_generation,
          gridWidth: 12,
        },
      ],
    },
    // Conclusion
    {
      title: 'Conclusion',
      section: 'conclusion',
      fields: [
        {
          label: 'Summary of Findings',
          field: 'summary',
          multiline: true,
          required: true,
          helperText: fieldHelp.summary,
          gridWidth: 12,
        },
      ],
    },
  ], []);

  const isLastStep = activeStep === steps.length - 1;

  // Navigation handlers
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
    if (!condensedMode) {
      setActiveStep(stepIndex);
    }
  };

  const toggleCondensedMode = () => {
    setCondensedMode(!condensedMode);
  };

  const openHelpDialog = (fieldKey) => {
    setHelpDialog({
      open: true,
      field: fieldKey,
      text: fieldHelp[fieldKey] || 'No additional help available for this field.'
    });
  };

  const closeHelpDialog = () => {
    setHelpDialog({ open: false, field: '', text: '' });
  };

  // Check if field has content
  const hasContent = (section, field) => {
    return formData[section][field] && formData[section][field].trim().length > 0;
  };

  // Get current section
  const currentSection = sectionFields[activeStep];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ position: 'relative' }}>
      {/* Form Header with Completion Indicator */}
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 'bold', 
            mb: { xs: 2, md: 0 }, 
            textAlign: { xs: 'center', md: 'left' }, 
            color: 'primary.main',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: { xs: '50%', md: 0 },
              transform: { xs: 'translateX(-50%)', md: 'none' },
              width: { xs: '80px', md: '100px' },
              height: '4px',
              bgcolor: 'primary.main',
              borderRadius: '2px',
            }
          }}
        >
          Traffic Impact Assessment
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Tooltip title={`Form Completion: ${overallCompletion}%`}>
            <Box sx={{ mr: 2, minWidth: 150, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" color="textSecondary">
                  Completion
                </Typography>
                <Typography variant="caption" fontWeight="bold">
                  {overallCompletion}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={overallCompletion} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  }
                }}
              />
            </Box>
          </Tooltip>
          
          <Tooltip title={condensedMode ? "Switch to Wizard Mode" : "Switch to Condensed Mode"}>
            <Button
              onClick={toggleCondensedMode}
              startIcon={condensedMode ? <ViewAgendaIcon /> : <ViewCompactIcon />}
              variant="outlined"
              size="small"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {isMobile ? '' : (condensedMode ? "Wizard Mode" : "Condensed Mode")}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {!condensedMode && (
          <Grid item xs={12} md={3}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                position: 'sticky', 
                top: '20px', 
                borderRadius: 2,
                transition: 'box-shadow 0.3s ease',
                '&:hover': {
                  boxShadow: 5,
                },
                background: theme.palette.background.paper,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                Form Progress
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical" sx={{ ml: -1 }}>
                {steps.map((label, index) => {
                  const sectionKey = sectionFields[index].section;
                  const completion = getSectionCompletion(sectionKey);
                  
                  return (
                    <Step key={label}>
                      <StepLabel
                        onClick={() => handleStepClick(index)}
                        sx={{
                          cursor: 'pointer',
                          '& .MuiStepLabel-label': {
                            color: index === activeStep ? 'primary.main' : 'inherit',
                            fontWeight: index === activeStep ? 500 : 400,
                          },
                        }}
                        StepIconProps={{
                          active: index === activeStep,
                          completed: completion === 100,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          {label}
                          <Chip 
                            size="small" 
                            label={`${Math.round(completion)}%`} 
                            color={completion === 100 ? "success" : completion > 0 ? "primary" : "default"}
                            variant={completion > 0 ? "filled" : "outlined"}
                            sx={{ ml: 1, height: 24, fontSize: '0.65rem' }}
                          />
                        </Box>
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Paper>
          </Grid>
        )}

        <Grid item xs={12} md={condensedMode ? 12 : 9}>
          {condensedMode ? (
            // Condensed mode: Accordion for all sections
            <Box>
              {sectionFields.map((section, secIndex) => {
                const sectionCompletion = getSectionCompletion(section.section);
                
                return (
                  <Accordion 
                    key={section.title} 
                    defaultExpanded={secIndex === 0}
                    sx={{ 
                      mb: 2, 
                      boxShadow: theme.shadows[2],
                      borderRadius: '12px !important',
                      '&::before': { display: 'none' },
                      overflow: 'hidden',
                      transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        background: alpha(theme.palette.primary.main, 0.05),
                        '&.Mui-expanded': {
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {section.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Tooltip title={`Section Completion: ${Math.round(sectionCompletion)}%`}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                              {sectionCompletion === 100 ? (
                                <CheckCircleIcon color="success" fontSize="small" />
                              ) : sectionCompletion > 0 ? (
                                <ModeEditIcon color="primary" fontSize="small" />
                              ) : (
                                <ErrorIcon color="action" fontSize="small" />
                              )}
                              <Typography variant="body2" sx={{ ml: 0.5, color: 'text.secondary' }}>
                                {Math.round(sectionCompletion)}%
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        {section.fields.map((fieldObj, i) => {
                          const isFieldPopulated = hasContent(section.section, fieldObj.field);
                          
                          return (
                            <Grid item xs={12} sm={fieldObj.gridWidth || 12} key={i}>
                              <TextField
                                label={
                                  <>
                                    {fieldObj.label}
                                    {fieldObj.required && <span style={{ color: theme.palette.error.main }}> *</span>}
                                  </>
                                }
                                type={fieldObj.type || 'text'}
                                value={formData[section.section][fieldObj.field]}
                                onChange={(e) => handleChange(section.section, fieldObj.field, e.target.value)}
                                fullWidth
                                multiline={fieldObj.multiline}
                                minRows={fieldObj.multiline ? 3 : 1}
                                variant="outlined"
                                InputLabelProps={fieldObj.InputLabelProps || {}}
                                helperText={fieldObj.helperText}
                                InputProps={{
                                  endAdornment: (
                                    <Tooltip title="More information">
                                      <IconButton 
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openHelpDialog(fieldObj.field);
                                        }}
                                        sx={{ opacity: 0.7 }}
                                      >
                                        <HelpOutlineIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  ),
                                }}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    borderColor: isFieldPopulated 
                                      ? theme.palette.success.main 
                                      : undefined,
                                    transition: 'border-color 0.3s',
                                  },
                                }}
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          ) : (
            // Wizard mode: Show only current step
            <Zoom in={true} timeout={300}>
              <Card 
                elevation={2} 
                sx={{ 
                  mb: 8, 
                  borderRadius: 3, 
                  transition: 'box-shadow 0.3s ease',
                  overflow: 'visible',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 500, color: 'primary.main' }}>
                      {steps[activeStep]}
                    </Typography>
                    <Chip 
                      icon={
                        getSectionCompletion(currentSection.section) === 100 
                          ? <CheckCircleIcon /> 
                          : null
                      }
                      label={`${Math.round(getSectionCompletion(currentSection.section))}% Complete`}
                      color={
                        getSectionCompletion(currentSection.section) === 100 
                          ? "success"
                          : getSectionCompletion(currentSection.section) > 0 
                            ? "primary" 
                            : "default"
                      }
                      variant={getSectionCompletion(currentSection.section) > 0 ? "filled" : "outlined"}
                    />
                  </Box>

                  <Grid container spacing={3}>
                    {currentSection.fields.map((fieldObj, i) => {
                      const isFieldPopulated = hasContent(currentSection.section, fieldObj.field);
                      
                      return (
                        <Grid item xs={12} sm={fieldObj.gridWidth || 12} key={i}>
                          <TextField
                            label={
                              <>
                                {fieldObj.label}
                                {fieldObj.required && <span style={{ color: theme.palette.error.main }}> *</span>}
                              </>
                            }
                            type={fieldObj.type || 'text'}
                            value={formData[currentSection.section][fieldObj.field]}
                            onChange={(e) => handleChange(currentSection.section, fieldObj.field, e.target.value)}
                            fullWidth
                            multiline={fieldObj.multiline}
                            minRows={fieldObj.multiline ? 4 : 1}
                            variant="outlined"
                            InputLabelProps={fieldObj.InputLabelProps || {}}
                            helperText={fieldObj.helperText}
                            InputProps={{
                              endAdornment: (
                                <Tooltip title="More information">
                                  <IconButton 
                                    size="small" 
                                    onClick={() => openHelpDialog(fieldObj.field)}
                                    sx={{ opacity: 0.7 }}
                                  >
                                    <HelpOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              ),
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                transition: 'all 0.3s ease',
                                backgroundColor: isFieldPopulated 
                                  ? alpha(theme.palette.success.main, 0.05) 
                                  : undefined,
                              },
                            }}
                          />
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>
            </Zoom>
          )}
        </Grid>
      </Grid>

      {/* Wizard Navigation Buttons */}
      {!condensedMode && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box
            sx={{
              position: 'sticky',
              bottom: 0,
              background: theme.palette.background.paper,
              py: 2,
              px: 3,
              mt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `1px solid ${theme.palette.divider}`,
              borderRadius: '0 0 12px 12px',
              boxShadow: '0 -4px 10px rgba(0,0,0,0.05)',
              zIndex: 10,
            }}
          >
            <Button
              variant="outlined"
              color="secondary"
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              startIcon={<KeyboardArrowLeftIcon />}
              sx={{ minWidth: 100 }}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {!isLastStep && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleNext} 
                  disabled={loading}
                  endIcon={<KeyboardArrowRightIcon />}
                  sx={{ minWidth: 100 }}
                >
                  Next
                </Button>
              )}
              {isLastStep && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  endIcon={<SendIcon />}
                  sx={{ minWidth: 200 }}
                >
                  Generate TIA Report
                </Button>
              )}
            </Box>
          </Box>
        </>
      )}

      {/* Submit Button for Condensed Mode */}
      {condensedMode && (
        <Box
          sx={{
            textAlign: 'right',
            mt: 3,
            position: 'sticky',
            bottom: 20,
            zIndex: 10,
          }}
        >
          <Zoom in={true}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              endIcon={<SendIcon />}
              size="large"
              sx={{ 
                minWidth: 200,
                boxShadow: theme.shadows[4],
                borderRadius: 8,
                py: 1,
              }}
            >
              Generate TIA Report
            </Button>
          </Zoom>
        </Box>
      )}

      {/* Field Help Dialog */}
      <Dialog open={helpDialog.open} onClose={closeHelpDialog}>
        <DialogTitle>
          Field Guidance
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {helpDialog.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeHelpDialog} color="primary" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TiaForm;