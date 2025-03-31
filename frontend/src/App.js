import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import Header from './components/Header';
import TiaForm from './components/TiaForm';
import TiaReport from './components/TiaReport';
import Loader from './components/Loader';
import Alert from '@mui/material/Alert';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Tabs, Tab, Box, Button } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  }
});

function App() {
  const initialFormData = JSON.parse(localStorage.getItem('tiaFormData')) || {
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
    existing_conditions: { site_location_description: '', existing_land_use_and_layout: '', surrounding_road_network_details: '', public_transport_options: '' },
    proposal: { description: '', facilities_details: '', parking_arrangement: '' },
    parking_assessment: { existing_parking_provision: '', proposed_parking_provision: '', parking_rates_calculations: '', expected_patrons: '', justification: '' },
    parking_design: { dimensions_layout: '', compliance: '' },
    other_matters: { bicycle_parking: '', loading_and_waste: '', traffic_generation: '' },
    conclusion: { summary: '' },
  };

  const [formData, setFormData] = useState(initialFormData);
  const [tiaReportHistory, setTiaReportHistory] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentTab, setCurrentTab] = useState(0);

  const pollingIntervalRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleChange = (section, field, value) => {
    const updatedFormData = {
      ...formData,
      [section]: { ...formData[section], [field]: value },
    };
    setFormData(updatedFormData);
    localStorage.setItem('tiaFormData', JSON.stringify(updatedFormData));
  };

  const pollJobStatus = async (jobId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/job-status/${jobId}`);
      console.log('Job status response:', response.data);
      const { status, result, error: jobError } = response.data;
  
      if (status === 'finished') {
        // Update your UI with the result.
        setTiaReportHistory((prevHistory) => [...prevHistory, result]);
        setCurrentTab(tiaReportHistory.length + 1);
        clearInterval(pollingIntervalRef.current);
        setLoading(false);
      } else if (status === 'failed') {
        setError(jobError || 'Job failed unexpectedly.');
        clearInterval(pollingIntervalRef.current);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error polling job status:', err);
      setError('An error occurred while processing your request.');
      clearInterval(pollingIntervalRef.current);
      setLoading(false);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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

      // Poll every 2 seconds
      pollingIntervalRef.current = setInterval(() => {
        pollJobStatus(job_id);
      }, 2000);

    } catch (err) {
      console.error('Error initiating TIA generation job:', err);
      setError('An error occurred while initiating the TIA generation.');
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  useEffect(() => {
    // Clean up interval on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="TIA Tabs" sx={{ mb: 3 }}>
            <Tab label="Edit Form" />
            {tiaReportHistory.map((_, idx) => (
              <Tab key={idx} label={`Report ${idx + 1}`} />
            ))}
          </Tabs>

          {currentTab === 0 && (
            <>
              <TiaForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
              />
              {loading && <Loader />}
              {error && (
                <Alert severity="error" sx={{ mt: 4 }}>
                  {error}
                </Alert>
              )}
            </>
          )}

          {currentTab > 0 && (
            <>
              <TiaReport
                report={tiaReportHistory[currentTab - 1]}
                formData={formData}
              />
              <Box mt={2} display="flex" justifyContent="flex-start">
                <Button variant="outlined" color="secondary" onClick={() => setCurrentTab(0)}>
                  Back to Edit Form
                </Button>
              </Box>
            </>
          )}
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
