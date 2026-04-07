import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Switch,
  FormControlLabel,
  CircularProgress,
  Grid
} from '@mui/material';

const BedTypes = {
  ICU: 'ICU',
  GENERAL: 'General',
  EMERGENCY: 'Emergency',
  PEDIATRIC: 'Pediatric',
  MATERNITY: 'Maternity'
};

const Specializations = {
  GENERAL: 'General',
  CARDIOLOGY: 'Cardiology',
  NEUROLOGY: 'Neurology',
  ORTHOPEDICS: 'Orthopedics',
  PEDIATRICS: 'Pediatrics',
  GYNECOLOGY: 'Gynecology',
  EMERGENCY: 'Emergency'
};

const AddHospital = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    hotline: '',
    email: '',
    address: {
      street: '',
      city: '',
      state: ''
    },
    type: 'hospital',
    position: {
      lat: 0,
      lng: 0
    },
    available: true,
    emergencyServices: true,
    website: '',
    description: '',
    beds: [],
    doctors: []
  });

  const [bed, setBed] = useState({
    type: Object.values(BedTypes)[0] || '',
    total: '',
    available: ''
  });

  const [doctor, setDoctor] = useState({
    name: '',
    specialization: Object.values(Specializations)[0] || '',
    available: true,
    contact: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    hotline: '',
    email: '',
    address: '',
    position: ''
  });

  const handleSubmit = async e => {
    e.preventDefault();
    console.log('Form submission started');
    setError('');
    setSuccess('');
    
    console.log('Current form data:', form);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    console.log('Form validation passed');
    
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      if (!token) {
        setError('No authentication token found');
        setLoading(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      console.log('Request headers:', headers);

      // Format the data before sending
      const formData = {
        userId: JSON.parse(atob(token.split('.')[1])).id,
        name: form.name,
        type: 'hospital',
        address: `${form.address.street}, ${form.address.city}, ${form.address.state}`,
        contact: form.phone,
        position: {
          lat: Number(form.position.lat),
          lng: Number(form.position.lng)
        },
        available: form.available,
        hotline: form.hotline,
        email: form.email,
        website: form.website || '',
        description: form.description || '',
        beds: form.beds.map(bed => ({
          type: bed.type,
          total: Number(bed.total),
          available: Number(bed.available)
        })),
        doctors: form.doctors.map(doctor => ({
          name: doctor.name,
          specialization: doctor.specialization,
          available: doctor.available,
        }))
      };

      console.log('Sending data to backend:', formData);

      try {
        console.log('Making POST request to create hospital');
        const createResponse = await axios.post(
          'http://localhost:3001/api/v1/hospitals',
          formData,
          { 
            headers,
            withCredentials: true
          }
        );

        console.log('Create hospital response:', createResponse.data);
        setSuccess('Hospital added successfully');
        navigate('/hospital-dashboard');

      } catch (createError) {
        console.log('Create request failed');
        console.error('Full error object:', createError);
        console.error('Error creating hospital:', createError.message);
        console.error('Error response:', createError.response);
        console.error('Error response data:', createError.response?.data);

        // Log the full error details
        if (createError.response) {
          console.log('Error Status:', createError.response.status);
          console.log('Error Headers:', createError.response.headers);
          console.log('Error Data:', createError.response.data);

          if (createError.response.data?.errors) {
            const errorMessages = createError.response.data.errors.map(err => 
              err.msg || err.message || JSON.stringify(err)
            ).join('\n');
            console.log('Setting error message:', errorMessages);
            setError(errorMessages);
          } else if (createError.response.data?.error) {
            console.log('Setting error message:', createError.response.data.error);
            setError(createError.response.data.error);
          } else {
            console.log('Setting generic error message');
            setError('An error occurred while creating the hospital');
          }
        } else if (createError.response?.status === 409) {
          console.log('Attempting to update existing hospital');
          try {
            const updateResponse = await axios.put(
              'http://localhost:3001/api/v1/hospitals/profile',
              formData,
              { 
                headers,
                withCredentials: true
              }
            );
            console.log('Update hospital response:', updateResponse.data);
            setSuccess('Hospital updated successfully');
            navigate('/dashboard');
          } catch (updateError) {
            console.error('Update error response:', updateError.response?.data);
            
            if (updateError.response?.data?.errors) {
              const errorMessages = updateError.response.data.errors.map(err => 
                err.msg || err.message || JSON.stringify(err)
              ).join('\n');
              setError(errorMessages);
            } else {
              setError(updateError.response?.data?.error || 'Error updating hospital profile');
            }
          }
        } else {
          console.log('Setting failed to create message');
          setError('Failed to create hospital. Please try again.');
        }
      }
    } catch (err) {
      console.error('Top level error in handleSubmit:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map(err => 
          err.msg || err.message || JSON.stringify(err)
        ).join('\n');
        setError(errorMessages);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      console.log('Form submission completed');
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = e => {
    const { name, value } = e.target;
    console.log('Address change:', name, value);
    setForm(prev => ({
      ...prev,
      address: { ...prev.address, [name]: value }
    }));
  };

  const handleCoordinatesChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      position: {
        ...prev.position,
        [name === 'longitude' ? 'lng' : name]: parseFloat(value) || 0
      }
    }));
  };

  const handleBedChange = e => {
    const { name, value } = e.target;
    setBed(prev => ({ ...prev, [name]: value }));
  };

  const handleDoctorChange = e => {
    const { name, value, type, checked } = e.target;
    setDoctor(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const addBed = () => {
    if (!bed.type || !bed.total || !bed.available) return;
    setForm(prev => ({ 
      ...prev, 
      beds: [...prev.beds, { 
        ...bed,
        total: parseInt(bed.total),
        available: parseInt(bed.available)
      }] 
    }));
    setBed({ type: '', total: '', available: '' });
  };

  const removeBed = idx => {
    setForm(prev => ({ ...prev, beds: prev.beds.filter((_, i) => i !== idx) }));
  };

  const addDoctor = () => {
    if (!doctor.name || !doctor.specialization) return;
    setForm(prev => ({ ...prev, doctors: [...prev.doctors, { ...doctor }] }));
    setDoctor({ name: '', specialization: '', available: true });
  };

  const removeDoctor = idx => {
    setForm(prev => ({ ...prev, doctors: prev.doctors.filter((_, i) => i !== idx) }));
  };

  const validateForm = () => {
    const errors = {};
    console.log('Validating form fields');

    if (!form.name) {
      errors.name = 'Hospital name is required';
    }

    if (!form.phone || !/^\d{10}$/.test(form.phone)) {
      console.log('Invalid phone:', form.phone);
      errors.phone = 'Please enter a valid Nepali phone number (10 digits)';
    }

    if (!form.hotline || !/^\d{10}$/.test(form.hotline)) {
      console.log('Invalid hotline:', form.hotline);
      errors.hotline = 'Please enter a valid Nepali hotline number (10 digits)';
    }

    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      console.log('Invalid email:', form.email);
      errors.email = 'Please enter a valid email address';
    }

    if (!form.address.street || !form.address.city || !form.address.state) {
      console.log('Invalid address:', form.address);
      errors.address = 'Complete address is required';
    }

    if (!form.position.lat || !form.position.lng) {
      console.log('Invalid position:', form.position);
      errors.position = 'Please select a location on the map';
    }

    console.log('Validation errors:', errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (loading) {
    return (
      <Container maxWidth='md' sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth='md' className='add-hospital-container'>
      <Paper elevation={3} className='add-hospital-card'>
        <div className='add-hospital-header'>
          <Typography variant='h4' component='h1' gutterBottom>
            Add Hospital
          </Typography>
        </div>
        {error && <Box className="error-message">{error}</Box>}
        {success && <Box className="success-message">{success}</Box>}
        <form className='add-hospital-form' onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='Hospital Name'
                name='name'
                value={form.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                error={!!formErrors.phone}
                helperText={formErrors.phone || 'Format: 10 digits'}
                placeholder="9800000000"
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Emergency Hotline"
                name="hotline"
                value={form.hotline}
                onChange={handleChange}
                error={!!formErrors.hotline}
                helperText={formErrors.hotline || 'Format: 10 digits'}
                placeholder="9800000000"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Street Address'
                name='street'
                value={form.address.street}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='City'
                name='city'
                value={form.address.city}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label='State'
                name='state'
                value={form.address.state}
                onChange={handleAddressChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude"
                name="lat"
                value={form.position.lat}
                onChange={handleCoordinatesChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude"
                name="longitude"
                value={form.position.lng}
                onChange={handleCoordinatesChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Website'
                name='website'
                value={form.website}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Description'
                name='description'
                multiline
                rows={4}
                value={form.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.available}
                    onChange={e => setForm(prev => ({ ...prev, available: e.target.checked }))}
                  />
                }
                label="Hospital Open"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.emergencyServices}
                    onChange={e => setForm(prev => ({ ...prev, emergencyServices: e.target.checked }))}
                  />
                }
                label="Emergency Services"
              />
            </Grid>
          </Grid>

          {/* Bed Management Section */}
          <Box mt={4}>
            <Typography variant='h6' gutterBottom>
              Bed Management
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ minWidth: 140 }}>
                <TextField
                  select
                  fullWidth
                  label="Type"
                  name="type"
                  value={bed.type}
                  onChange={handleBedChange}
                  defaultValue={Object.values(BedTypes)[0]}
                >
                  {Object.values(BedTypes).map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={6} sx={{ minWidth: 140 }}>
                <TextField
                  fullWidth
                  label='Total Beds'
                  name='total'
                  type='number'
                  value={bed.total}
                  onChange={handleBedChange}
                />
              </Grid>
              <Grid item xs={6} sx={{ minWidth: 140 }}>
                <TextField
                  fullWidth
                  label='Available Beds'
                  name='available'
                  type='number'
                  value={bed.available}
                  onChange={handleBedChange}
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant='contained'
                  onClick={addBed}
                  fullWidth
                >
                  Add Bed
                </Button>
              </Grid>
            </Grid>
            {/* Display added beds */}
            {form.beds.map((b, idx) => (
              <Box key={idx} mt={1}>
                <Typography>
                  {b.type}: {b.total} total, {b.available} available
                  <Button size="small" color="error" onClick={() => removeBed(idx)}>
                    Remove
                  </Button>
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Doctor Management Section */}
          <Box mt={4}>
            <Typography variant='h6' gutterBottom>
              Doctor Management
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sx={{ minWidth: 140 }}>
                <TextField
                  fullWidth
                  label='Doctor Name'
                  name='name'
                  value={doctor.name}
                  onChange={handleDoctorChange}
                />
              </Grid>
              <Grid item xs={6} sx={{ minWidth: 140 }}>
                <TextField
                  select
                  fullWidth
                  label="Specialization"
                  name="specialization"
                  value={doctor.specialization}
                  onChange={handleDoctorChange}
                  defaultValue={Object.values(Specializations)[0]}
                >
                  {Object.values(Specializations).map(spec => (
                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={doctor.available}
                      onChange={e => setDoctor(prev => ({ ...prev, available: e.target.checked }))}
                    />
                  }
                  label='Available'
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  variant='contained'
                  onClick={addDoctor}
                  fullWidth
                >
                  Add Doctor
                </Button>
              </Grid>
            </Grid>
            {form.doctors.map((d, idx) => (
              <Box key={idx} mt={1}>
                <Typography>
                  Dr. {d.name} - {d.specialization} ({d.available ? 'Available' : 'Unavailable'})
                  <Button size="small" color="error" onClick={() => removeDoctor(idx)}>
                    Remove
                  </Button>
                </Typography>
              </Box>
            ))}
          </Box>

          <Box mt={4}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Add Hospital
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AddHospital; 