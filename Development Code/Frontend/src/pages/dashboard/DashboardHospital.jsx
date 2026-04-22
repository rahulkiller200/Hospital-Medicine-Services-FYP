import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_V1_URL } from "../../config/apiConfig";
import "./HospitalDashboard.css";
import { 
  FaSignOutAlt, 
  FaHospital, 
  FaPhone, 
  FaBed, 
  FaUserMd, 
  FaTimes, 
  FaStethoscope, 
  FaRegClock, 
  FaMapMarkerAlt, 
  FaGlobe,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft
} from "react-icons/fa";
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
  IconButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Switch
} from "@mui/material";

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

const DashboardHospital = () => {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [hotline, setHotline] = useState("");
  const [beds, setBeds] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const [allHospitals, setAllHospitals] = useState([]);

  useEffect(() => {
    fetchHospital();
    fetchAllHospitals();
  }, []);

  const fetchAllHospitals = async () => {
    try {
      const res = await axios.get(`${API_V1_URL}/hospitals`);
      setAllHospitals(res.data.data);
    } catch (e) { console.error("Network fetch failed"); }
  };

  const fetchHospital = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${API_V1_URL}/hospitals/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const hospitalData = response.data.data;
      setHospital(hospitalData);
      setHotline(hospitalData.hotline || "");
      setBeds(hospitalData.beds || []);
      setDoctors(hospitalData.doctors || []);
    } catch (error) {
      console.error("Error fetching hospital:", error);
      setAlert({ 
        open: true, 
        message: "Error connecting to hospital node. Please try again.", 
        severity: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleSaveBeds = async (updatedBeds) => {
    try {
      const token = localStorage.getItem("token");
      const updateData = { ...hospital, beds: updatedBeds };
      await axios.put(`${API_V1_URL}/hospitals/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ open: true, message: "Beds updated successfully", severity: "success" });
      fetchHospital();
    } catch (error) {
      setAlert({ open: true, message: "Update failed", severity: "error" });
    }
  };

  const handleSaveDoctors = async (updatedDoctors) => {
    try {
      const token = localStorage.getItem("token");
      const updateData = { ...hospital, doctors: updatedDoctors };
      await axios.put(`${API_V1_URL}/hospitals/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ open: true, message: "Doctor registry updated", severity: "success" });
      fetchHospital();
    } catch (error) {
      setAlert({ open: true, message: "Update failed", severity: "error" });
    }
  };

  const [managingHospital, setManagingHospital] = useState(null);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a192f', color: 'white' }}>
        <CircularProgress size={60} sx={{ color: '#ff6b35', mb: 2 }} />
        <h3>Accessing Secure Hospital Node...</h3>
      </div>
    );
  }

  const totalBedsCount = beds.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const availableBedsCount = beds.reduce((acc, curr) => acc + (curr.available || 0), 0);

  const renderStats = () => {
    if (activeSection === 'beds') {
      const globalTotal = allHospitals.reduce((acc, h) => acc + (h.beds?.reduce((a, b) => a + (b.total || 0), 0) || 0), 0);
      const globalAvail = allHospitals.reduce((acc, h) => acc + (h.beds?.reduce((a, b) => a + (b.available || 0), 0) || 0), 0);
      
      const total = managingHospital ? (managingHospital.beds?.reduce((a, b) => a + (b.total || 0), 0) || 0) : globalTotal;
      const avail = managingHospital ? (managingHospital.beds?.reduce((a, b) => a + (b.available || 0), 0) || 0) : globalAvail;
      const label = managingHospital ? managingHospital.name : 'Global Network';

      return (
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#ebf8ff', color: '#2b6cb0' }}><FaBed /></div>
          <div className="stat-info">
            <h3>{avail} / {total}</h3>
            <p>Available Beds ({label})</p>
          </div>
        </div>
      );
    }
    if (activeSection === 'doctors') {
      const globalDocs = allHospitals.reduce((acc, h) => acc + (h.doctors?.length || 0), 0);
      const displayCount = managingHospital ? (managingHospital.doctors?.length || 0) : globalDocs;
      const label = managingHospital ? managingHospital.name : 'Global Network';

      return (
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#f0fff4', color: '#2f855a' }}><FaUserMd /></div>
          <div className="stat-info">
            <h3>{displayCount}</h3>
            <p>Registered Doctors ({label})</p>
          </div>
        </div>
      );
    }
    return (
      <>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#ebf8ff', color: '#2b6cb0' }}><FaBed /></div>
          <div className="stat-info">
            <h3>{allHospitals.reduce((acc, h) => acc + (h.beds?.reduce((a, b) => a + (b.available || 0), 0) || 0), 0)}</h3>
            <p>Total Network Beds</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: '#f0fff4', color: '#2f855a' }}><FaUserMd /></div>
          <div className="stat-info">
            <h3>{allHospitals.reduce((acc, h) => acc + (h.doctors?.length || 0), 0)}</h3>
            <p>Total Network Doctors</p>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="hospital-dashboard-root">
      {/* Sidebar */}
      <aside className="hospital-sidebar">
        <div className="sidebar-brand">
          <FaHospital size={32} style={{ color: '#ff6b35' }} />
          <div>
            <h2>HMS MASTER</h2>
            <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>HOSPITAL PANEL V2.1</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button className={`nav-item ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => {setActiveSection('overview'); setManagingHospital(null);}}>
            <FaHospital /> Overview
          </button>
          <button className={`nav-item ${activeSection === 'beds' ? 'active' : ''}`} onClick={() => {setActiveSection('beds'); setManagingHospital(null);}}>
            <FaBed /> Bed Management
          </button>
          <button className={`nav-item ${activeSection === 'doctors' ? 'active' : ''}`} onClick={() => {setActiveSection('doctors'); setManagingHospital(null);}}>
            <FaStethoscope /> Doctors Registry
          </button>
          <button className={`nav-item ${activeSection === 'network' ? 'active' : ''}`} onClick={() => {setActiveSection('network'); setManagingHospital(null);}}>
            <FaGlobe /> Network Management
          </button>
          <button className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`} onClick={() => {setActiveSection('profile'); setManagingHospital(null);}}>
            <FaUserMd /> Hospital Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => setLogoutDialogOpen(true)}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="hospital-main">
        <header className="hospital-header">
          <div className="welcome-text">
            <h1>{managingHospital ? managingHospital.name : (hospital?.name || "Unregistered Hospital")}</h1>
            <p>Node Authorization: <span style={{ color: '#059669', fontWeight: 600 }}>Active</span> • Last Sync: {new Date().toLocaleTimeString()}</p>
          </div>
          <div className={`status-indicator ${hospital?.available ? 'status-online' : 'status-offline'}`}>
            {hospital?.available ? <FaCheckCircle /> : <FaExclamationCircle />}
            {hospital?.available ? 'SYSTEM ONLINE' : 'SYSTEM OFFLINE'}
          </div>
        </header>

        {/* Stats Grid */}
        <section className="hospital-stats-grid">
          {renderStats()}
          <div className="stat-card">
            <div className="stat-icon-box" style={{ background: '#fff5f5', color: '#e53e3e' }}>
              <FaGlobe />
            </div>
            <div className="stat-info">
              <h3>{managingHospital ? 'REMOTE' : 'LOCAL'}</h3>
              <p>View Mode</p>
            </div>
          </div>
        </section>

        {/* Main Panels */}
        <div className="glass-panel">
          {activeSection === 'overview' && <OverviewSection hospital={hospital} hotline={hotline} />}
          {activeSection === 'beds' && <BedSection setAlert={setAlert} setManagingHospital={setManagingHospital} hospitals={allHospitals} fetchHospitals={fetchAllHospitals} />}
          {activeSection === 'doctors' && <DoctorSection setAlert={setAlert} setManagingHospital={setManagingHospital} hospitals={allHospitals} fetchHospitals={fetchAllHospitals} />}
          {activeSection === 'network' && <NetworkManagementSection setAlert={setAlert} />}
          {activeSection === 'profile' && <ProfileSection hospital={hospital} fetchHospital={fetchHospital} setAlert={setAlert} />}
        </div>
      </main>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Confirm System Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to terminate the current session and logout from the Hospital Node?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLogout} variant="contained" color="error">Confirm Logout</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.severity} sx={{ width: '100%' }}>{alert.message}</Alert>
      </Snackbar>
    </div>
  );
};

/* Sub-Sections for cleaner code */

const OverviewSection = ({ hospital, hotline }) => (
  <div className="overview-container">
    <h3 className="section-title"><FaHospital /> General Information</h3>
    <div className="hospital-info-display" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
      <div className="info-block">
        <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Physical Address</label>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a192f' }}>
          <FaMapMarkerAlt style={{ color: '#ff6b35', marginRight: 8 }} />
          {hospital?.address ? `${hospital.address.street}, ${hospital.address.city}` : 'Update Required'}
        </p>
      </div>
      <div className="info-block">
        <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Contact Hotline</label>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a192f' }}>
          <FaPhone style={{ color: '#ff6b35', marginRight: 8 }} />
          {hotline || 'Not Set'}
        </p>
      </div>
      <div className="info-block">
        <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Official Website</label>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0a192f' }}>
          <FaGlobe style={{ color: '#ff6b35', marginRight: 8 }} />
          {hospital?.website || 'N/A'}
        </p>
      </div>
    </div>
  </div>
);

const BedSection = ({ setAlert, setManagingHospital, hospitals, fetchHospitals }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const loading = !hospitals.length;

  const handleSelect = (h) => {
    setSelectedHospital(h);
    setManagingHospital(h);
  };

  const handleSaveBeds = async (updatedBeds) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_V1_URL}/hospitals/${selectedHospital._id}`, { beds: updatedBeds }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ open: true, message: "Beds Updated Successfully", severity: "success" });
      fetchHospitals();
      const updated = { ...selectedHospital, beds: updatedBeds };
      setSelectedHospital(updated);
      setManagingHospital(updated);
    } catch (e) { setAlert({ open: true, message: "Update Failed", severity: "error" }); }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '40px'}}><CircularProgress /></div>;

  if (selectedHospital) {
    return (
      <div>
        <Button startIcon={<FaArrowLeft />} onClick={() => {setSelectedHospital(null); setManagingHospital(null);}}>Back to Hospital List</Button>
        <div style={{ marginTop: '20px' }}>
          <h3 className="section-title">Manage Beds: {selectedHospital.name}</h3>
          <BedAllocationForm beds={selectedHospital.beds || []} onSave={handleSaveBeds} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="section-title">Select Hospital to Manage Beds</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {hospitals.map(h => (
          <div key={h._id} className="stat-card" style={{ cursor: 'pointer', border: '1px solid #edf2f7', display: 'flex', gap: '15px' }} onClick={() => handleSelect(h)}>
            <div className="stat-icon-box" style={{ background: '#ebf8ff', color: '#2b6cb0', minWidth: '50px' }}><FaHospital /></div>
            <div className="stat-info">
              <h4 style={{ margin: 0 }}>{h.name}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>{h.beds?.reduce((a,b)=>a+(b.available||0),0) || 0} Beds Available</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BedAllocationForm = ({ beds, onSave }) => {
  const [currentBeds, setCurrentBeds] = useState(beds);

  return (
    <div className="glass-panel" style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h4 style={{ margin: 0 }}>Current Allocation</h4>
        <Button variant="contained" size="small" style={{background: '#0a192f'}} onClick={() => setCurrentBeds([...currentBeds, { type: 'General', total: 0, available: 0 }])}>Add Ward</Button>
      </div>
      <TableContainer component={Paper} elevation={0} style={{ background: 'transparent' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ward Type</TableCell>
              <TableCell>Total Capacity</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentBeds.map((bed, i) => (
              <TableRow key={i}>
                <TableCell>
                  <TextField select size="small" value={bed.type} onChange={(e) => {
                    const next = [...currentBeds];
                    next[i].type = e.target.value;
                    setCurrentBeds(next);
                  }}>
                    {Object.values(BedTypes).map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </TextField>
                </TableCell>
                <TableCell>
                  <TextField type="number" size="small" value={bed.total} onChange={(e) => {
                    const next = [...currentBeds];
                    next[i].total = parseInt(e.target.value);
                    setCurrentBeds(next);
                  }} />
                </TableCell>
                <TableCell>
                  <TextField type="number" size="small" value={bed.available} onChange={(e) => {
                    const next = [...currentBeds];
                    next[i].available = parseInt(e.target.value);
                    setCurrentBeds(next);
                  }} />
                </TableCell>
                <TableCell>
                  <Button color="error" onClick={() => setCurrentBeds(currentBeds.filter((_, idx) => idx !== i))}>Remove</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button variant="contained" fullWidth style={{ marginTop: '20px', background: '#0a192f' }} onClick={() => onSave(currentBeds)}>Save All Changes</Button>
    </div>
  );
};

const DoctorSection = ({ setAlert, setManagingHospital, hospitals, fetchHospitals }) => {
  const [selectedHospital, setSelectedHospital] = useState(null);
  const loading = !hospitals.length;

  const handleSelect = (h) => {
    setSelectedHospital(h);
    setManagingHospital(h);
  };

  const handleSaveDoctors = async (updatedDocs) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_V1_URL}/hospitals/${selectedHospital._id}`, { doctors: updatedDocs }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ open: true, message: "Staff Registry Updated Successfully", severity: "success" });
      fetchHospitals();
      const updated = { ...selectedHospital, doctors: updatedDocs };
      setSelectedHospital(updated);
      setManagingHospital(updated);
    } catch (e) { setAlert({ open: true, message: "Update Failed", severity: "error" }); }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '40px'}}><CircularProgress /></div>;

  if (selectedHospital) {
    return (
      <div>
        <Button startIcon={<FaArrowLeft />} onClick={() => {setSelectedHospital(null); setManagingHospital(null);}}>Back to Hospital List</Button>
        <div style={{ marginTop: '20px' }}>
          <h3 className="section-title">Manage Staff: {selectedHospital.name}</h3>
          <DoctorRegistryForm doctors={selectedHospital.doctors || []} onSave={handleSaveDoctors} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="section-title">Select Hospital to Manage Staff</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {hospitals.map(h => (
          <div key={h._id} className="stat-card" style={{ cursor: 'pointer', border: '1px solid #edf2f7', display: 'flex', gap: '15px' }} onClick={() => handleSelect(h)}>
            <div className="stat-icon-box" style={{ background: '#f0fff4', color: '#2f855a', minWidth: '50px' }}><FaUserMd /></div>
            <div className="stat-info">
              <h4 style={{ margin: 0 }}>{h.name}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>{h.doctors?.length || 0} Registered Doctors</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DoctorRegistryForm = ({ doctors, onSave }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [currentDocs, setCurrentDocs] = useState(doctors);
  const [newDoc, setNewDoc] = useState({ name: '', specialization: 'General', available: true });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>Active Registry</h4>
        <Button variant="contained" size="small" style={{background: '#0a192f'}} onClick={() => setIsAdding(true)}>Add Physician</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {currentDocs.map((doc, i) => (
          <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h5 style={{ margin: '0 0 5px 0' }}>Dr. {doc.name}</h5>
            <p style={{ margin: '0 0 10px 0', fontSize: '0.8rem', color: '#64748b' }}>{doc.specialization}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Switch size="small" checked={doc.available} onChange={(e) => {
                const next = [...currentDocs];
                next[i].available = e.target.checked;
                setCurrentDocs(next);
              }} />
              <Button size="small" color="error" onClick={() => {
                const next = currentDocs.filter((_, idx) => idx !== i);
                setCurrentDocs(next);
              }}>Remove</Button>
            </div>
          </div>
        ))}
      </div>
      <Button variant="contained" fullWidth style={{ marginTop: '20px', background: '#0a192f' }} onClick={() => onSave(currentDocs)}>Save Registry Changes</Button>

      <Dialog open={isAdding} onClose={() => setIsAdding(false)}>
        <DialogTitle>New Doctor Registration</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Full Name" margin="dense" onChange={(e) => setNewDoc({...newDoc, name: e.target.value})} />
          <TextField select fullWidth label="Specialization" margin="dense" value={newDoc.specialization} onChange={(e) => setNewDoc({...newDoc, specialization: e.target.value})}>
            {Object.values(Specializations).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAdding(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => { setCurrentDocs([...currentDocs, newDoc]); setIsAdding(false); }}>Add to List</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

const ProfileSection = ({ hospital, fetchHospital, setAlert }) => {
  const [form, setForm] = useState({
    name: hospital?.name || '',
    hotline: hospital?.hotline || '',
    phone: hospital?.phone || '',
    website: hospital?.website || '',
    available: hospital?.available || true
  });

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_V1_URL}/hospitals/profile`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ open: true, message: "Profile Updated", severity: "success" });
      fetchHospital();
    } catch (e) { setAlert({ open: true, message: "Update Failed", severity: "error" }); }
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h3 className="section-title"><FaUserMd /> Secure Profile Update</h3>
      <div className="form-group">
        <label>Display Name</label>
        <input className="input-premium" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Public Hotline</label>
        <input className="input-premium" value={form.hotline} onChange={(e) => setForm({...form, hotline: e.target.value})} />
      </div>
      <div className="form-group">
        <label>Website URL</label>
        <input className="input-premium" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
        <Switch checked={form.available} onChange={(e) => setForm({...form, available: e.target.checked})} />
        <span style={{ fontWeight: 600 }}>System Availability (Online/Offline)</span>
      </div>
      <Button variant="contained" style={{ background: '#ff6b35' }} onClick={handleUpdate}>Update Node Configuration</Button>
    </div>
  );
};

const NetworkManagementSection = ({ setAlert }) => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchNetwork();
  }, []);

  const fetchNetwork = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_V1_URL}/hospitals`);
      setHospitals(response.data.data);
    } catch (e) {
      setAlert({ open: true, message: "Network Link Failed", severity: "error" });
    } finally { setLoading(false); }
  };

  const handleGlobalUpdate = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_V1_URL}/hospitals/${selectedHospital._id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ open: true, message: "Global Node Updated", severity: "success" });
      setIsEditing(false);
      fetchNetwork();
    } catch (e) { setAlert({ open: true, message: "Override Denied", severity: "error" }); }
  };

  if (loading) return <div style={{textAlign: 'center', padding: '40px'}}><CircularProgress /></div>;

  if (isEditing && selectedHospital) {
    return (
      <div>
        <Button startIcon={<FaArrowLeft />} onClick={() => setIsEditing(false)}>Back to Network Registry</Button>
        <div style={{ marginTop: '20px' }}>
          <h3 className="section-title">Override: {selectedHospital.name}</h3>
          <HospitalOverrideForm hospital={selectedHospital} onSave={handleGlobalUpdate} />
        </div>
      </div>
    );
  }

  return (
    <div className="network-registry">
      <h3 className="section-title"><FaGlobe /> Global Hospital Registry</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {hospitals.map(h => (
          <div key={h._id} className="stat-card" style={{ cursor: 'pointer', border: '1px solid #edf2f7', display: 'flex', gap: '15px' }} onClick={() => { setSelectedHospital(h); setIsEditing(true); }}>
            <div className="stat-icon-box" style={{ background: '#f8fafc', minWidth: '50px' }}><FaHospital /></div>
            <div className="stat-info">
              <h4 style={{ margin: 0 }}>{h.name}</h4>
              <p style={{ margin: 0, fontSize: '0.7rem' }}>{h.type} • {h.address?.city || 'Location N/A'}</p>
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-blue" style={{background: '#ebf8ff', color: '#2b6cb0', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem'}}>
                  {h.beds?.reduce((a,b)=>a+(b.available||0), 0) || 0} Beds
                </span>
                <span className={`badge`} style={{ 
                  background: h.available ? '#f0fff4' : '#fff5f5', 
                  color: h.available ? '#2f855a' : '#e53e3e',
                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem'
                }}>
                  {h.available ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HospitalOverrideForm = ({ hospital, onSave }) => {
  const [data, setData] = useState({ ...hospital });

  return (
    <div className="glass-panel" style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{marginBottom: '15px'}}>Beds Allocation Management</h4>
        {data.beds?.map((bed, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '12px', alignItems: 'center' }}>
            <span style={{minWidth: '100px', fontWeight: 600}}>{bed.type}</span>
            <TextField size="small" label="Total" type="number" value={bed.total} onChange={(e) => {
              const newBeds = [...data.beds];
              newBeds[i].total = parseInt(e.target.value);
              setData({...data, beds: newBeds});
            }} />
            <TextField size="small" label="Available" type="number" value={bed.available} onChange={(e) => {
              const newBeds = [...data.beds];
              newBeds[i].available = parseInt(e.target.value);
              setData({...data, beds: newBeds});
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button variant="contained" style={{background: '#0a192f'}} onClick={() => onSave(data)}>Apply Global Override</Button>
      </div>
    </div>
  );
};

export default DashboardHospital;