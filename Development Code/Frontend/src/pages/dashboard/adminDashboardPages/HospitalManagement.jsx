import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHospital, FaSearch, FaBed, FaUserMd, FaEdit, FaTrash, FaCheckCircle, FaExclamationCircle, FaArrowLeft } from 'react-icons/fa';
import { API_V1_URL } from '../../../config/apiConfig';
import { toast } from 'react-toastify';
import { 
  TextField, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  MenuItem,
  CircularProgress 
} from '@mui/material';

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_V1_URL}/hospitals`);
      setHospitals(response.data.data);
    } catch (err) {
      toast.error("Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHospital = async (updatedData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_V1_URL}/hospitals/${selectedHospital._id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Hospital information synchronized");
      setIsEditing(false);
      fetchHospitals();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedHospital && isEditing) {
    return <EditHospitalNode hospital={selectedHospital} onBack={() => setIsEditing(false)} onSave={handleUpdateHospital} />;
  }

  return (
    <div className="hospital-mgmt-container" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ color: '#0a192f', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaHospital /> System-Wide Hospital Registry
          </h2>
          <p style={{ color: '#64748b' }}>Manage inventory and availability for all registered medical centers.</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="Search Hospital Name..." 
            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}><CircularProgress /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredHospitals.map(h => (
            <div key={h._id} className="hospital-admin-card" style={{ background: 'white', borderRadius: '15px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', color: '#0a192f' }}>
                  <FaHospital size={24} />
                </div>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: '700',
                  background: h.available ? '#f0fff4' : '#fff5f5',
                  color: h.available ? '#166534' : '#991b1b'
                }}>
                  {h.available ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#0a192f' }}>{h.name}</h3>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#64748b' }}>{h.type} • {h.address?.city || 'Location Pending'}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0a192f' }}>{h.beds?.reduce((a, b) => a + (b.available || 0), 0) || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Beds Avail</div>
                </div>
                <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0a192f' }}>{h.doctors?.length || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Doctors</div>
                </div>
              </div>

              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<FaEdit />}
                onClick={() => { setSelectedHospital(h); setIsEditing(true); }}
                style={{ background: '#0a192f', textTransform: 'none', borderRadius: '8px' }}
              >
                Manage Inventory
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* Internal Component for Editing a Specific Hospital */
const EditHospitalNode = ({ hospital, onBack, onSave }) => {
  const [formData, setFormData] = useState({ ...hospital });
  const [activeTab, setActiveTab] = useState('beds');

  return (
    <div style={{ padding: '20px' }}>
      <Button startIcon={<FaArrowLeft />} onClick={onBack} style={{ marginBottom: '1rem' }}>Back to Registry</Button>
      
      <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0, color: '#0a192f' }}>Manage: {hospital.name}</h2>
            <p style={{ color: '#64748b' }}>Administrative Override Mode</p>
          </div>
          <Button variant="contained" color="success" onClick={() => onSave(formData)}>Save System Changes</Button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <Button variant={activeTab === 'beds' ? 'contained' : 'outlined'} onClick={() => setActiveTab('beds')}>Beds Allocation</Button>
          <Button variant={activeTab === 'doctors' ? 'contained' : 'outlined'} onClick={() => setActiveTab('doctors')}>Doctors Registry</Button>
          <Button variant={activeTab === 'info' ? 'contained' : 'outlined'} onClick={() => setActiveTab('info')}>General Info</Button>
        </div>

        {activeTab === 'beds' && (
          <div>
            <h3>Current Bed Status</h3>
            {formData.beds?.map((bed, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '10px', background: '#f8fafc', padding: '15px', borderRadius: '12px' }}>
                <span style={{ flex: 1, fontWeight: '700' }}>{bed.type}</span>
                <TextField 
                  label="Total" 
                  type="number" 
                  size="small" 
                  value={bed.total} 
                  onChange={(e) => {
                    const newBeds = [...formData.beds];
                    newBeds[i].total = parseInt(e.target.value);
                    setFormData({...formData, beds: newBeds});
                  }}
                />
                <TextField 
                  label="Available" 
                  type="number" 
                  size="small" 
                  value={bed.available} 
                  onChange={(e) => {
                    const newBeds = [...formData.beds];
                    newBeds[i].available = parseInt(e.target.value);
                    setFormData({...formData, beds: newBeds});
                  }}
                />
              </div>
            ))}
            <Button onClick={() => setFormData({...formData, beds: [...(formData.beds || []), { type: 'General', total: 0, available: 0 }]})}>+ Add Ward Type</Button>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div>
            <h3>Medical Staff</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {formData.doctors?.map((doc, i) => (
                <div key={i} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <TextField fullWidth label="Doctor Name" size="small" value={doc.name} style={{ marginBottom: '10px' }} onChange={(e) => {
                    const newDocs = [...formData.doctors];
                    newDocs[i].name = e.target.value;
                    setFormData({...formData, doctors: newDocs});
                  }} />
                  <TextField fullWidth label="Specialization" size="small" value={doc.specialization} onChange={(e) => {
                    const newDocs = [...formData.doctors];
                    newDocs[i].specialization = e.target.value;
                    setFormData({...formData, doctors: newDocs});
                  }} />
                  <Button color="error" size="small" onClick={() => setFormData({...formData, doctors: formData.doctors.filter((_, idx) => idx !== i)})}>Remove Physician</Button>
                </div>
              ))}
            </div>
            <Button style={{ marginTop: '1rem' }} onClick={() => setFormData({...formData, doctors: [...(formData.doctors || []), { name: '', specialization: 'General', available: true }]})}>+ Register New Physician</Button>
          </div>
        )}

        {activeTab === 'info' && (
          <div style={{ maxWidth: '600px' }}>
            <TextField fullWidth label="Official Website" value={formData.website} margin="normal" onChange={(e) => setFormData({...formData, website: e.target.value})} />
            <TextField fullWidth label="Emergency Hotline" value={formData.hotline} margin="normal" onChange={(e) => setFormData({...formData, hotline: e.target.value})} />
            <div style={{ marginTop: '20px' }}>
              <label style={{ marginRight: '20px' }}>Status:</label>
              <Button variant={formData.available ? "contained" : "outlined"} color="success" onClick={() => setFormData({...formData, available: true})}>Available</Button>
              <Button variant={!formData.available ? "contained" : "outlined"} color="error" style={{ marginLeft: '10px' }} onClick={() => setFormData({...formData, available: false})}>Closed</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalManagement;
