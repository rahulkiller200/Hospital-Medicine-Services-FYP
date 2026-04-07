import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_V1_URL } from "../../config/apiConfig";
import { FaSignOutAlt, FaHospital, FaPhone, FaBed, FaUserMd, FaTimes } from "react-icons/fa";
import { 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Snackbar, 
  Alert, 
  MenuItem,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from "@mui/material";

// Import bed types and specializations from model
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

function BedManagement({ beds, setBeds, onSave }) {
  const [editIdx, setEditIdx] = useState(null);
  const [bedForm, setBedForm] = useState({ type: "", total: "", available: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBedForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdd = async () => {
    if (!bedForm.type || !bedForm.total || !bedForm.available) return;
    if (parseInt(bedForm.available) > parseInt(bedForm.total)) {
      alert("Available beds cannot exceed total beds");
      return;
    }
    setLoading(true);
    try {
      const updatedBeds = [...beds, { 
        type: bedForm.type,
        total: parseInt(bedForm.total),
        available: parseInt(bedForm.available)
      }];
      await onSave(updatedBeds);
      setBeds(updatedBeds);
      setBedForm({ type: "", total: "", available: "" });
    } catch (error) {
      console.error('Error adding bed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setBedForm({
      type: beds[idx].type,
      total: beds[idx].total.toString(),
      available: beds[idx].available.toString()
    });
  };

  const handleUpdate = async () => {
    if (parseInt(bedForm.available) > parseInt(bedForm.total)) {
      alert("Available beds cannot exceed total beds");
      return;
    }
    setLoading(true);
    try {
      const updatedBeds = beds.map((b, i) => (i === editIdx ? { 
        type: bedForm.type,
        total: parseInt(bedForm.total),
        available: parseInt(bedForm.available)
      } : b));
      await onSave(updatedBeds);
      setBeds(updatedBeds);
    setEditIdx(null);
      setBedForm({ type: "", total: "", available: "" });
    } catch (error) {
      console.error('Error updating bed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (idx) => {
    setLoading(true);
    try {
      const updatedBeds = beds.filter((_, i) => i !== idx);
      await onSave(updatedBeds);
      setBeds(updatedBeds);
    } catch (error) {
      console.error('Error removing bed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <FaBed style={{ marginRight: 8 }} />
          Bed Management
        </Typography>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ward/Type</TableCell>
              <TableCell>Total Beds</TableCell>
                <TableCell>Available</TableCell>
              <TableCell>Occupied</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {beds.map((bed, idx) => (
              <TableRow key={idx}>
                <TableCell>{bed.type}</TableCell>
                <TableCell>{bed.total}</TableCell>
                  <TableCell>{bed.available}</TableCell>
                  <TableCell>{bed.total - bed.available}</TableCell>
                <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(idx)}>
                    Edit
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" color="error" onClick={() => handleRemove(idx)}>
                    Remove
                      </IconButton>
                    </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <TextField
                  select
                  name="type"
                  value={bedForm.type}
                  onChange={handleChange}
                  size="small"
                  fullWidth
                >
                    {Object.values(BedTypes).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </TableCell>
              <TableCell>
                <TextField
                  name="total"
                  value={bedForm.total}
                  onChange={handleChange}
                  size="small"
                  type="number"
                  fullWidth
                    inputProps={{ min: 0 }}
                />
              </TableCell>
              <TableCell>
                <TextField
                    name="available"
                    value={bedForm.available}
                  onChange={handleChange}
                  size="small"
                  type="number"
                  fullWidth
                    inputProps={{ min: 0 }}
                  />
                </TableCell>
                <TableCell>
                  {bedForm.total && bedForm.available ? bedForm.total - bedForm.available : '-'}
                </TableCell>
                <TableCell>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : editIdx === null ? (
                    <Button size="small" onClick={handleAdd} variant="contained" color="primary">
                      Add
                    </Button>
                  ) : (
                    <Button size="small" onClick={handleUpdate} variant="contained" color="primary">
                      Update
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

function DoctorManagement({ doctors, setDoctors, onSave }) {
  const [editIdx, setEditIdx] = useState(null);
  const [doctorForm, setDoctorForm] = useState({
    name: '',
    specialization: Object.values(Specializations)[0],
    available: true
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDoctorForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAdd = async () => {
    if (!doctorForm.name || !doctorForm.specialization) return;
    setLoading(true);
    try {
      const updatedDoctors = [...doctors, { ...doctorForm }];
      await onSave(updatedDoctors);
      setDoctors(updatedDoctors);
      setDoctorForm({ name: '', specialization: Object.values(Specializations)[0], available: true });
    } catch (error) {
      console.error('Error adding doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setDoctorForm(doctors[idx]);
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const updatedDoctors = doctors.map((d, i) => (i === editIdx ? { ...doctorForm } : d));
      await onSave(updatedDoctors);
      setDoctors(updatedDoctors);
      setEditIdx(null);
      setDoctorForm({ name: '', specialization: Object.values(Specializations)[0], available: true });
    } catch (error) {
      console.error('Error updating doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (idx) => {
    setLoading(true);
    try {
      const updatedDoctors = doctors.filter((_, i) => i !== idx);
      await onSave(updatedDoctors);
      setDoctors(updatedDoctors);
    } catch (error) {
      console.error('Error removing doctor:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <FaUserMd style={{ marginRight: 8 }} />
          Doctor Management
        </Typography>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Specialization</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {doctors.map((doctor, idx) => (
                <TableRow key={idx}>
                  <TableCell>Dr. {doctor.name}</TableCell>
                  <TableCell>{doctor.specialization}</TableCell>
                  <TableCell>
                    <span style={{ 
                      color: doctor.available ? '#4CAF50' : '#f44336',
                      fontWeight: 'bold'
                    }}>
                      {doctor.available ? 'Available' : 'Unavailable'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(idx)}>
                        Edit
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Remove">
                      <IconButton size="small" color="error" onClick={() => handleRemove(idx)}>
                        Remove
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell>
                  <TextField
                    name="name"
                    value={doctorForm.name}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                    placeholder="Doctor Name"
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    name="specialization"
                    value={doctorForm.specialization}
                    onChange={handleChange}
                    size="small"
                    fullWidth
                  >
                    {Object.values(Specializations).map((spec) => (
                      <MenuItem key={spec} value={spec}>
                        {spec}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={doctorForm.available}
                        onChange={handleChange}
                        name="available"
                        size="small"
                      />
                    }
                    label={doctorForm.available ? 'Available' : 'Unavailable'}
                />
              </TableCell>
              <TableCell>
                  {loading ? (
                    <CircularProgress size={24} />
                  ) : editIdx === null ? (
                    <Button size="small" onClick={handleAdd} variant="contained" color="primary">
                    Add
                  </Button>
                ) : (
                    <Button size="small" onClick={handleUpdate} variant="contained" color="primary">
                    Update
                  </Button>
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      </CardContent>
    </Card>
  );
}

function HospitalInfoForm({ hospital, onUpdate, onClose }) {
  const [form, setForm] = useState({
    hotline: hospital?.hotline || '',
    website: hospital?.website || '',
    description: hospital?.description || '',
    available: hospital?.available ?? true,
    emergencyServices: hospital?.emergencyServices ?? true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onUpdate({
        ...form,
        // Include all required fields from current hospital state
        name: hospital.name,
        type: hospital.type,
        contact: hospital.phone,
        email: hospital.email,
        address: `${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state}`,
        position: hospital.position,
        beds: hospital.beds,
        doctors: hospital.doctors
      });
      onClose();
    } catch (error) {
      console.error('Error updating hospital info:', error);
      setError(error.response?.data?.error || 'Error updating hospital information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ mt: 2 }}>
      <CardContent>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <Typography variant="h6">
            Update Hospital Information
          </Typography>
          <IconButton onClick={onClose} size="small">
            <FaTimes />
          </IconButton>
    </div>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Emergency Hotline"
                name="hotline"
                value={form.hotline}
                onChange={handleChange}
                placeholder="Enter emergency hotline number"
                inputProps={{
                  pattern: "^\\d{10}$",
                  title: "Enter a valid Nepali phone number (10 digits)"
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={form.description}
                onChange={handleChange}
                multiline
                rows={4}
                placeholder="Enter hospital description"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.available}
                    onChange={handleChange}
                    name="available"
                  />
                }
                label="Hospital Open"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.emergencyServices}
                    onChange={handleChange}
                    name="emergencyServices"
                  />
                }
                label="Emergency Services Available"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : 'Update Information'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}

function Profile({ hospital, onUpdate }) {
  const [form, setForm] = useState({
    hospitalInfo: {
      name: hospital?.name || '',
      email: hospital?.email || '',
      phone: hospital?.phone || '',
      address: {
        street: hospital?.address?.street || '',
        city: hospital?.address?.city || '',
        state: hospital?.address?.state || ''
      }
    },
    userInfo: {
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('hospital'); // 'hospital' or 'user'

  useEffect(() => {
    // Get user data from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        setForm(prev => ({
          ...prev,
          userInfo: {
            ...prev.userInfo,
            name: decodedToken.name || '',
            email: decodedToken.email || ''
          }
        }));
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const handleChange = (section, e) => {
    const { name, value } = e.target;
    if (section === 'hospitalInfo') {
      if (name.includes('address.')) {
        const addressField = name.split('.')[1];
        setForm(prev => ({
          ...prev,
          hospitalInfo: {
            ...prev.hospitalInfo,
            address: {
              ...prev.hospitalInfo.address,
              [addressField]: value
            }
          }
        }));
      } else {
        setForm(prev => ({
          ...prev,
          hospitalInfo: {
            ...prev.hospitalInfo,
            [name]: value
          }
        }));
      }
    } else {
      setForm(prev => ({
        ...prev,
        userInfo: {
          ...prev.userInfo,
          [name]: value
        }
      }));
    }
  };

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await onUpdate({
        ...form.hospitalInfo,
        address: `${form.hospitalInfo.address.street}, ${form.hospitalInfo.address.city}, ${form.hospitalInfo.address.state}`
      });
      setSuccess('Hospital information updated successfully');
    } catch (error) {
      setError(error.response?.data?.error || 'Error updating hospital information');
    } finally {
      setLoading(false);
    }
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match if updating password
    if (form.userInfo.newPassword) {
      if (form.userInfo.newPassword !== form.userInfo.confirmPassword) {
        setError('New passwords do not match');
        setLoading(false);
        return;
      }
      if (!form.userInfo.currentPassword) {
        setError('Current password is required to update password');
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_V1_URL}/users/profile`,
        {
          name: form.userInfo.name,
          email: form.userInfo.email,
          currentPassword: form.userInfo.currentPassword,
          newPassword: form.userInfo.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('User information updated successfully');
        // Clear password fields
        setForm(prev => ({
          ...prev,
          userInfo: {
            ...prev.userInfo,
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        }));
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error updating user information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            <Tab label="Hospital Profile" value="hospital" />
            <Tab label="User Account" value="user" />
          </Tabs>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {activeTab === 'hospital' ? (
          <form onSubmit={handleHospitalSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Hospital Name"
                  name="name"
                  value={form.hospitalInfo.name}
                  onChange={(e) => handleChange('hospitalInfo', e)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={form.hospitalInfo.email}
                  onChange={(e) => handleChange('hospitalInfo', e)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={form.hospitalInfo.phone}
                  onChange={(e) => handleChange('hospitalInfo', e)}
                  required
                  inputProps={{
                    pattern: "^\\d{10}$",
                    title: "Enter a valid Nepali phone number (10 digits)"
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  name="address.street"
                  value={form.hospitalInfo.address.street}
                  onChange={(e) => handleChange('hospitalInfo', e)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="address.city"
                  value={form.hospitalInfo.address.city}
                  onChange={(e) => handleChange('hospitalInfo', e)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="address.state"
                  value={form.hospitalInfo.address.state}
                  onChange={(e) => handleChange('hospitalInfo', e)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Update Hospital Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        ) : (
          <form onSubmit={handleUserSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={form.userInfo.name}
                  onChange={(e) => handleChange('userInfo', e)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={form.userInfo.email}
                  onChange={(e) => handleChange('userInfo', e)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={form.userInfo.currentPassword}
                  onChange={(e) => handleChange('userInfo', e)}
                  helperText="Required to update password"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={form.userInfo.newPassword}
                  onChange={(e) => handleChange('userInfo', e)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={form.userInfo.confirmPassword}
                  onChange={(e) => handleChange('userInfo', e)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : 'Update User Account'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

const DashboardHospital = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false); // New state for logout dialog
  const [hotline, setHotline] = useState("");
  const [editingHotline, setEditingHotline] = useState(false);
  const [beds, setBeds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    fetchHospital();
  }, []);

  const fetchHospital = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setAlert({ 
          open: true, 
          message: "No authentication token found. Please login again.", 
          severity: "error" 
        });
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_V1_URL}/hospitals/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.data || !response.data.success) {
        throw new Error("No data received from server");
      }

      const hospitalData = response.data.data;
      setHospital(hospitalData);
      setHotline(hospitalData.hotline || "");
      setBeds(hospitalData.beds || []);
      setDoctors(hospitalData.doctors || []);
    } catch (error) {
      console.error("Error fetching hospital:", error);
      setAlert({ 
        open: true, 
        message: error.response?.data?.message || "Error fetching hospital info. Please try again.", 
        severity: "error" 
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openLogoutDialog = () => {
    setLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setLogoutDialogOpen(false);
  };

  const handleHotlineSave = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_V1_URL}/hospitals/profile`, { hotline }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingHotline(false);
      setAlert({ open: true, message: "Hotline updated successfully", severity: "success" });
      fetchHospital();
    } catch (error) {
      setAlert({ 
        open: true, 
        message: error.response?.data?.message || "Error updating hotline", 
        severity: "error" 
      });
    }
  };

  const handleBedSave = async (updatedBeds) => {
    try {
      const token = localStorage.getItem("token");
      // Format beds data according to the model
      const formattedBeds = updatedBeds.map(bed => ({
        type: bed.type,
        total: parseInt(bed.total),
        available: parseInt(bed.available)
      }));

      // Include all required fields from current hospital state
      const updateData = {
        name: hospital.name,
        type: hospital.type,
        contact: hospital.phone,
        hotline: hospital.hotline,
        email: hospital.email,
        address: `${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state}`,
        position: hospital.position,
        available: hospital.available,
        emergencyServices: hospital.emergencyServices,
        beds: formattedBeds,
        doctors: hospital.doctors // Keep existing doctors
      };

      await axios.put(`${API_V1_URL}/hospitals/profile`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ open: true, message: "Bed information updated successfully", severity: "success" });
      fetchHospital();
    } catch (error) {
      console.error('Error updating beds:', error.response?.data);
      setAlert({ 
        open: true, 
        message: error.response?.data?.errors?.map(e => e.msg).join(', ') || "Error updating beds", 
        severity: "error" 
      });
    }
  };

  const handleHospitalUpdate = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      console.log('Updating hospital with data:', formData);
      
      const response = await axios.put(
        `${API_V1_URL}/hospitals/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setAlert({ 
          open: true, 
          message: "Hospital information updated successfully", 
          severity: "success" 
        });
        setShowUpdateForm(false);
        fetchHospital(); // Refresh hospital data
      } else {
        throw new Error(response.data.error || 'Failed to update hospital information');
      }
    } catch (error) {
      console.error('Error updating hospital:', error);
      setAlert({ 
        open: true, 
        message: error.response?.data?.error || "Error updating hospital information", 
        severity: "error" 
      });
    }
  };

  const handleDoctorSave = async (updatedDoctors) => {
    try {
      const token = localStorage.getItem("token");
      // Format doctors data according to the model
      const formattedDoctors = updatedDoctors.map(doctor => ({
        name: doctor.name,
        specialization: doctor.specialization,
        available: doctor.available
      }));

      // Include all required fields from current hospital state
      const updateData = {
        name: hospital.name,
        type: hospital.type,
        contact: hospital.phone,
        hotline: hospital.hotline,
        email: hospital.email,
        address: `${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state}`,
        position: hospital.position,
        available: hospital.available,
        emergencyServices: hospital.emergencyServices,
        beds: hospital.beds, // Keep existing beds
        doctors: formattedDoctors
      };

      await axios.put(`${API_V1_URL}/hospitals/profile`, 
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlert({ open: true, message: "Doctor information updated successfully", severity: "success" });
      fetchHospital();
    } catch (error) {
      console.error('Error updating doctors:', error.response?.data);
      setAlert({ 
        open: true, 
        message: error.response?.data?.errors?.map(e => e.msg).join(', ') || "Error updating doctors", 
        severity: "error" 
      });
    }
  };

  const handleProfileUpdate = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_V1_URL}/hospitals/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ open: true, message: "Profile updated successfully", severity: "success" });
      fetchHospital();
    } catch (error) {
      setAlert({ 
        open: true, 
        message: error.response?.data?.message || "Error updating profile", 
        severity: "error" 
      });
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <CircularProgress />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading hospital information...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <FaHospital size={24} />
          <h2>Hospital Panel</h2>
        </div>
        <div className="sidebar-menu">
          <button 
            className={`sidebar-menu-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <FaHospital style={{ marginRight: 8 }} />
            Overview
          </button>
          <button 
            className={`sidebar-menu-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveSection('profile')}
          >
            <FaUserMd style={{ marginRight: 8 }} />
            Profile
          </button>
        </div>
        <div className="sidebar-footer">
          <button className="logout-button" onClick={openLogoutDialog}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </div>
      <div className="main-content">
        <div className="dashboard-content">
          <Typography variant="h4" gutterBottom>
            {activeSection === 'overview' ? 'Hospital Overview' : 'Hospital Profile'}
          </Typography>
          
          {!hospital ? (
            <Card>
              <CardContent>
                <Typography variant="h6" color="error" gutterBottom>
                  No Hospital Data Available
                </Typography>
                <Typography variant="body1">
                  Please make sure you have registered your hospital information.
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => navigate("/add-hospital")}
                  sx={{ mt: 2 }}
                >
                  Add Hospital Information
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {activeSection === 'overview' ? (
                <>
                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <FaHospital style={{ marginRight: 8 }} />
                          Hospital Information
                        </Typography>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Name:</span>
                            <span className="value">{hospital?.name || 'N/A'}</span>
                          </div>
                          <div className="info-item">
                            <span className="label">Type:</span>
                            <span className="value">{hospital?.type || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Address:</span>
                            <span className="value">
                              {hospital?.address ? 
                                `${hospital.address.street}, ${hospital.address.city}, ${hospital.address.state}` : 
                                'N/A'}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="label">Phone:</span>
                            <span className="value">{hospital?.phone || 'N/A'}</span>
              </div>
              <div className="info-item">
                            <span className="label">Email:</span>
                            <span className="value">{hospital?.email || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Status:</span>
                            <span className="value" style={{ 
                              color: hospital?.available ? '#4CAF50' : '#f44336',
                              fontWeight: 'bold'
                            }}>
                              {hospital?.available ? "Open" : "Closed"}
                            </span>
              </div>
                          <div className="info-item">
                            <span className="label">Emergency Services:</span>
                            <span className="value" style={{ 
                              color: hospital?.emergencyServices ? '#4CAF50' : '#f44336',
                              fontWeight: 'bold'
                            }}>
                              {hospital?.emergencyServices ? "Available" : "Unavailable"}
                            </span>
            </div>
                          <div className="info-item">
                            <span className="label">Location:</span>
                            <span className="value">
                              {hospital?.position && (hospital.position.lat !== 0 || hospital.position.lng !== 0) ? (
                                <>
                                  Lat: {hospital.position.lat.toFixed(4)}, Lng: {hospital.position.lng.toFixed(4)}
              </>
            ) : (
                                'Location not set'
                              )}
                            </span>
                          </div>
                          <div className="info-item">
                            <span className="label">Last Updated:</span>
                            <span className="value">
                              {hospital?.updatedAt ? new Date(hospital.updatedAt).toLocaleString() : 'N/A'}
                            </span>
                          </div>
          </div>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <FaPhone style={{ marginRight: 8 }} />
                          Emergency Hotline
                        </Typography>
                        {editingHotline ? (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <TextField 
                              value={hotline} 
                              onChange={e => setHotline(e.target.value)}
                              fullWidth
                              placeholder="Enter emergency hotline number"
                              inputProps={{
                                pattern: "^\\d{10}$",
                                title: "Enter a valid Nepali phone number (10 digits)"
                              }}
                            />
                            <Button 
                              onClick={handleHotlineSave}
                              variant="contained"
                              color="primary"
                            >
                              Save
                            </Button>
                            <Button 
                              onClick={() => setEditingHotline(false)}
                              variant="outlined"
                            >
                              Cancel
                            </Button>
          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <Typography variant="body1" style={{ fontWeight: 600 }}>
                              {hotline || 'No hotline set'}
                            </Typography>
                            <Button 
                              onClick={() => setEditingHotline(true)}
                              variant="outlined"
                              size="small"
                            >
                              Edit
                            </Button>
          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card sx={{ mt: 2 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          <FaUserMd style={{ marginRight: 8 }} />
                          Quick Actions
                        </Typography>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => setShowUpdateForm(true)}
                          >
                            Update Hospital Info
                          </Button>
                          {hospital.position && (
                            <Button 
                              variant="outlined" 
                              color="primary"
                              onClick={() => window.open(`https://www.google.com/maps?q=${hospital.position.lat},${hospital.position.lng}`, '_blank')}
                            >
                              View on Map
                            </Button>
                          )}
          </div>
                      </CardContent>
                    </Card>
                  </Grid>

                  {showUpdateForm && (
                    <Grid sx={{ width: '100%' }}>
                      <HospitalInfoForm 
                        hospital={hospital}
                        onUpdate={handleHospitalUpdate}
                        onClose={() => setShowUpdateForm(false)}
                      />
                    </Grid>
                  )}

                  <Grid sx={{ width: '100%' }}>
                    <BedManagement 
                      beds={beds} 
                      setBeds={setBeds} 
                      onSave={handleBedSave} 
                    />
                  </Grid>

                  <Grid sx={{ width: '100%' }}>
                    <DoctorManagement 
                      doctors={doctors}
                      setDoctors={setDoctors}
                      onSave={handleDoctorSave}
                    />
                  </Grid>
                </>
              ) : (
                <Grid sx={{ width: '100%' }}>
                  <Profile 
                    hospital={hospital}
                    onUpdate={handleProfileUpdate}
                  />
                </Grid>
              )}
            </Grid>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={closeLogoutDialog}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogoutDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error">
            Logout
          </Button>
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

export default DashboardHospital;