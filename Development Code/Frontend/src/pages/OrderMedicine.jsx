import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { getAuthToken } from "../utils/auth";
import MainHeader from "../components/Header/Header"; // Generic or we will just use native simple header

const OrderMedicine = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const selectedMed = location.state?.medicine;

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // If no medicine is passed in state, redirect back to medicine search
  useEffect(() => {
    if (!selectedMed) {
      toast.warn("Please select a medicine first.");
      navigate("/medicine");
    } else {
      fetchProviders();
    }
  }, [selectedMed, navigate]);

  const fetchProviders = async () => {
    try {
      // Fetch both hospitals and pharmacies
      const response = await axios.get("http://localhost:3001/api/v1/map/providers");
      if (response.data.success) {
        // We only want pharmacies for medicine orders typically, but let's allow both if preferred.
        // Actually, let's filter to just Pharmacies to ensure they are the ones handling it.
        const pharmaciesOnly = response.data.data.filter(p => p.providerType === 'Pharmacy');
        setProviders(pharmaciesOnly);
        if (pharmaciesOnly.length > 0) {
          setSelectedProvider(pharmaciesOnly[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      toast.error("Could not fetch pharmacies.");
    } finally {
      setLoadingProviders(false);
    }
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    if (!selectedProvider) {
      toast.error("Please select a Pharmacy to fulfill your order.");
      return;
    }

    if (selectedMed.prescriptionRequired && !prescriptionFile) {
      toast.error("Please upload a prescription for this medicine.");
      return;
    }

    setIsOrdering(true);
    const formData = new FormData();
    formData.append("medicineId", selectedMed._id);
    formData.append("providerId", selectedProvider);
    formData.append("providerType", "Pharmacy");
    formData.append("quantity", quantity);
    formData.append("notes", notes);
    
    if (prescriptionFile) {
      formData.append("prescription", prescriptionFile);
    }

    try {
      const response = await axios.post("http://localhost:3001/api/v1/medicines/order", formData, {
        headers: { 
          "Authorization": `Bearer ${getAuthToken()}`,
          "Content-Type": "multipart/form-data" 
        },
        withCredentials: true
      });
      if (response.data.success) {
        window.alert(' Order Places Sucsessfully');
        navigate("/home"); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Order placement failed");
    } finally {
      setIsOrdering(false);
    }
  };

  if (!selectedMed) return null; // Prevent rendering errors before redirect

  return (
    <div className="order-medicine-page">
      <div className="order-header">
        <button className="back-btn" onClick={() => navigate("/medicine")}>
          <i className="fas fa-arrow-left"></i> Back to Catalog
        </button>
        <h1>Place Medicine Order</h1>
      </div>

      <div className="order-content">
        <div className="order-summary-card">
          <h2>Order Summary</h2>
          <div className="summary-item">
            <span className="summary-label">Medicine:</span>
            <span className="summary-value" style={{fontWeight: 'bold', fontSize: '1.2rem'}}>{selectedMed.name}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Category:</span>
            <span className="summary-value">{selectedMed.category}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Price per unit:</span>
            <span className="summary-value" style={{ color: 'var(--color-navy)', fontWeight: 'bold' }}>Rs. {selectedMed.price}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Total Estimate:</span>
            <span className="summary-value" style={{ color: 'var(--color-accent)', fontWeight: 'bold', fontSize: '1.3rem' }}>
              Rs. {selectedMed.price * quantity}
            </span>
          </div>
        </div>

        <div className="order-form-card">
          <form onSubmit={handleOrder} className="order-form">
            <h2>Order Details</h2>

            <div className="form-group row-group">
              <div className="input-field">
                <label>Select Pharmacy <span>*</span></label>
                {loadingProviders ? (
                  <p>Loading available pharmacies...</p>
                ) : (
                  <select 
                    value={selectedProvider} 
                    onChange={(e) => setSelectedProvider(e.target.value)} 
                    required
                    className="pharmacy-select"
                  >
                    <option value="" disabled>Choose a pharmacy</option>
                    {providers.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                )}
                {providers.length === 0 && !loadingProviders && (
                  <small className="error-text">No pharmacies available near you.</small>
                )}
              </div>

              <div className="input-field">
                <label>Quantity <span>*</span></label>
                <input 
                  type="number" 
                  min="1" 
                  max="10"
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>

            {selectedMed.prescriptionRequired && (
              <div className="form-group upload-section">
                <label className="required-upload">
                  <i className="fas fa-file-prescription"></i> Prescription Required
                </label>
                <p className="upload-desc">Please upload a clear photo of your prescription to process this order.</p>
                <div className="upload-box-large">
                  <input 
                    type="file" 
                    id="prescription"
                    onChange={(e) => setPrescriptionFile(e.target.files[0])} 
                    accept="image/*"
                    required
                  />
                  <small>Supported formats: JPG, PNG, WEBP (Max 5MB)</small>
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Additional Notes (Optional)</label>
              <textarea 
                rows="3" 
                placeholder="Any special instructions for the pharmacy..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              ></textarea>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                disabled={isOrdering || providers.length === 0} 
                className="btn-submit-order"
              >
                {isOrdering ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : <><i className="fas fa-check-circle"></i> Confirm Order</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderMedicine;
