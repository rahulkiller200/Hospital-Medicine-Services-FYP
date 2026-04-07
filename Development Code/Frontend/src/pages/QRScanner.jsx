import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import './QRScanner.css';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [medicineData, setMedicineData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // initialize the QR scanner
    const scanner = new Html5QrcodeScanner("reader", {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 10,
    });

    const success = async (result) => {
      scanner.clear();
      setScanResult(result);
      verifyMedicine(result);
    };

    const error = (err) => {
      // ignore empty scan errors
    };

    scanner.render(success, error);

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  const verifyMedicine = async (qrData) => {
    setLoading(true);
    try {
      // In a real system, the QR data would contain a unique medicine ID/Hash.
      // We will parse the QR data and ask the backend for verification.
      
      // Let's assume the QR string looks like: "MED-ID: 65fa342" or a raw ID string
      const medId = qrData.replace('MED-ID:', '').trim();

      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      // Check if this medicine exists in the catalog (mocking verification protocol)
      // Usually would be a dedicated verification endpoint, but we check if ID exists
      const response = await axios.get(`http://localhost:3001/api/v1/medicines/all`);
      
      if (response.data.success) {
        const catalog = response.data.data;
        // Verify via Name or ID
        const matchedMed = catalog.find(m => m._id === medId || m.name.toLowerCase().includes(qrData.toLowerCase()));
        
        if (matchedMed) {
          setMedicineData({
            ...matchedMed,
            verified: true,
            message: "Authentic Medicine Verified!"
          });
          toast.success("Medicine Verified Successfully!");
        } else {
           setMedicineData({
            verified: false,
            message: "Warning: Medicine Not Found in Official Registry!",
            qrData: qrData
          });
          toast.warn("Warning! Verification Failed.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Verification System offline or error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-scanner-container">
      <ToastContainer />
      <div className="qr-header">
        <button className="back-btn" onClick={() => navigate('/medicine')}>
          <i className="fas fa-arrow-left"></i> Back
        </button>
        <h2>Medicine QR Verification</h2>
        <p>Scan the official QR code on the medicine packaging to verify its authenticity.</p>
      </div>

      {!scanResult ? (
        <div className="scanner-wrapper">
          <div id="reader"></div>
        </div>
      ) : (
        <div className="verification-results">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Verifying Blockchain/Database Record...</p>
            </div>
          ) : (
            medicineData && (
              <div className={`result-card ${medicineData.verified ? 'verified-safe' : 'verified-danger'}`}>
                <div className="result-icon">
                  {medicineData.verified ? <i className="fas fa-check-circle"></i> : <i className="fas fa-exclamation-triangle"></i>}
                </div>
                <h3>{medicineData.message}</h3>

                {medicineData.verified && (
                  <div className="med-details-card">
                    <h4>{medicineData.name} ({medicineData.category})</h4>
                    <p><strong>Description:</strong> {medicineData.description}</p>
                    <p><strong>Price:</strong> Rs. {medicineData.price}</p>
                    <p><strong>Stock:</strong> {medicineData.stock}</p>
                    <p className="verified-badge">✔ Officially Registered</p>
                  </div>
                )}

                {!medicineData.verified && (
                  <div className="fraud-warning">
                    <p>The scanned code <strong>{medicineData.qrData}</strong> does not match any registered items in the Nepal Health Registry.</p>
                    <p>Do NOT consume unverified medicines.</p>
                  </div>
                )}
                
                <button className="btn primary scan-again-btn" onClick={() => window.location.reload()}>
                  Scan Another Module
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
