import React, { useState } from 'react';
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
      report_date: '',
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
  const [tiaReportHistory, setTiaReportHistory] = useState([]); // store all generated reports
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // state to track current tab
  // 0 = form, 
  // 1..n = report history tabs
  const [currentTab, setCurrentTab] = useState(0);

  const handleChange = (section, field, value) => {
    const updatedFormData = {
      ...formData,
      [section]: { ...formData[section], [field]: value },
    };
    setFormData(updatedFormData);
    localStorage.setItem('tiaFormData', JSON.stringify(updatedFormData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.post(
        `${BACKEND_URL}/generate-tia`,
        JSON.stringify(formData),
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newReport = response.data;
      // Add the new report to history
      setTiaReportHistory((prevHistory) => [...prevHistory, newReport]);

      // Switch to the newly added report's tab
      setCurrentTab(tiaReportHistory.length + 1);

    } catch (err) {
      console.error('Error generating TIA:', err);
      setError('An error occurred while generating the TIA.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {/* Tabs: one for form, and one for each report */}
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="TIA Tabs" sx={{ mb: 3 }}>
            <Tab label="Edit Form" />
            {tiaReportHistory.map((_, idx) => (
              <Tab key={idx} label={`Report ${idx + 1}`} />
            ))}
          </Tabs>

          {currentTab === 0 && (
            <>
              {/* Form View */}
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
              {/* Report View */}
              <TiaReport
                report={tiaReportHistory[currentTab - 1]} 
                formData={formData}
              />
              {/* Button to go back to editing form while preserving history */}
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
