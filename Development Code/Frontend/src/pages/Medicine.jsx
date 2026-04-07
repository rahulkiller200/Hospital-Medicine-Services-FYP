import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import { API_V1_URL } from "../config/apiConfig";

const Medicine = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  
  const [alternatives, setAlternatives] = useState([]);
  const [showAltModal, setShowAltModal] = useState(false);
  const [comparingMed, setComparingMed] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
  }, [searchTerm, category]);

  const fetchMedicines = async () => {
    try {
      const response = await axios.get(`${API_V1_URL}/medicines/all?search=${searchTerm}&category=${category}`);
      if (response.data.success) {
        setMedicines(response.data.data);
      }
    } catch (error) {
      toast.error("Error fetching medicine catalog");
    } finally {
      setLoading(false);
    }
  };

  const fetchAlternatives = async (med) => {
    try {
      setComparingMed(med);
      const response = await axios.get(`${API_V1_URL}/medicines/alternatives/${med._id}`);
      if (response.data.success) {
        setAlternatives(response.data.data);
        setShowAltModal(true);
      }
    } catch (error) {
       // Only show error if we explicitly clicked one that should have generics but doesn't
       toast.info("No cheaper generic alternatives found for this specific medicine.");
    }
  };

  const handleOrderRequest = (med) => {
    navigate("/order-medicine", { state: { medicine: med } });
  };

  const calculateSavings = (original, alt) => {
    const savings = ((original - alt) / original) * 100;
    return Math.round(savings);
  };

  return (
    <div className="medicine-portal">
      <div className="med-header">
        <h1><i className="fas fa-pills"></i> Medicine Search</h1>
        <p>Find and request available medical supplies in Kathmandu</p>
        
        <div className="button-group-row" style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '15px', marginBottom: '20px' }}>
          <button 
            className="btn primary" 
            style={{ padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '8px', background: '#22c55e', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => navigate('/verify-medicine')}
          >
            <i className="fas fa-qrcode"></i> Verify QR Code Authenticity
          </button>
        </div>
        
        <div 
          className='view-map-banner pharmacy-banner' 
          onClick={() => navigate('/Map', { state: { filter: 'pharmacy' } })}
        >
          <div className='banner-content'>
            <i className="fas fa-map-marked-alt"></i>
            <div>
              <h3>View All Pharmacies on Map</h3>
              <p>See live locations of nearby pharmacies</p>
            </div>
          </div>
          <i className="fas fa-arrow-right banner-arrow"></i>
        </div>
      </div>

      <div className="search-filters">
        <div className="search-input-group">
          <i className="fas fa-search"></i>
          <input 
            type="text" 
            placeholder="Search by medicine name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All Categories</option>
          <option value="Pain Relief">Pain Relief</option>
          <option value="Antibiotics">Antibiotics</option>
          <option value="Fever">Fever</option>
          <option value="Cough & Cold">Cough & Cold</option>
          <option value="First Aid">First Aid</option>
          <option value="Chronic Diseases">Chronic Diseases</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner-container" style={{ textAlign: 'center', padding: '50px' }}>
           <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#3182ce' }}></i>
           <p style={{ marginTop: '15px', color: '#666' }}>Analyzing medicine catalog...</p>
        </div>
      ) : (
        <div className="med-grid">
          {medicines.map((med) => (
            <div key={med._id} className="med-card" style={{ position: 'relative', overflow: 'hidden' }}>
              {med.genericSalt && (
                <div 
                  className="generic-tag" 
                  onClick={() => fetchAlternatives(med)}
                  style={{ position: 'absolute', top: '10px', right: '10px', background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #bbf7d0', zIndex: 5 }}
                >
                  <i className="fas fa-leaf"></i> Switch & Save
                </div>
              )}
              <div className="med-info">
                <h3>{med.name}</h3>
                <span className="med-cat">{med.category}</span>
                <p className="med-desc">{med.description}</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <div className="med-price" style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2d3748' }}>Rs. {med.price}</div>
                    {med.genericSalt && (
                        <button 
                            onClick={() => fetchAlternatives(med)}
                            style={{ background: 'none', border: 'none', color: '#3182ce', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                        >
                            View Alternatives
                        </button>
                    )}
                </div>

                {med.prescriptionRequired && (
                   <span className="rx-badge" style={{ display: 'inline-block', marginTop: '10px', fontSize: '0.75rem', color: '#e53e3e', background: '#fff5f5', padding: '2px 8px', borderRadius: '4px', border: '1px solid #feb2b2' }}>
                     <i className="fas fa-file-prescription"></i> Prescription Required
                   </span>
                )}
              </div>
              <button className="med-btn" onClick={() => handleOrderRequest(med)} style={{ width: '100%', marginTop: '15px' }}>
                Request Medicine
              </button>
            </div>
          ))}
          {medicines.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', background: '#f8fafc', borderRadius: '12px' }}>
                <i className="fas fa-box-open" style={{ fontSize: '3rem', color: '#cbd5e0', marginBottom: '15px' }}></i>
                <h3>No Medicines Found</h3>
                <p>Try adjusting your search filters or category.</p>
            </div>
          )}
        </div>
      )}

      {/* Alternative Comparison Modal */}
      {showAltModal && comparingMed && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div className="modal-content animate-pop" style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '550px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2d3748' }}>Smart Savings Engine</h2>
                <button onClick={() => setShowAltModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>
            
            <div style={{ background: '#edf2f7', padding: '15px', borderRadius: '12px', marginBottom: '25px' }}>
                <p style={{ fontSize: '0.9rem', color: '#4a5568' }}>Original Brand:</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 'bold' }}>{comparingMed.name}</h3>
                    <span style={{ fontWeight: 'bold' }}>Rs. {comparingMed.price}</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#718096', marginTop: '5px' }}>Formula: <strong>{comparingMed.genericSalt}</strong></p>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
                <i className="fas fa-check-circle"></i> Better Value Alternatives
            </h3>

            <div className="alt-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {alternatives.length > 0 ? alternatives.map(alt => (
                    <div key={alt._id} className="alt-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '2px solid #ecfdf5', borderRadius: '15px', background: '#f0fdf4', transition: '0.2s' }}>
                        <div>
                            <h4 style={{ fontWeight: 'bold', color: '#065f46' }}>{alt.name}</h4>
                            <p style={{ fontSize: '0.9rem', color: '#047857' }}>Rs. {alt.price}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ background: '#059669', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
                                Save {calculateSavings(comparingMed.price, alt.price)}%
                            </div>
                            <button 
                                onClick={() => { handleOrderRequest(alt); setShowAltModal(false); }}
                                style={{ background: '#059669', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}
                            >
                                Select Generic
                            </button>
                        </div>
                    </div>
                )) : (
                    <div style={{ textAlign: 'center', padding: '30px', background: '#fff7ed', borderRadius: '15px', border: '1px dashed #fdba74' }}>
                        <i className="fas fa-info-circle" style={{ fontSize: '2rem', color: '#f97316', marginBottom: '10px' }}></i>
                        <p style={{ fontSize: '0.9rem', color: '#9a3412' }}>No cheaper generic substitutes are currently listed with this exact salt profile.</p>
                    </div>
                )}
            </div>

            <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                <button 
                    onClick={() => setShowAltModal(false)}
                    style={{ flex: 1, padding: '14px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Close
                </button>
                <button 
                    onClick={() => { handleOrderRequest(comparingMed); setShowAltModal(false); }}
                    style={{ flex: 2, padding: '14px', background: '#3182ce', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 14px rgba(49, 130, 206, 0.4)' }}
                >
                    Proceed with Branded
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicine;