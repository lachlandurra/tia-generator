// TiaForm.js

import React from 'react';
import { TextField, Button, Grid, Paper, Typography } from '@mui/material';

function TiaForm({ formData, handleChange, handleSubmit, loading }) {
  return (
    <Paper elevation={3} sx={{ padding: 4, marginTop: 4 }}>
      <Typography variant="h5" gutterBottom>
        Enter TIA Details
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {Object.keys(formData).map((key) => (
            <Grid item xs={12} sm={6} key={key}>
              <TextField
                label={key.replace(/_/g, ' ').toUpperCase()}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                multiline
                rows={3}
                variant="outlined"
                fullWidth
                required
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              fullWidth
              size="large"
            >
              {loading ? 'Generating...' : 'Generate TIA'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
}

export default TiaForm;
