// frontend/src/components/TiaReport.js
import React, { useState, useRef } from 'react';
import { 
  Button, Box, Paper, Typography, Card, CardContent, 
  Grid, IconButton, Tooltip, Divider, Chip, Accordion,
  AccordionSummary, AccordionDetails, Snackbar, Alert,
  Breadcrumbs, Link, Fab, Zoom, useMediaQuery, Collapse
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import axios from 'axios';

// Icons
import GetAppIcon from '@mui/icons-material/GetApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Section headings with icons and descriptions
const sectionInfo = {
  introduction_purpose: {
    title: "Introduction (Purpose)",
    description: "Overview of the report's purpose and scope",
    icon: "📋"
  },
  existing_conditions_site_location: {
    title: "Site Location",
    description: "Details about the site's location and surroundings",
    icon: "📍"
  },
  existing_conditions_land_use: {
    title: "Existing Land Use",
    description: "Current land use and site layout",
    icon: "🏢"
  },
  existing_conditions_road_network: {
    title: "Road Network",
    description: "Information about surrounding roads and traffic conditions",
    icon: "🛣️"
  },
  existing_conditions_public_transport: {
    title: "Public Transport",
    description: "Available public transport options near the site",
    icon: "🚌"
  },
  proposal_description: {
    title: "Proposal Description",
    description: "Overview of the proposed development",
    icon: "📝"
  },
  proposal_facilities: {
    title: "Proposed Facilities",
    description: "Details of facilities included in the development",
    icon: "🏗️"
  },
  proposal_parking: {
    title: "Proposed Parking",
    description: "Outline of the parking arrangement",
    icon: "🅿️"
  },
  parking_existing_provision: {
    title: "Existing Parking",
    description: "Current parking provision on site",
    icon: "🚗"
  },
  parking_proposed_provision: {
    title: "Proposed Parking",
    description: "Planned parking spaces and arrangement",
    icon: "🚙"
  },
  parking_rates_calculations: {
    title: "Parking Calculations",
    description: "Analysis of parking requirements and calculations",
    icon: "🧮"
  },
  parking_expected_patrons: {
    title: "Expected Patrons",
    description: "Estimates of visitor numbers and patterns",
    icon: "👥"
  },
  parking_justification: {
    title: "Parking Justification",
    description: "Rationale for the proposed parking provision",
    icon: "✅"
  },
  parking_design_dimensions: {
    title: "Parking Dimensions",
    description: "Physical dimensions and layout of parking spaces",
    icon: "📏"
  },
  parking_design_compliance: {
    title: "Parking Compliance",
    description: "Analysis of compliance with relevant standards",
    icon: "✓"
  },
  other_bicycle_parking: {
    title: "Bicycle Parking",
    description: "Provisions for bicycle parking",
    icon: "🚲"
  },
  other_loading_waste: {
    title: "Loading & Waste",
    description: "Arrangements for loading areas and waste collection",
    icon: "🚛"
  },
  other_traffic_generation: {
    title: "Traffic Generation",
    description: "Anticipated traffic generation from the development",
    icon: "🚦"
  },
  conclusion_summary: {
    title: "Conclusion",
    description: "Summary of key findings and recommendations",
    icon: "📊"
  }
};

// Group sections by category
const sectionCategories = {
  "Introduction": ["introduction_purpose"],
  "Existing Conditions": [
    "existing_conditions_site_location", 
    "existing_conditions_land_use", 
    "existing_conditions_road_network",
    "existing_conditions_public_transport"
  ],
  "The Proposal": [
    "proposal_description",
    "proposal_facilities",
    "proposal_parking"
  ],
  "Parking Assessment": [
    "parking_existing_provision",
    "parking_proposed_provision",
    "parking_rates_calculations",
    "parking_expected_patrons",
    "parking_justification"
  ],
  "Parking Design": [
    "parking_design_dimensions",
    "parking_design_compliance"
  ],
  "Other Matters": [
    "other_bicycle_parking",
    "other_loading_waste",
    "other_traffic_generation"
  ],
  "Conclusion": ["conclusion_summary"]
};

function TiaReport({ report, formData, onBackToForm }) {
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [expandedSection, setExpandedSection] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const reportRef = useRef(null);

  // Handle scrolling
  React.useEffect(() => {
    const handleScroll = () => {
      if (reportRef.current) {
        const scrollTop = reportRef.current.scrollTop;
        setShowScrollTop(scrollTop > 300);
      }
    };

    const currentRef = reportRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    if (reportRef.current) {
      reportRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // Handle section toggling
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Handle DOCX download
  const handleDownloadDocx = async () => {
    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
    try {
      setNotification({ open: true, message: 'Preparing your document...', severity: 'info' });
      
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
      link.setAttribute('download', `TIA_Report_${formData.project_details.project_title.replace(/\s+/g, '_')}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setNotification({ open: true, message: 'Document downloaded successfully!', severity: 'success' });
    } catch (err) {
      console.error('Error downloading docx:', err);
      setNotification({ open: true, message: 'Error downloading document. Please try again.', severity: 'error' });
    }
  };

  // Copy section text to clipboard
  const copyToClipboard = (text, sectionName) => {
    navigator.clipboard.writeText(text).then(() => {
      setNotification({ 
        open: true, 
        message: `${sectionInfo[sectionName]?.title || sectionName} copied to clipboard!`, 
        severity: 'success' 
      });
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      setNotification({ 
        open: true, 
        message: 'Failed to copy text to clipboard', 
        severity: 'error' 
      });
    });
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <Box 
      sx={{ 
        mt: 2, 
        pb: 8,
        position: 'relative',
        '@media print': {
          margin: 0,
          padding: 0
        }
      }}
    >
      {/* Report Header */}
      <Box 
        sx={{ 
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        <Box>
          <Breadcrumbs separator={<ChevronRightIcon fontSize="small" />} sx={{ mb: 1 }}>
            <Link 
              color="inherit" 
              href="#" 
              onClick={(e) => { e.preventDefault(); onBackToForm(); }}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <ArrowBackIcon fontSize="small" sx={{ mr: 0.5 }} />
              Back to Form
            </Link>
            <Typography color="text.primary">Report</Typography>
          </Breadcrumbs>
          
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              position: 'relative',
              '@media print': {
                fontSize: '24px'
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -8,
                left: 0,
                width: { xs: '120px', md: '150px' },
                height: '4px',
                bgcolor: theme.palette.primary.main,
                borderRadius: '2px',
              }
            }}
          >
            Traffic Impact Assessment
          </Typography>
          
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              mt: 2,
              fontWeight: 'normal',
              '@media print': {
                fontSize: '16px'
              }
            }}
          >
            {formData.project_details.project_title || 'Untitled Project'}
            {formData.project_details.site_address && ` - ${formData.project_details.site_address}`}
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            '@media print': {
              display: 'none'
            }
          }}
        >
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            Print
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onBackToForm}
          >
            Edit Form
          </Button>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={<GetAppIcon />}
            onClick={handleDownloadDocx}
          >
            Download DOCX
          </Button>
        </Box>
      </Box>

      {/* Report Content */}
      <Paper 
        elevation={3} 
        ref={reportRef} 
        sx={{ 
          p: 0, 
          maxHeight: '65vh', 
          overflowY: 'auto', 
          mb: 3, 
          borderRadius: '16px',
          position: 'relative',
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(theme.palette.primary.main, 0.3)} transparent`,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: alpha(theme.palette.primary.main, 0.3),
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
            }
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '@media print': {
            maxHeight: 'none',
            overflow: 'visible',
            boxShadow: 'none',
            padding: '0',
          }
        }}
      >
        {/* Report Project Details Header */}
        <Box
          sx={{
            p: 3,
            mb: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            '@media print': {
              backgroundColor: 'white',
              borderBottom: '1px solid #ddd',
              padding: '10px 0',
            }
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Project:
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {formData.project_details.project_title || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Site Address:
              </Typography>
              <Typography variant="body1">
                {formData.project_details.site_address || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Client:
              </Typography>
              <Typography variant="body1">
                {formData.project_details.client_name || 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Date:
              </Typography>
              <Typography variant="body1">
                {new Date(formData.project_details.report_date).toLocaleDateString('en-AU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Render Report by Categories */}
        <Box sx={{ p: 3 }}>
          {Object.entries(sectionCategories).map(([category, sectionKeys]) => (
            <Box key={category} sx={{ mb: 4, '@media print': { pageBreakInside: 'avoid' } }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  '@media print': {
                    fontSize: '18px',
                    color: '#000',
                  }
                }}
              >
                {category}
              </Typography>
              
              <Grid container spacing={3}>
                {sectionKeys.map((key) => {
                  if (!report[key]) return null;
                  
                  const sectionData = sectionInfo[key] || { 
                    title: key.replace(/_/g, ' '), 
                    description: '',
                    icon: '📄'
                  };
                  
                  return (
                    <Grid item xs={12} key={key}>
                      <Accordion 
                        expanded={expandedSection === key || !isMobile} 
                        onChange={() => isMobile && toggleSection(key)}
                        disableGutters
                        elevation={1}
                        sx={{ 
                          borderRadius: '12px',
                          overflow: 'hidden',
                          mb: 2,
                          '@media print': {
                            boxShadow: 'none',
                            margin: '10px 0',
                          }
                        }}
                      >
                        <AccordionSummary
                          expandIcon={isMobile ? <ExpandMoreIcon /> : null}
                          sx={{ 
                            display: { md: 'none' },
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            '@media print': {
                              display: 'block',
                              backgroundColor: 'white',
                              borderBottom: '1px solid #ddd',
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography 
                              variant="subtitle1" 
                              component="span"
                              sx={{ 
                                mr: 1, 
                                fontSize: '1.2rem', 
                                display: 'inline-block',
                                '@media print': {
                                  fontSize: '1rem',
                                }
                              }}
                            >
                              {sectionData.icon}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={500}>
                              {sectionData.title}
                            </Typography>
                          </Box>
                        </AccordionSummary>
                        
                        <AccordionDetails sx={{ p: 0 }}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              boxShadow: 'none',
                              borderRadius: 0,
                              '@media print': {
                                boxShadow: 'none',
                                border: 'none',
                              }
                            }}
                          >
                            <CardContent sx={{ position: 'relative' }}>
                              {/* Desktop Header (always visible on desktop) */}
                              <Box 
                                sx={{ 
                                  display: { xs: 'none', md: 'flex' },
                                  alignItems: 'center',
                                  mb: 2,
                                  '@media print': {
                                    display: 'flex',
                                  }
                                }}
                              >
                                <Typography 
                                  variant="h6" 
                                  gutterBottom 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    '@media print': {
                                      fontSize: '16px',
                                    }
                                  }}
                                >
                                  <Typography 
                                    variant="h6" 
                                    component="span"
                                    sx={{ 
                                      mr: 1, 
                                      fontSize: '1.2rem', 
                                      display: 'inline-block',
                                      '@media print': {
                                        fontSize: '1rem',
                                      }
                                    }}
                                  >
                                    {sectionData.icon}
                                  </Typography>
                                  {sectionData.title}
                                </Typography>
                                
                                {sectionData.description && (
                                  <Chip 
                                    label={sectionData.description} 
                                    size="small" 
                                    variant="outlined"
                                    sx={{ 
                                      ml: 2,
                                      '@media print': {
                                        display: 'none',
                                      }
                                    }}
                                  />
                                )}
                                
                                <Box sx={{ 
                                  ml: 'auto', 
                                  display: 'flex',
                                  '@media print': {
                                    display: 'none',
                                  }
                                }}>
                                  <Tooltip title="Copy content">
                                    <IconButton 
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(report[key], key);
                                      }}
                                    >
                                      <ContentCopyIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </Box>
                              
                              <Divider sx={{ 
                                mb: 2, 
                                display: { xs: 'none', md: 'block' },
                                '@media print': {
                                  display: 'block',
                                }
                              }} />
                              
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  whiteSpace: 'pre-wrap',
                                  lineHeight: 1.8,
                                  textAlign: 'justify',
                                  '@media print': {
                                    fontSize: '12px',
                                    lineHeight: 1.6,
                                  }
                                }}
                              >
                                {report[key]}
                              </Typography>
                            </CardContent>
                          </Card>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          variant="filled"
          elevation={6}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Scroll to top button */}
      <Zoom in={showScrollTop}>
        <Fab 
          color="primary" 
          size="small" 
          onClick={scrollToTop}
          sx={{ 
            position: 'absolute', 
            bottom: 16, 
            right: 16,
            boxShadow: theme.shadows[3],
            '@media print': {
              display: 'none',
            }
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Zoom>
    </Box>
  );
}

export default TiaReport;