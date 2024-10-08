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
    site_location: '',
    site_type: '',
    existing_conditions: '',
    existing_use: '',
    proposal: '',
    parking_assessment: '',
    compliance_comments: '',
    other_matters: '',
  });

  const [tiaReport, setTiaReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
      <div>
        <Header />
        <Container maxWidth="md">
          <TiaForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            loading={loading}
          />
          {loading && <Loader />}
          {error && (
            <Alert severity="error" sx={{ marginTop: 2 }}>
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
