import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  MenuItem,
  Select
} from '@mui/material';

const AddBloodBank = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    hotline: '',
    email: '',
    website: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: ''
    },
    position: {
      lat: '',
      lng: ''
    },
    available: true,
    bloodTypes: [{ group: '', available: '' }]
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name in form.address) {
      setForm({ ...form, address: { ...form.address, [name]: value } });
    } else if (name in form.position) {
      setForm({ ...form, position: { ...form.position, [name]: value } });
    } else if (type === 'checkbox') {
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
    setFormErrors({ ...formErrors, [name]: '' });
  };

  const handleBloodTypeChange = (idx, field, value) => {
    const updated = form.bloodTypes.map((bt, i) =>
      i === idx ? { ...bt, [field]: value } : bt
    );
    setForm({ ...form, bloodTypes: updated });
  };

  const addBloodType = () => {
    setForm({ ...form, bloodTypes: [...form.bloodTypes, { group: '', available: '' }] });
  };

  const removeBloodType = (idx) => {
    setForm({ ...form, bloodTypes: form.bloodTypes.filter((_, i) => i !== idx) });
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name) errors.name = 'Name is required.';
    if (!form.address.street) errors.street = 'Street is required.';
    if (!form.address.city) errors.city = 'City is required.';
    if (!form.address.state) errors.state = 'State is required.';
    if (!form.phone) errors.phone = 'Phone is required.';
    if (!form.email) errors.email = 'Email is required.';
    if (!form.position.lat) errors.lat = 'Latitude is required.';
    if (!form.position.lng) errors.lng = 'Longitude is required.';
    for (const [i, bt] of form.bloodTypes.entries()) {
      if (!bt.group) errors[`bloodTypeGroup${i}`] = 'Type is required.';
      if (!bt.available) errors[`bloodTypeAvailable${i}`] = 'Units required.';
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please fix the errors above.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = token ? JSON.parse(atob(token.split('.')[1])).id : undefined;
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      const formData = {
        userId,
        name: form.name,
        address: {
          street: form.address.street,
          city: form.address.city,
          state: form.address.state
        },
        phone: form.phone,
        hotline: form.hotline,
        email: form.email,
        website: form.website,
        description: form.description,
        position: {
          lat: Number(form.position.lat),
          lng: Number(form.position.lng)
        },
        available: form.available,
        bloodTypes: form.bloodTypes.map(bt => ({ group: bt.group, available: Number(bt.available) }))
      };
      await axios.post('http://localhost:3001/api/v1/blood-banks', formData, { headers });
      setSuccess('Blood Bank added successfully');
      setTimeout(() => navigate('/bloodbank-dashboard'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Error adding blood bank');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Add Blood Bank
        </Typography>
        <Divider sx={{ my: 2 }}>General Info</Divider>
        <form onSubmit={handleSubmit}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth required sx={{ mb: 2 }} error={!!formErrors.name} helperText={formErrors.name} />
          <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth required sx={{ mb: 2 }} error={!!formErrors.email} helperText={formErrors.email} />
          <TextField label="Website" name="website" value={form.website} onChange={handleChange} fullWidth sx={{ mb: 2 }} />
          <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth multiline rows={2} sx={{ mb: 2 }} />
          <Divider sx={{ my: 2 }}>Address</Divider>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField label="Street" name="street" value={form.address.street} onChange={handleChange} fullWidth required error={!!formErrors.street} helperText={formErrors.street} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="City" name="city" value={form.address.city} onChange={handleChange} fullWidth required error={!!formErrors.city} helperText={formErrors.city} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="State" name="state" value={form.address.state} onChange={handleChange} fullWidth required error={!!formErrors.state} helperText={formErrors.state} />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }}>Contact</Divider>
          <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth required sx={{ mt: 2 }} error={!!formErrors.phone} helperText={formErrors.phone} />
          <TextField label="Hotline" name="hotline" value={form.hotline} onChange={handleChange} fullWidth sx={{ mt: 2 }} />
          <Divider sx={{ my: 2 }}>Location</Divider>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField label="Latitude" name="lat" value={form.position.lat} onChange={handleChange} fullWidth required type="number" error={!!formErrors.lat} helperText={formErrors.lat} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Longitude" name="lng" value={form.position.lng} onChange={handleChange} fullWidth required type="number" error={!!formErrors.lng} helperText={formErrors.lng} />
            </Grid>
          </Grid>
          <FormControlLabel
            control={<Switch checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} name="available" color="primary" />}
            label="Available"
            sx={{ mt: 2 }}
          />
          <Divider sx={{ my: 2 }}>Blood Types</Divider>
          {form.bloodTypes.map((bt, idx) => (
            <Grid container spacing={2} key={idx} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={6} sx={{ minWidth: 140 }}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  value={bt.group}
                  onChange={e => handleBloodTypeChange(idx, 'group', e.target.value)}
                  required
                  error={!!formErrors[`bloodTypeGroup${idx}`]}
                  helperText={formErrors[`bloodTypeGroup${idx}`]}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={4}>
                <TextField label="Units" value={bt.available} onChange={e => handleBloodTypeChange(idx, 'available', e.target.value)} fullWidth required type="number" error={!!formErrors[`bloodTypeAvailable${idx}`]} helperText={formErrors[`bloodTypeAvailable${idx}`]} />
              </Grid>
              <Grid item xs={2}>
                <Button color="error" onClick={() => removeBloodType(idx)} disabled={form.bloodTypes.length === 1}>Remove</Button>
              </Grid>
            </Grid>
          ))}
          <Button variant="outlined" onClick={addBloodType} sx={{ mt: 1 }}>Add Blood Type</Button>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          {success && <Typography color="success.main" sx={{ mt: 2 }}>{success}</Typography>}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="contained" color="primary" type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Add Blood Bank'}
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => navigate('/bloodbank-dashboard')}>Cancel</Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddBloodBank; 