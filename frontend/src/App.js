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
  const [tiaReport, setTiaReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    setTiaReport('');
    setError('');

    const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

    try {
      const response = await axios.post(
        `${BACKEND_URL}/generate-tia`,
        JSON.stringify(formData),
        { headers: { 'Content-Type': 'application/json' } }
      );

      setTiaReport(response.data);
    } catch (err) {
      console.error('Error generating TIA:', err);
      setError('An error occurred while generating the TIA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
        <Header />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          {!tiaReport && (
            <TiaForm
              formData={formData}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              loading={loading}
            />
          )}
          {loading && <Loader />}
          {error && (
            <Alert severity="error" sx={{ mt: 4 }}>
              {error}
            </Alert>
          )}
          {tiaReport && (
            <TiaReport report={tiaReport} formData={formData} />
          )}
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
