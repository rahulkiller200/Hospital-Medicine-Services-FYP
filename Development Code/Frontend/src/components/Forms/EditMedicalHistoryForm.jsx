import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaFileMedical, FaUserMd, FaPhoneAlt } from 'react-icons/fa';
import '../../pages/Profile.css';

const EditMedicalHistoryForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'male',
    bloodGroup: 'A+',
    height: '',
    weight: '',
    address: '',
    phoneNumber: '',
    emergencyContact: { name: '', relationship: '', phoneNumber: '' },
    allergies: '',
    currentMedications: '',
    chronicConditions: '',
    pastSurgeries: '',
    familyHistory: '',
    lifestyle: { smoking: 'never', alcohol: 'never', exercise: 'never' }
  });

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const response = await axios.get('http://localhost:3001/api/v1/patients/history');
        if (response.data.success && response.data.data) {
          const dt = response.data.data;
          setFormData(prev => ({
            ...prev,
            ...dt,
            dateOfBirth: dt.dateOfBirth ? new Date(dt.dateOfBirth).toISOString().split('T')[0] : '',
            allergies: dt.allergies ? dt.allergies.join(', ') : '',
            currentMedications: dt.currentMedications ? dt.currentMedications.join(', ') : '',
            chronicConditions: dt.chronicConditions ? dt.chronicConditions.join(', ') : '',
            pastSurgeries: dt.pastSurgeries ? dt.pastSurgeries.join(', ') : '',
            familyHistory: dt.familyHistory ? dt.familyHistory.join(', ') : '',
          }));
        }
      } catch (err) {
        console.error('No history found or error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistoryData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("emergency_")) {
      const field = name.split("_")[1];
      setFormData(prev => ({
        ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value }
      }));
    } else if (name.startsWith("lifestyle_")) {
      const field = name.split("_")[1];
      setFormData(prev => ({
        ...prev, lifestyle: { ...prev.lifestyle, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        allergies: formData.allergies.split(',').map(s => s.trim()).filter(Boolean),
        currentMedications: formData.currentMedications.split(',').map(s => s.trim()).filter(Boolean),
        chronicConditions: formData.chronicConditions.split(',').map(s => s.trim()).filter(Boolean),
        pastSurgeries: formData.pastSurgeries.split(',').map(s => s.trim()).filter(Boolean),
        familyHistory: formData.familyHistory.split(',').map(s => s.trim()).filter(Boolean),
      };

      const response = await axios.post('http://localhost:3001/api/v1/patients', payload);
      if (response.data.success) {
        setSuccess('Medical History updated successfully!');
        setTimeout(() => navigate('/profile'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update medical history.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="update-profile-container">
      <div className="update-profile-header">
        <h2>Update Medical History</h2>
        <p>Ensure your emergency details are correct</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3><FaUserMd /> Core Details</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3><FaHeartbeat /> Vitals & Baseline</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Blood Group</label>
              <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} required>
                <option value="A+">A+</option><option value="A-">A-</option>
                <option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option>
                <option value="O+">O+</option><option value="O-">O-</option>
              </select>
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3><FaPhoneAlt /> Contact & Emergency</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Your Phone</label>
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Your Address</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Emergency Contact Name</label>
              <input type="text" name="emergency_name" value={formData.emergencyContact.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Emergency Relationship</label>
              <input type="text" name="emergency_relationship" value={formData.emergencyContact.relationship} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Emergency Phone</label>
              <input type="text" name="emergency_phoneNumber" value={formData.emergencyContact.phoneNumber} onChange={handleChange} required />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3><FaFileMedical /> Conditions (Comma separated)</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Allergies</label>
              <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Current Medications</label>
              <input type="text" name="currentMedications" value={formData.currentMedications} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Chronic Conditions</label>
              <input type="text" name="chronicConditions" value={formData.chronicConditions} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn secondary" onClick={() => navigate('/profile')} disabled={loading}>Cancel</button>
          <button type="submit" className="btn primary" disabled={loading}>{loading ? 'Saving...' : 'Save Medical History'}</button>
        </div>
      </form>
    </div>
  );
};
export default EditMedicalHistoryForm;
