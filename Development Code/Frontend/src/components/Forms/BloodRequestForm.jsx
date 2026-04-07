import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function BloodRequestForm({ isOpen, onClose }) {
  const [request, setRequest] = useState({
    name: '',
    bloodType: '',
    contact: '',
    urgency: 'Normal',
    message: ''
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequest({ ...request, [name]: value });
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!request.name) newErrors.name = 'Name is required';
    if (!request.bloodType) newErrors.bloodType = 'Blood type is required';
    if (!request.contact) newErrors.contact = 'Contact info is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Get userId from localStorage if available
      const username = localStorage.getItem('username');
      const payload = { ...request, username };

      const response = await axios.post('http://localhost:3001/api/v1/blood-request/create', payload);
      
      if (response.data.success) {
        toast.success('Your blood request has been submitted to the network!');
        setRequest({ name: '', bloodType: '', contact: '', urgency: 'Normal', message: '' });
        onClose();
      }
    } catch (error) {
      console.error('Error submitting blood request:', error);
      toast.error('Failed to submit request. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Request Blood</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Your Name" value={request.name} onChange={handleChange} required />
          {errors.name && <span className="error">{errors.name}</span>}
          <input type="text" name="bloodType" placeholder="Blood Type Needed" value={request.bloodType} onChange={handleChange} required />
          {errors.bloodType && <span className="error">{errors.bloodType}</span>}
          <input type="text" name="contact" placeholder="Contact Info" value={request.contact} onChange={handleChange} required />
          {errors.contact && <span className="error">{errors.contact}</span>}
          
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: 'var(--color-navy)', fontSize: '14px', fontWeight: '600' }}>Urgency Level</label>
            <select 
              name="urgency" 
              value={request.urgency} 
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }}
            >
              <option value="Low">Low (Routine)</option>
              <option value="Normal">Normal</option>
              <option value="High">High (Immediate Emergency)</option>
            </select>
          </div>

          <textarea name="message" placeholder="Additional Info (Hospital name, Patient details...)" value={request.message} onChange={handleChange} />
          <button type="submit">Send Request</button>
        </form>
      </div>
    </div>
  );
}