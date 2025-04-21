// frontend/src/App.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Container, Box, Button, Paper, Typography, Alert, Snackbar, 
  Tabs, Tab, useMediaQuery, Fade, IconButton, Tooltip, Drawer,
  List, ListItem, ListItemIcon, ListItemText, Divider
} from '@mui/material';
import { 
  createTheme, ThemeProvider, alpha, 
  responsiveFontSizes 
} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Icons
import HistoryIcon from '@mui/icons-material/History';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import LightModeIcon from '@mui/icons-material/LightMode';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import CloseIcon from '@mui/icons-material/Close';

// Components
import Header from './components/Header';
import TiaForm from './components/TiaForm';
import TiaReport from './components/TiaReport';
import Loader from './components/Loader';
import ReportHistory from './components/ReportHistory';

// Create a theme instance with light/dark mode support
const getTheme = (mode) => responsiveFontSizes(createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#90caf9' : '#1976d2',
    },
    secondary: {
      main: mode === 'dark' ? '#f48fb1' : '#dc004e',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f8f9fa',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'dark' 
            ? '0 4px 20px 0 rgba(0,0,0,0.5)' 
            : '0 4px 20px 0 rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: mode === 'dark' 
              ? '0 6px 25px 0 rgba(0,0,0,0.7)' 
              : '0 6px 25px 0 rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: mode === 'dark' 
            ? '0 2px 10px 0 rgba(0,0,0,0.5)' 
            : '0 2px 10px 0 rgba(0,0,0,0.05)',
        },
        elevation3: {
          boxShadow: mode === 'dark' 
            ? '0 4px 20px 0 rgba(0,0,0,0.5)' 
            : '0 4px 20px 0 rgba(0,0,0,0.08)',
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderRadius: 8,
            },
          },
        },
      },
    },
  },
}));

// Generate initial form data with improved structure
const generateInitialFormData = () => ({
  project_details: {
    project_title: '',
    site_address: '',
    consultant_name: 'Dai Wang',
    company_name: 'TrafficAble Consultants',
    qualifications: 'B.Eng (Civil), MEng Study (Traffic and Transport)',
    contact_details: 'Email: trafficable@gmail.com, Mobile: 0450461917',
    client_name: '',
    report_date: new Date().toISOString().split('T')[0],
    development_type: '',
    zoning: '',
    pptn: '',
    council: '',
  },
  introduction: { purpose: '', council_feedback: '' },
  existing_conditions: { 
    site_location_description: '', 
    existing_land_use_and_layout: '', 
    surrounding_road_network_details: '', 
    public_transport_options: '' 
  },
  proposal: { 
    description: '', 
    facilities_details: '', 
    parking_arrangement: '' 
  },
  parking_assessment: { 
    existing_parking_provision: '', 
    proposed_parking_provision: '', 
    parking_rates_calculations: '', 
    expected_patrons: '', 
    justification: '' 
  },
  parking_design: { 
    dimensions_layout: '', 
    compliance: '' 
  },
  other_matters: { 
    bicycle_parking: '', 
    loading_and_waste: '', 
    traffic_generation: '' 
  },
  conclusion: { summary: '' },
});

function App() {
  // Load preferences from localStorage
  const savedDarkMode = localStorage.getItem('darkMode') === 'true';
  const savedCurrentTab = parseInt(localStorage.getItem('currentTab') || '0', 10);

  // State management
  const [darkMode, setDarkMode] = useState(savedDarkMode);
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('tiaFormData');
    return savedData ? JSON.parse(savedData) : generateInitialFormData();
  });
  const [tiaReportHistory, setTiaReportHistory] = useState(() => {
    const savedHistory = localStorage.getItem('tiaReportHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentTab, setCurrentTab] = useState(savedCurrentTab);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  const pollingIntervalRef = useRef(null);
  const theme = getTheme(darkMode ? 'dark' : 'light');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  
  // Effect to save report history to localStorage
  useEffect(() => {
    localStorage.setItem('tiaReportHistory', JSON.stringify(tiaReportHistory));
  }, [tiaReportHistory]);

  // Effect to save current tab to localStorage
  useEffect(() => {
    localStorage.setItem('currentTab', currentTab.toString());
  }, [currentTab]);

  // Effect to save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Form change handler with improved structure
  const handleChange = (section, field, value) => {
    const updatedFormData = {
      ...formData,
      [section]: { ...formData[section], [field]: value },
    };
    setFormData(updatedFormData);
    localStorage.setItem('tiaFormData', JSON.stringify(updatedFormData));
  };

  // Poll job status with improved error handling and feedback
  const pollJobStatus = async (jobId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/job-status/${jobId}`);
      console.log('Job status response:', response.data);
      const { status, result, error: jobError } = response.data;
  
      if (status === 'finished') {
        // Update UI with result
        setTiaReportHistory(prevHistory => [...prevHistory, result]);
        setCurrentTab(tiaReportHistory.length + 1);
        clearInterval(pollingIntervalRef.current);
        setLoading(false);
        setSuccess('TIA report generated successfully!');
      } else if (status === 'failed') {
        setError(jobError || 'Job failed unexpectedly.');
        clearInterval(pollingIntervalRef.current);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error polling job status:', err);
      setError('An error occurred while processing your request. Please try again.');
      clearInterval(pollingIntervalRef.current);
      setLoading(false);
    }
  };
  
  // Submit handler with improved feedback
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const enqueueResponse = await axios.post(
        `${BACKEND_URL}/generate-tia`,
        JSON.stringify(formData),
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { job_id } = enqueueResponse.data;

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      // Poll every 2 seconds with success message
      setSuccess('Your request has been submitted and is processing...');
      pollingIntervalRef.current = setInterval(() => {
        pollJobStatus(job_id);
      }, 2000);

    } catch (err) {
      console.error('Error initiating TIA generation job:', err);
      setError('An error occurred while initiating the TIA generation. Please check your network connection and try again.');
      setLoading(false);
    }
  };

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Theme toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Reset form data
  const handleResetForm = () => {
    setFormData(generateInitialFormData());
    localStorage.setItem('tiaFormData', JSON.stringify(generateInitialFormData()));
    setConfirmReset(false);
    setSuccess('Form has been reset');
  };

  // Export form data
  const handleExportForm = () => {
    const dataStr = JSON.stringify(formData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = `tia-form-data-${new Date().toISOString().slice(0, 10)}.json`;
    link.href = url;
    link.click();
    setSuccess('Form data exported successfully');
  };

  // Import form data
  const handleImportForm = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        setFormData(importedData);
        localStorage.setItem('tiaFormData', JSON.stringify(importedData));
        setSuccess('Form data imported successfully');
      } catch (err) {
        setError('Invalid file format. Please select a valid JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Drawer toggle
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        transition: 'background-color 0.3s ease'
      }}>
        <Header 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
          toggleDrawer={toggleDrawer} 
        />
        
        {/* Sidebar Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              TIA Generator
            </Typography>
            <IconButton onClick={toggleDrawer}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          <List>
            <ListItem button onClick={() => { setCurrentTab(0); toggleDrawer(); }}>
              <ListItemIcon>
                <EditIcon />
              </ListItemIcon>
              <ListItemText primary="Edit Form" />
            </ListItem>
            {tiaReportHistory.length > 0 && tiaReportHistory.map((_, idx) => (
              <ListItem 
                button 
                key={idx} 
                onClick={() => { setCurrentTab(idx + 1); toggleDrawer(); }}
                selected={currentTab === idx + 1}
              >
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText primary={`Report ${idx + 1}`} />
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            <ListItem button onClick={() => setHistoryDialogOpen(true)}>
              <ListItemIcon>
                <HistoryIcon />
              </ListItemIcon>
              <ListItemText primary="Report History" />
            </ListItem>
            <ListItem button onClick={handleExportForm}>
              <ListItemIcon>
                <SaveIcon />
              </ListItemIcon>
              <ListItemText primary="Export Form Data" />
            </ListItem>
            <ListItem button component="label">
              <ListItemIcon>
                <SaveIcon />
              </ListItemIcon>
              <ListItemText primary="Import Form Data" />
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportForm}
              />
            </ListItem>
            <ListItem button onClick={() => setConfirmReset(true)}>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary="Reset Form" />
            </ListItem>
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <Divider />
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
            <Tooltip title="About TIA Generator">
              <IconButton color="inherit">
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Drawer>

        <Container 
          maxWidth="lg" 
          sx={{ 
            flexGrow: 1, 
            py: { xs: 3, md: 5 }, 
            px: { xs: 2, md: 3 },
            transition: 'padding 0.3s ease'
          }}
        >
          {/* Desktop Tabs */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper elevation={1} sx={{ mb: 4, borderRadius: '16px', overflow: 'hidden' }}>
              <Tabs 
                value={currentTab} 
                onChange={handleTabChange} 
                variant="scrollable"
                scrollButtons="auto"
                aria-label="TIA Tabs" 
                sx={{ 
                  px: 2,
                  background: alpha(theme.palette.primary.main, 0.08),
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  }
                }}
              >
                <Tab 
                  label="Edit Form" 
                  icon={<EditIcon />} 
                  iconPosition="start"
                />
                {tiaReportHistory.map((_, idx) => (
                  <Tab 
                    key={idx} 
                    label={`Report ${idx + 1}`} 
                    icon={<DescriptionIcon />}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            </Paper>
          </Box>

          {/* Mobile Tab Title */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, mb: 3, alignItems: 'center' }}>
            <Typography variant="h5" component="h1">
              {currentTab === 0 ? 'TIA Form' : `Report ${currentTab}`}
            </Typography>
          </Box>

          {/* Alerts */}
          <Snackbar 
            open={!!error} 
            autoHideDuration={6000} 
            onClose={() => setError('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Snackbar>

          <Snackbar 
            open={!!success} 
            autoHideDuration={4000} 
            onClose={() => setSuccess('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Snackbar>

          {/* Reset Confirmation */}
          <Snackbar 
            open={confirmReset} 
            autoHideDuration={10000}
            onClose={() => setConfirmReset(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              severity="warning" 
              action={
                <>
                  <Button color="inherit" size="small" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                  <Button color="inherit" size="small" onClick={handleResetForm}>
                    Reset
                  </Button>
                </>
              }
            >
              Are you sure you want to reset the form? All data will be lost.
            </Alert>
          </Snackbar>

          {/* Main Content Area with Page Transitions */}
          <Fade in={true} timeout={500}>
            <Box>
              {currentTab === 0 && (
                <TiaForm
                  formData={formData}
                  handleChange={handleChange}
                  handleSubmit={handleSubmit}
                  loading={loading}
                />
              )}

              {currentTab > 0 && tiaReportHistory[currentTab - 1] && (
                <TiaReport
                  report={tiaReportHistory[currentTab - 1]}
                  formData={formData}
                  onBackToForm={() => setCurrentTab(0)}
                />
              )}

              {loading && <Loader />}
            </Box>
          </Fade>

          {/* Report History Dialog */}
          <ReportHistory 
            open={historyDialogOpen}
            reports={tiaReportHistory}
            onClose={() => setHistoryDialogOpen(false)}
            onSelectReport={(index) => {
              setCurrentTab(index + 1);
              setHistoryDialogOpen(false);
            }}
            onDeleteReport={(index) => {
              const newHistory = [...tiaReportHistory];
              newHistory.splice(index, 1);
              setTiaReportHistory(newHistory);
              
              // If we're on a tab that's been deleted, go back to form
              if (currentTab === index + 1) {
                setCurrentTab(0);
              } else if (currentTab > index + 1) {
                // Adjust current tab if we deleted a report before it
                setCurrentTab(currentTab - 1);
              }
            }}
          />
        </Container>
        
        {/* <Footer /> */}
      </Box>
    </ThemeProvider>
  );
}

export default App;