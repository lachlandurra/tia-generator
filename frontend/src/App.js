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

    console.log("handleSubmit triggered, current formData:", formData);

    try {
      const response = await axios.post(
        process.env.REACT_APP_BACKEND_URL || 'tia-generator-production.up.railway.app',
        JSON.stringify(formData),
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log("Response from /generate-tia:", response.data);
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
      <div className="bg-gray-100 min-h-screen">
        <Header />
        <Container maxWidth="md" className="bg-white p-6 rounded-lg shadow-md my-10">
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
            <Alert severity="error" className="mt-4">
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