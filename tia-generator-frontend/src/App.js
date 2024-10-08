// src/App.js
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

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Customize your primary color
    },
    secondary: {
      main: '#dc004e', // Customize your secondary color
    },
  },
});

function App() {
  const [formData, setFormData] = useState({
    project_details: {
      project_title: '',
      site_address: '',
      consultant_name: 'Dai Wang', // Fixed value
      company_name: 'TrafficAble Consultants', // Fixed value
      qualifications: 'B.Eng (Civil), MEng Study (Traffic and Transport)', // Fixed value
      contact_details: 'Email: trafficable@gmail.com, Mobile: 0450461917', // Fixed value
      client_name: '',
      report_date: '',
      report_version: '',
    },
    introduction: {
      purpose: '',
      council_feedback: '',
    },
    existing_conditions: {
      site_location_description: '',
      existing_land_use_and_layout: '',
      surrounding_road_network_details: '',
      public_transport_options: '',
    },
    proposal: {
      description: '',
      facilities_details: '',
      parking_arrangement: '',
    },
    parking_assessment: {
      existing_parking_provision: '',
      proposed_parking_provision: '',
      parking_rates_calculations: '',
      expected_patrons: '',
      justification: '',
    },
    parking_design: {
      dimensions_layout: '',
      compliance: '',
    },
    other_matters: {
      bicycle_parking: '',
      loading_and_waste: '',
      traffic_generation: '',
    },
    conclusion: {
      summary: '',
    },
  });

  const [tiaReport, setTiaReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (section, field, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [section]: {
        ...prevState[section],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTiaReport('');
    setError('');

    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999/generate-tia',
        formData
      );
      setTiaReport(response.data.tia_report);
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
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <Container maxWidth="md" className="bg-white p-6 rounded-lg shadow-md my-10">
          <TiaForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            loading={loading}
          />
          {loading && <Loader />}
          {error && (
            <Alert severity="error" className="mt-4">
              {error}
            </Alert>
          )}
          {tiaReport && <TiaReport report={tiaReport} />}
        </Container>
      </div>
    </ThemeProvider>
  );
}

export default App;
