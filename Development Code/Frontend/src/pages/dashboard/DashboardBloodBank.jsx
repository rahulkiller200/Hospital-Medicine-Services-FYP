import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_V1_URL } from '../../config/apiConfig';
import {
  FaSignOutAlt,
  FaTint,
  FaPhone,
  FaMapMarkerAlt,
  FaUser,
  FaTimes
} from 'react-icons/fa';
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  FormControlLabel,
  Switch,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

function BloodTypeManagement({ bloodTypes, setBloodTypes, onSave }) {
  const [editIdx, setEditIdx] = useState(null);
  const [form, setForm] = useState({ group: '', available: '' });
  const [loading, setLoading] = useState(false);
  const bloodGroups = [
    'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!form.group || form.available === '') return;
    setLoading(true);
    try {
      const updated = [...bloodTypes, { group: form.group, available: parseInt(form.available) }];
      await onSave(updated);
      setBloodTypes(updated);
      setForm({ group: '', available: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setForm({
      group: bloodTypes[idx].group,
      available: bloodTypes[idx].available.toString()
    });
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updated = bloodTypes.map((b, i) =>
        i === editIdx ? { group: form.group, available: parseInt(form.available) } : b
      );
      await onSave(updated);
      setBloodTypes(updated);
      setEditIdx(null);
      setForm({ group: '', available: '' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (idx) => {
    setLoading(true);
    try {
      const updated = bloodTypes.filter((_, i) => i !== idx);
      await onSave(updated);
      setBloodTypes(updated);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          <FaTint style={{ marginRight: 8 }} />
          Blood Type Management
        </Typography>
        <Grid container spacing={2} alignItems='center'>
          {bloodTypes.map((b, idx) => (
            <React.Fragment key={idx}>
              <Grid gridColumn="span 4">{b.group}</Grid>
              <Grid gridColumn="span 4">{b.available}</Grid>
              <Grid gridColumn="span 4">
                <Button size='small' onClick={() => handleEdit(idx)} variant='outlined'>Edit</Button>
                <Button size='small' color='error' onClick={() => handleRemove(idx)} variant='outlined' sx={{ ml: 1 }}>Remove</Button>
              </Grid>
            </React.Fragment>
          ))}
          <Grid gridColumn="span 4">
            <TextField
              select
              name='group'
              value={form.group}
              onChange={handleChange}
              size='small'
              fullWidth
              SelectProps={{ native: true }}
            >
              <option value=''>Select Group</option>
              {bloodGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </TextField>
          </Grid>
          <Grid gridColumn="span 4">
            <TextField
              name='available'
              value={form.available}
              onChange={handleChange}
              size='small'
              type='number'
              fullWidth
              inputProps={{ min: 0 }}
              placeholder='Available Units'
            />
          </Grid>
          <Grid gridColumn="span 4">
            {loading ? (
              <CircularProgress size={24} />
            ) : editIdx === null ? (
              <Button size='small' onClick={handleAdd} variant='contained' color='primary'>Add</Button>
            ) : (
              <Button size='small' onClick={handleUpdate} variant='contained' color='primary'>Update</Button>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

function BloodBankInfoForm({ bloodBank, onUpdate, onClose }) {
  const [form, setForm] = useState({
    name: bloodBank?.name || '',
    hotline: bloodBank?.hotline || '',
    available: bloodBank?.available ?? true,
    phone: bloodBank?.phone || '',
    street: bloodBank?.address?.street || '',
    city: bloodBank?.address?.city || '',
    state: bloodBank?.address?.state || '',
    lat: bloodBank?.position?.lat || '',
    lng: bloodBank?.position?.lng || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onUpdate({
        name: form.name,
        phone: form.phone,
        hotline: form.hotline,
        available: form.available,
        address: {
          street: form.street,
          city: form.city,
          state: form.state
        },
        position: {
          lat: parseFloat(form.lat),
          lng: parseFloat(form.lng)
        }
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Error updating blood bank info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Typography variant='h6'>Update Blood Bank Information</Typography>
          <IconButton onClick={onClose} size='small'><FaTimes /></IconButton>
        </div>
        {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid gridColumn="span 12">
              <TextField
                fullWidth
                label='Name'
                name='name'
                value={form.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid gridColumn="span 12">
              <TextField
                fullWidth
                label='Phone'
                name='phone'
                value={form.phone}
                onChange={handleChange}
                required
                inputProps={{
                  pattern: '^\\+?[0-9 \\-]{10,}$',
                  title: 'Enter a valid phone number (10+ digits, spaces, dashes, optional +)'
                }}
              />
            </Grid>
            <Grid gridColumn="span 12">
              <TextField
                fullWidth
                label='Hotline'
                name='hotline'
                value={form.hotline}
                onChange={handleChange}
                required
                inputProps={{
                  pattern: '^\\+?[0-9 \\-]{10,}$',
                  title: 'Enter a valid phone number (10+ digits, spaces, dashes, optional +)'
                }}
              />
            </Grid>
            <Grid gridColumn="span 12">
              <FormControlLabel
                control={<Switch checked={form.available} onChange={handleChange} name='available' />}
                label='Blood Bank Open'
              />
            </Grid>
            <Grid gridColumn="span 12">
              <TextField
                fullWidth
                label='Street'
                name='street'
                value={form.street}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid gridColumn="span 12">
              <TextField
                fullWidth
                label='City'
                name='city'
                value={form.city}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid gridColumn="span 12">
              <TextField
                fullWidth
                label='State'
                name='state'
                value={form.state}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid gridColumn="span 12">
              <TextField
                fullWidth
                label='Latitude'
                name='lat'
                type='number'
                value={form.lat}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid gridColumn="span 12">
              <TextField
                fullWidth
                label='Longitude'
                name='lng'
                type='number'
                value={form.lng}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid gridColumn="span 12">
              <Button type='submit' variant='contained' color='primary' disabled={loading} fullWidth>
                {loading ? <CircularProgress size={24} /> : 'Update Information'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}

const DashboardBloodBank = () => {
  const navigate = useNavigate();
  const [bloodBank, setBloodBank] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [hotline, setHotline] = useState('');
  const [editingHotline, setEditingHotline] = useState(false);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [bloodBankId, setBloodBankId] = useState(null);

  // Helper to extract userId from JWT (if stored in localStorage as 'token')
  function getUserIdFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  }

  const userId = getUserIdFromToken();

  useEffect(() => {
    fetchBloodBank();
  }, []);

  const fetchBloodBank = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token || !userId) {
        setAlert({ open: true, message: 'No authentication token found. Please login again.', severity: 'error' });
        navigate('/login');
        return;
      }
      const response = await axios.get(`${API_V1_URL}/blood-banks/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.data || !response.data.success) {
        throw new Error('No data received from server');
      }
      const bankData = response.data.data;
      setBloodBank(bankData);
      setBloodBankId(bankData._id);
      setHotline(bankData.hotline || '');
      setBloodTypes(bankData.bloodTypes || []);
    } catch (error) {
      setAlert({ open: true, message: error.response?.data?.message || 'Error fetching blood bank info. Please try again.', severity: 'error' });
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openLogoutDialog = () => {
    setLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const handleHotlineSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!bloodBankId) return;
      await axios.put(`${API_V1_URL}/blood-banks/${bloodBankId}`, { hotline }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingHotline(false);
      setAlert({ open: true, message: 'Hotline updated successfully', severity: 'success' });
      fetchBloodBank();
    } catch (error) {
      setAlert({ open: true, message: error.response?.data?.message || 'Error updating hotline', severity: 'error' });
    }
  };

  const handleBloodTypeSave = async (updatedBloodTypes) => {
    try {
      const token = localStorage.getItem('token');
      if (!bloodBankId) return;
      const updateData = {
        name: bloodBank.name,
        address: bloodBank.address,
        phone: bloodBank.phone,
        hotline: bloodBank.hotline,
        available: bloodBank.available,
        position: bloodBank.position,
        bloodTypes: updatedBloodTypes
      };
      await axios.put(`${API_V1_URL}/blood-banks/${bloodBankId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ open: true, message: 'Blood type information updated successfully', severity: 'success' });
      fetchBloodBank();
    } catch (error) {
      setAlert({ open: true, message: error.response?.data?.message || 'Error updating blood types', severity: 'error' });
    }
  };

  const handleBloodBankUpdate = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      if (!bloodBankId) return;
      const response = await axios.put(`${API_V1_URL}/blood-banks/${bloodBankId}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setAlert({ open: true, message: 'Blood bank information updated successfully', severity: 'success' });
        setShowUpdateForm(false);
        fetchBloodBank();
      } else {
        throw new Error(response.data.error || 'Failed to update blood bank information');
      }
    } catch (error) {
      setAlert({ open: true, message: error.response?.data?.error || 'Error updating blood bank information', severity: 'error' });
    }
  };

  if (loading) {
    return (
      <div className='dashboard-container'>
        <div className='loading-container'>
          <CircularProgress />
          <Typography variant='h6' sx={{ mt: 2 }}>Loading blood bank information...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-container'>
      <div className='sidebar'>
        <div className='sidebar-header'>
          <FaTint size={24} />
          <h2>Blood Bank Panel</h2>
        </div>
        <div className='sidebar-menu'>
          <button
            className={`sidebar-menu-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <FaTint style={{ marginRight: 8 }} />
            Overview
          </button>
          <button
            className={`sidebar-menu-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <FaUser style={{ marginRight: 8 }} />
            Profile
          </button>
        </div>
        <div className='sidebar-footer'>
          <button className='logout-button' onClick={openLogoutDialog}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </div>
      <div className='main-content'>
        <div className='dashboard-content'>
          <Typography variant='h4' gutterBottom>
            {activeSection === 'overview' ? 'Blood Bank Overview' : 'Blood Bank Profile'}
          </Typography>
          {!bloodBank ? (
            <Card>
              <CardContent>
                <Typography variant='h6' color='error' gutterBottom>
                  No Blood Bank Data Available
                </Typography>
                <Typography variant='body1'>
                  Please make sure you have registered your blood bank information.
                </Typography>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => navigate('/add-bloodbank')}
                  sx={{ mt: 2 }}
                >
                  Add Blood Bank Information
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {activeSection === 'overview' ? (
                <>
                  <Grid gridColumn="span 12">
                    <Card>
                      <CardContent>
                        <Typography variant='h6' gutterBottom>
                          <FaTint style={{ marginRight: 8 }} />
                          Blood Bank Information
                        </Typography>
                        <div className='info-grid'>
                          <div className='info-item'>
                            <span className='label'>Name:</span>
                            <span className='value'>{bloodBank?.name || 'N/A'}</span>
                          </div>
                          <div className='info-item'>
                            <span className='label'>Address:</span>
                            <span className='value'>
                              {bloodBank?.address ?
                                `${bloodBank.address.street}, ${bloodBank.address.city}, ${bloodBank.address.state}` :
                                'N/A'}
                            </span>
                          </div>
                          <div className='info-item'>
                            <span className='label'>Phone:</span>
                            <span className='value'>{bloodBank?.phone || 'N/A'}</span>
                          </div>
                          <div className='info-item'>
                            <span className='label'>Hotline:</span>
                            <span className='value'>{bloodBank?.hotline || 'N/A'}</span>
                          </div>
                          <div className='info-item'>
                            <span className='label'>Status:</span>
                            <span className='value' style={{
                              color: bloodBank?.available ? '#4CAF50' : '#f44336',
                              fontWeight: 'bold'
                            }}>
                              {bloodBank?.available ? 'Open' : 'Closed'}
                            </span>
                          </div>
                          <div className='info-item'>
                            <span className='label'>Location:</span>
                            <span className='value'>
                              {bloodBank?.position && (bloodBank.position.lat !== 0 || bloodBank.position.lng !== 0) ? (
                                <>
                                  Lat: {bloodBank.position.lat.toFixed(4)}, Lng: {bloodBank.position.lng.toFixed(4)}
                                </>
                              ) : (
                                'Location not set'
                              )}
                            </span>
                          </div>
                          <div className='info-item'>
                            <span className='label'>Last Updated:</span>
                            <span className='value'>
                              {bloodBank?.updatedAt ? new Date(bloodBank.updatedAt).toLocaleString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid gridColumn="span 12">
                    <Card>
                      <CardContent>
                        <Typography variant='h6' gutterBottom>
                          <FaPhone style={{ marginRight: 8 }} />
                          Emergency Hotline
                        </Typography>
                        {editingHotline ? (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <TextField
                              value={hotline}
                              onChange={e => setHotline(e.target.value)}
                              fullWidth
                              placeholder='Enter emergency hotline number'
                            />
                            <Button
                              onClick={handleHotlineSave}
                              variant='contained'
                              color='primary'
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => setEditingHotline(false)}
                              variant='outlined'
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Typography variant='body1' style={{ fontWeight: 600 }}>
                              {hotline || 'No hotline set'}
                            </Typography>
                            <Button
                              onClick={() => setEditingHotline(true)}
                              variant='outlined'
                              size='small'
                            >
                              Edit
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant='h6' gutterBottom>
                          Quick Actions
                        </Typography>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <Button
                            variant='contained'
                            color='primary'
                            onClick={() => setShowUpdateForm(true)}
                          >
                            Update Blood Bank Info
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setShowUpdateForm(true)}
                            variant='outlined'
                            color='secondary'
                          >
                            Open Update Info
                          </Button>
                          {bloodBank.position && (
                            <Button
                              variant='outlined'
                              color='primary'
                              onClick={() => window.open(`https://www.google.com/maps?q=${bloodBank.position.lat},${bloodBank.position.lng}`, '_blank')}
                            >
                              View on Map
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Grid>
                  {showUpdateForm && (
                    <Grid gridColumn="span 12">
                      <BloodBankInfoForm
                        bloodBank={bloodBank}
                        onUpdate={handleBloodBankUpdate}
                        onClose={() => setShowUpdateForm(false)}
                      />
                    </Grid>
                  )}
                  <Grid gridColumn="span 12">
                    <BloodTypeManagement
                      bloodTypes={bloodTypes}
                      setBloodTypes={setBloodTypes}
                      onSave={handleBloodTypeSave}
                    />
                  </Grid>
                </>
              ) : (
                <Grid gridColumn="span 12">
                  <Card>
                    <CardContent>
                      <Typography variant='h6' gutterBottom>
                        Edit Blood Bank Profile
                      </Typography>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const formData = {
                            name: e.target.name.value,
                            phone: e.target.phone.value,
                            hotline: e.target.hotline.value,
                            available: e.target.available.checked,
                            address: {
                              street: e.target.street.value,
                              city: e.target.city.value,
                              state: e.target.state.value
                            },
                            position: {
                              lat: parseFloat(e.target.lat.value),
                              lng: parseFloat(e.target.lng.value)
                            }
                          };
                          await handleBloodBankUpdate(formData);
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid gridColumn="span 12">
                            <TextField
                              fullWidth
                              label='Name'
                              name='name'
                              defaultValue={bloodBank.name}
                              required
                            />
                          </Grid>
                          <Grid gridColumn="span 12">
                            <TextField
                              fullWidth
                              label='Phone'
                              name='phone'
                              defaultValue={bloodBank.phone}
                              required
                              inputProps={{
                                pattern: '^\\+?[0-9 \\-]{10,}$',
                                title: 'Enter a valid phone number (10+ digits, spaces, dashes, optional +)'
                              }}
                            />
                          </Grid>
                          <Grid gridColumn="span 12">
                            <TextField
                              fullWidth
                              label='Hotline'
                              name='hotline'
                              defaultValue={bloodBank.hotline}
                              required
                              inputProps={{
                                pattern: '^\\+?[0-9 \\-]{10,}$',
                                title: 'Enter a valid phone number (10+ digits, spaces, dashes, optional +)'
                              }}
                            />
                          </Grid>
                          <Grid gridColumn="span 12">
                            <FormControlLabel
                              control={
                                <Switch
                                  name='available'
                                  defaultChecked={bloodBank.available}
                                />
                              }
                              label='Blood Bank Open'
                            />
                          </Grid>
                          <Grid gridColumn="span 12">
                            <TextField
                              fullWidth
                              label='Street'
                              name='street'
                              defaultValue={bloodBank.address?.street || ''}
                              required
                            />
                          </Grid>
                          <Grid gridColumn="span 12">
                            <TextField
                              fullWidth
                              label='City'
                              name='city'
                              defaultValue={bloodBank.address?.city || ''}
                              required
                            />
                          </Grid>
                          <Grid gridColumn="span 12">
                            <TextField
                              fullWidth
                              label='State'
                              name='state'
                              defaultValue={bloodBank.address?.state || ''}
                              required
                            />
                          </Grid>
                          <Grid gridColumn="span 12">
                            <TextField
                              fullWidth
                              label='Latitude'
                              name='lat'
                              type='number'
                              defaultValue={bloodBank.position?.lat || ''}
                              required
                            />
                          </Grid>
                          <Grid gridColumn="span 12">
                            <TextField
                              fullWidth
                              label='Longitude'
                              name='lng'
                              type='number'
                              defaultValue={bloodBank.position?.lng || ''}
                              required
                            />
                          </Grid>
                          <Grid gridColumn="span 12">
                            <Button
                              type='submit'
                              variant='contained'
                              color='primary'
                              fullWidth
                            >
                              Save Profile
                            </Button>
                          </Grid>
                        </Grid>
                      </form>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </div>
      </div>
      <Dialog open={logoutDialogOpen} onClose={closeLogoutDialog}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to log out?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogoutDialog} color='primary'>Cancel</Button>
          <Button onClick={handleLogout} color='error'>Logout</Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={() => setAlert({ ...alert, open: false })}
      >
        <Alert
          onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity}
          sx={{ width: '100%' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DashboardBloodBank;