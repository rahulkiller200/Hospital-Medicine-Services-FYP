import React, { useState } from 'react';
import axios from 'axios';
import { API_V1_URL } from '../config/apiConfig';

const EmergencyAlertButton = () => {
  const [alertStatus, setAlertStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Simulated user details for the alert
  const userId = 'P-12345';
  const userLocation = { lat: 27.7172, lng: 85.3240 }; // Placeholder location

  const handleEmergencyAlert = async () => {
    if (isSending) return;

    // A prompt or confirmation should be shown in a real application
    const confirmed = window.confirm("Are you sure you want to send an immediate emergency alert?");
    if (!confirmed) return;

    setIsSending(true);
    setAlertStatus('Sending emergency alert...');

    try {
      // Logic to trigger and listen for secure emergency/blood donation alerts (Obj 6)
      const payload = {
        userId: userId,
        location: userLocation,
        type: 'General Emergency', 
        timestamp: new Date().toISOString()
      };
      
      const response = await axios.post(`${API_V1_URL}/emergency/alert`, payload);
      
      if (response.data.success) {
        setAlertStatus(`Alert sent successfully! Response ID: ${response.data.alertId}`);
        // Start listening for nearby responders/updates here
        console.log('Now listening for secure responder acknowledgements...');
      } else {
        setAlertStatus('Failed to send alert. Please try again.');
      }
    } catch (error) {
      console.error('Emergency Alert Error:', error);
      setAlertStatus('Error sending alert. Check console for details.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="emergency-alert-container">
      <h2>Secure Emergency Alert System (Obj 6)</h2>
      <p>Click the button below to trigger an immediate alert to nearby emergency services and blood donors.</p>
      <button 
        className="emergency-button"
        onClick={handleEmergencyAlert}
        disabled={isSending}
        style={{
          padding: '1rem 2rem', 
          fontSize: '1.2rem', 
          backgroundColor: isSending ? '#ccc' : '#E63946', 
          color: 'white', 
          border: 'none', 
          borderRadius: '8px',
          cursor: isSending ? 'not-allowed' : 'pointer'
        }}
      >
        {isSending ? (
          <>
            <i className="fas fa-spinner fa-spin"></i> Sending Alert...
          </>
        ) : (
          <>
            <i className="fas fa-bell"></i> Send Emergency Alert
          </>
        )}
      </button>
      {alertStatus && <p className={`alert-status ${alertStatus.includes('successfully') ? 'success' : 'error'}`}>{alertStatus}</p>}
    </div>
  );
};

export default EmergencyAlertButton;