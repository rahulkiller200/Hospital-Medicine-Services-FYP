import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_V1_URL } from '../../config/apiConfig';

export default function BloodRequestForm({ isOpen, onClose }) {
  const [request, setRequest] = useState({
    name: '',
    bloodType: '',
    contact: '',
    hospitalName: '',
    urgency: 'Normal',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequest({ ...request, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const selectBloodType = (type) => {
    setRequest({ ...request, bloodType: type });
    if (errors.bloodType) {
      setErrors({ ...errors, bloodType: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!request.name) newErrors.name = 'Patient name is required';
    if (!request.bloodType) newErrors.bloodType = 'Please select a blood type';
    if (!request.contact) newErrors.contact = 'Contact number is required';
    if (!request.hospitalName) newErrors.hospitalName = 'Hospital name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.warning("Please fill all required fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      const username = localStorage.getItem('username');
      const payload = { 
        ...request, 
        username,
        message: request.hospitalName ? 
          `Hospital: ${request.hospitalName} | ${request.message}` : 
          request.message
      };

      const response = await axios.post(`${API_V1_URL}/blood-request/create`, payload);
      
      if (response.data.success) {
        toast.success('🚨 Blood request broadcasted to the network!');
        setRequest({ name: '', bloodType: '', contact: '', hospitalName: '', urgency: 'Normal', message: '' });
        onClose();
      }
    } catch (error) {
      console.error('Error submitting blood request:', error);
      toast.error('Connection failed. Could not send request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="blood-request-modal-overlay" onClick={(e) => e.target.className === 'blood-request-modal-overlay' && onClose()}>
      <div className="blood-request-modal">
        <div className="blood-modal-header">
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <i className="fas fa-times"></i>
          </button>
          <h2>
            <i className="fas fa-tint" style={{ color: '#ff4d4d' }}></i>
            Broadcast Blood Request
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '5px', fontSize: '0.9rem' }}>
            Alert nearby donors and blood banks immediately
          </p>
        </div>

        <form className="blood-request-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="blood-input-group">
              <label><i className="fas fa-user-injured"></i> Patient Name</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Full Name" 
                value={request.name} 
                onChange={handleChange} 
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{errors.name}</span>}
            </div>
            
            <div className="blood-input-group">
              <label><i className="fas fa-phone-alt"></i> Contact Number</label>
              <input 
                type="text" 
                name="contact" 
                placeholder="Emergency Contact" 
                value={request.contact} 
                onChange={handleChange} 
                className={errors.contact ? 'input-error' : ''}
              />
              {errors.contact && <span style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{errors.contact}</span>}
            </div>
          </div>

          <div className="blood-input-group" style={{ marginBottom: '20px' }}>
            <label><i className="fas fa-hospital"></i> Hospital / Medical Center</label>
            <input 
              type="text" 
              name="hospitalName" 
              placeholder="Where is the blood needed?" 
              value={request.hospitalName} 
              onChange={handleChange} 
              className={errors.hospitalName ? 'input-error' : ''}
            />
            {errors.hospitalName && <span style={{ color: '#e74c3c', fontSize: '0.75rem' }}>{errors.hospitalName}</span>}
          </div>

          <div className="blood-selection-section">
            <h3 className="blood-selection-title">
              <i className="fas fa-vial"></i> Select Blood Type Needed
            </h3>
            <div className="blood-type-selector">
              {bloodTypes.map(type => (
                <div 
                  key={type}
                  className={`blood-type-option ${request.bloodType === type ? 'selected' : ''}`}
                  onClick={() => selectBloodType(type)}
                >
                  {type}
                </div>
              ))}
            </div>
            {errors.bloodType && <p style={{ color: '#e74c3c', fontSize: '0.75rem', marginBottom: '15px' }}>{errors.bloodType}</p>}
          </div>

          <div className="form-row">
            <div className="blood-input-group">
              <label><i className="fas fa-exclamation-triangle"></i> Urgency Level</label>
              <select 
                name="urgency" 
                value={request.urgency} 
                onChange={handleChange}
                className="urgency-badge-select"
              >
                <option value="Low">Low (Routine)</option>
                <option value="Normal">Normal</option>
                <option value="High">High (Immediate Emergency)</option>
              </select>
            </div>
            
            <div className="blood-input-group">
              <label><i className="fas fa-info-circle"></i> Notes (Optional)</label>
              <input 
                name="message" 
                placeholder="E.g. Units needed..." 
                value={request.message} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <button type="submit" className="btn-blood-submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <i className="fas fa-circle-notch fa-spin"></i>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Broadcast Urgent Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}