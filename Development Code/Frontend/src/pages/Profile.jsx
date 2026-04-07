import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaHistory, FaEdit, FaSignOutAlt, FaHome, FaHeartbeat, FaRunning, FaCalendarAlt, FaFileMedical, FaUserMd, FaChartLine, FaPlusCircle, FaShoppingBag } from "react-icons/fa";
import OrderProgress from "../components/OrderProgress";
import { toast } from "react-toastify";
import { API_BASE_URL, API_V1_URL } from "../config/apiConfig";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import "./Profile.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function PatientProfile() {
  const [patientData, setPatientData] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [orders, setOrders] = useState([]);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [isSubmittingVitals, setIsSubmittingVitals] = useState(false);
  const [vitalsData, setVitalsData] = useState({
    systolic: '',
    diastolic: '',
    glucose: '',
    weight: '',
    height: ''
  });
  const navigate = useNavigate();

  const calculateBMI = (weight, height) => {
    if (!weight || !height) return "N/A";
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi) => {
    if (bmi === "N/A") return "Not calculated";
    const val = parseFloat(bmi);
    if (val < 18.5) return "Underweight";
    if (val < 25) return "Normal";
    if (val < 30) return "Overweight";
    return "Obese";
  };

  const handleVitalsSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingVitals(true);
    try {
      const response = await axios.post(`${API_V1_URL}/users/vitals`, vitalsData);
      if (response.data.success) {
        toast.success("Vitals logged successfully!");
        setShowVitalsModal(false);
        // Refresh data to show new vitals in charts
        window.location.reload(); 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log vitals");
    } finally {
      setIsSubmittingVitals(false);
    }
  };

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setVitalsData({ ...vitalsData, [name]: value });
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          axios.defaults.withCredentials = true;
        }

        try {
          const profileResponse = await axios.get(`${API_V1_URL}/patients/profile`);
          if (profileResponse.data.success) {
            setPatientData(profileResponse.data.data);
          }
        } catch (profileErr) {
          throw profileErr; // Profile is required, if it fails, crash
        }

        try {
          const historyResponse = await axios.get(`${API_V1_URL}/patients/history`);
          if (historyResponse.data.success) {
            setMedicalHistory(historyResponse.data.data);
          }
        } catch (historyErr) {
          if (historyErr.response && historyErr.response.status !== 404) {
             console.error("Error fetching history:", historyErr);
          }
        }

        try {
          const ordersResponse = await axios.get(`${API_V1_URL}/medicines/orders`);
          if (ordersResponse.data.success) {
            setOrders(ordersResponse.data.data);
          }
        } catch (ordersErr) {
          console.error("Error fetching orders:", ordersErr);
        }
      } catch (error) {
        console.error("Error fetching patient data:", error);
        setError(error.response?.data?.message || "Failed to load patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-message">{error}</div>
        <button onClick={() => window.location.reload()} className="btn primary">
          Try Again
        </button>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="dashboard-overview">
            <div className="welcome-section">
              <div className="welcome-card">
                <div className="welcome-avatar-wrapper">
                    {patientData?.profilePicture ? (
                        <img src={`${API_BASE_URL}${patientData.profilePicture}`} alt="Profile" className="welcome-avatar" />
                    ) : (
                        <div className="welcome-avatar-placeholder"><FaUser /></div>
                    )}
                </div>
                <div className="welcome-content">
                  <h2>Welcome back, {patientData?.firstName ? `${patientData.firstName} ${patientData.lastName || ''}` : "Patient"}!</h2>
                  <p>Here's your health dashboard overview</p>
                </div>
                <div className="welcome-actions">
                  <Link to="/patient/profile/edit" className="btn primary">
                    <FaEdit /> Edit Profile
                  </Link>
                  <button onClick={() => setShowVitalsModal(true)} className="btn success" style={{ background: '#27ae60', color: 'white', border: 'none' }}>
                    <FaPlusCircle /> Log Vitals
                  </button>
                  <Link to="/patient/history/edit" className="btn secondary">
                    <FaEdit /> Update Medical History
                  </Link>
                </div>
              </div>
            </div>

            <div className="quick-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <FaFileMedical />
                </div>
                <div className="stat-info">
                  <h3>Medical Records</h3>
                  <p>Complete</p>
                </div>
              </div>
              <div className="stat-card" onClick={() => setActiveSection("orders")} style={{ cursor: 'pointer' }}>
                <div className="stat-icon">
                  <FaShoppingBag />
                </div>
                <div className="stat-info">
                  <h3>My Orders</h3>
                  <p>{orders.length} Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <FaCalendarAlt />
                </div>
                <div className="stat-info">
                  <h3>Next Appointment</h3>
                  <p>Not Scheduled</p>
                </div>
              </div>
            </div>

            <div className="info-grid">
              <div className="info-card">
                <h3>Personal Information</h3>
                <div className="info-content">
                  <div className="info-item">
                    <span className="label">Name</span>
                    <span className="value">{patientData?.firstName ? `${patientData.firstName} ${patientData.lastName || ''}` : 'Not set'}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Username</span>
                    <span className="value">{patientData?.username}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Email</span>
                    <span className="value">{patientData?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Role</span>
                    <span className="value">{patientData?.role}</span>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>Vital Statistics</h3>
                <div className="info-content">
                  <div className="info-item">
                    <span className="label">Blood Group</span>
                    <span className="value">{medicalHistory?.bloodGroup}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Height</span>
                    <span className="value">{medicalHistory?.height} cm</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Weight</span>
                    <span className="value">{medicalHistory?.weight} kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "medical":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Medical Information</h2>
              <div className="section-actions">
                <Link to="/patient/history/edit" className="btn primary">
                  <FaEdit /> Update Medical Info
                </Link>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-card">
                <div className="card-header">
                  <FaHeartbeat className="card-icon" />
                  <h3>Vital Statistics</h3>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="label">Blood Group</span>
                    <span className="value">{medicalHistory?.bloodGroup}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Height</span>
                    <span className="value">{medicalHistory?.height} cm</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Weight</span>
                    <span className="value">{medicalHistory?.weight} kg</span>
                  </div>
                </div>
              </div>
              <div className="info-card">
                <div className="card-header">
                  <FaUser className="card-icon" />
                  <h3>Contact Information</h3>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="label">Phone</span>
                    <span className="value">{medicalHistory?.phoneNumber}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Address</span>
                    <span className="value">{medicalHistory?.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "history":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Medical History</h2>
              <div className="section-actions">
                <Link to="/patient/history/edit" className="btn primary">
                  <FaEdit /> Update History
                </Link>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-card">
                <div className="card-header">
                  <FaFileMedical className="card-icon" />
                  <h3>Health Conditions</h3>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="label">Allergies</span>
                    <span className="value">
                      {medicalHistory?.allergies?.join(", ") || "None"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Chronic Conditions</span>
                    <span className="value">
                      {medicalHistory?.chronicConditions?.join(", ") || "None"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Past Surgeries</span>
                    <span className="value">
                      {medicalHistory?.pastSurgeries?.join(", ") || "None"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="info-card">
                <div className="card-header">
                  <FaHistory className="card-icon" />
                  <h3>Medications & Family History</h3>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="label">Current Medications</span>
                    <span className="value">
                      {medicalHistory?.currentMedications?.join(", ") || "None"}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Family History</span>
                    <span className="value">
                      {medicalHistory?.familyHistory?.join(", ") || "None"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "lifestyle":
        return (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Lifestyle Information</h2>
              <div className="section-actions">
                <Link to="/patient/history/edit" className="btn primary">
                  <FaEdit /> Update Lifestyle
                </Link>
              </div>
            </div>
            <div className="info-grid">
              <div className="info-card">
                <div className="card-header">
                  <FaRunning className="card-icon" />
                  <h3>Daily Habits</h3>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="label">Smoking</span>
                    <span className="value">{medicalHistory?.lifestyle?.smoking}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Alcohol</span>
                    <span className="value">{medicalHistory?.lifestyle?.alcohol}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Exercise</span>
                    <span className="value">{medicalHistory?.lifestyle?.exercise}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Diet</span>
                    <span className="value">{medicalHistory?.lifestyle?.diet}</span>
                  </div>
                </div>
              </div>
              <div className="info-card">
                <div className="card-header">
                  <FaUser className="card-icon" />
                  <h3>Additional Information</h3>
                </div>
                <div className="info-content">
                  <div className="info-item">
                    <span className="label">Sleep Pattern</span>
                    <span className="value">{medicalHistory?.lifestyle?.sleepPattern || "Not specified"}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Stress Level</span>
                    <span className="value">{medicalHistory?.lifestyle?.stressLevel || "Not specified"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "orders":
        return (
          <div className="dashboard-section animated-fade-in">
            <div className="section-header">
              <h2>My Medicine Orders</h2>
              <Link to="/medicines" className="btn primary"><FaPlusCircle /> Order New Medicine</Link>
            </div>
            
            <div className="orders-list">
              {orders.length === 0 ? (
                <div className="empty-state-card">
                  <FaShoppingBag className="empty-icon" />
                  <h3>No Orders Found</h3>
                  <p>You haven't ordered any medicines yet. Visit our pharmacy to get started.</p>
                  <Link to="/medicines" className="btn primary" style={{ marginTop: '20px' }}>Browse Medicines</Link>
                </div>
              ) : (
                orders.map((order, index) => (
                  <div key={index} className="order-item-card">
                    <div className="order-header-info">
                      <div className="order-main-details">
                        <div className="medicine-order-icon"><FaFileMedical /></div>
                        <div>
                          <h4>{order.medicineId?.name || "Unknown Medicine"}</h4>
                          <p className="order-meta">Order ID: #{order._id.toString().slice(-6).toUpperCase()} | {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="order-status-badge">{order.status}</div>
                    </div>
                    
                    <div className="order-body-info">
                      <div className="info-row">
                        <span>Quantity: <strong>{order.quantity}</strong></span>
                        <span>Provider: <strong>{order.providerId?.name || "Clinic"}</strong></span>
                      </div>
                      <OrderProgress status={order.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case "trends":
        const history = patientData?.medicalProfile?.vitalsHistory || [];
        const chartLabels = history.map(h => new Date(h.date).toLocaleDateString());
        
        const bpData = {
          labels: chartLabels,
          datasets: [
            { label: 'Systolic', data: history.map(h => h.systolic), borderColor: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.1)', tension: 0.3, fill: true },
            { label: 'Diastolic', data: history.map(h => h.diastolic), borderColor: '#2980b9', backgroundColor: 'rgba(41, 128, 185, 0.1)', tension: 0.3, fill: true }
          ]
        };

        const glucoseData = {
          labels: chartLabels,
          datasets: [{ label: 'Glucose (mg/dL)', data: history.map(h => h.glucose), borderColor: '#f1c40f', backgroundColor: 'rgba(241, 196, 15, 0.1)', tension: 0.3, fill: true }]
        };

        const bmiData = {
          labels: chartLabels,
          datasets: [{ label: 'BMI', data: history.map(h => calculateBMI(h.weight, h.height)), borderColor: '#2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.1)', tension: 0.3, fill: true }]
        };

        const latestBMI = history.length > 0 ? calculateBMI(history[history.length-1].weight, history[history.length-1].height) : "N/A";

        return (
          <div className="dashboard-section animated-fade-in">
            <div className="section-header">
              <h2>Health Trends & Analytics</h2>
              <button onClick={() => setShowVitalsModal(true)} className="btn primary"><FaPlusCircle /> Add Record</button>
            </div>

            <div className="trends-overview-grid">
               <div className="bmi-summary-card">
                  <h3>Latest BMI Status</h3>
                  <div className="bmi-value">{latestBMI}</div>
                  <div className={`bmi-tag ${getBMICategory(latestBMI).toLowerCase()}`}>{getBMICategory(latestBMI)}</div>
               </div>
               <div className="vitals-highlight">
                  <p>Your blood pressure and glucose trends are updated automatically after every checkup.</p>
               </div>
            </div>

            <div className="charts-container">
              <div className="chart-card">
                <h3>Blood Pressure Trend (mmHg)</h3>
                <div className="chart-wrapper"><Line data={bpData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
              </div>
              <div className="chart-card">
                <h3>Glucose Level Trend (mg/dL)</h3>
                <div className="chart-wrapper"><Line data={glucoseData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
              </div>
              <div className="chart-card">
                <h3>BMI Trend Analysis</h3>
                <div className="chart-wrapper"><Line data={bmiData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-avatar-container">
            {patientData?.profilePicture ? (
                <img src={`${API_BASE_URL}${patientData.profilePicture}`} alt="Avatar" className="sidebar-avatar" />
            ) : (
                <div className="sidebar-avatar-placeholder"><FaUser /></div>
            )}
          </div>
          <h2>{patientData?.firstName || "Patient"}</h2>
          <p className="sidebar-role-tag">Verified User</p>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === "overview" ? "active" : ""}`}
            onClick={() => setActiveSection("overview")}
          >
            <FaHome className="nav-icon" />
            Overview
          </button>
          <button
            className={`nav-item ${activeSection === "medical" ? "active" : ""}`}
            onClick={() => setActiveSection("medical")}
          >
            <FaHeartbeat className="nav-icon" />
            Medical Info
          </button>
          <button
            className={`nav-item ${activeSection === "history" ? "active" : ""}`}
            onClick={() => setActiveSection("history")}
          >
            <FaHistory className="nav-icon" />
            Medical History
          </button>
          <button
            className={`nav-item ${activeSection === "lifestyle" ? "active" : ""}`}
            onClick={() => setActiveSection("lifestyle")}
          >
            <FaRunning className="nav-icon" />
            Lifestyle
          </button>
          <button
            className={`nav-item ${activeSection === "orders" ? "active" : ""}`}
            onClick={() => setActiveSection("orders")}
          >
            <FaShoppingBag className="nav-icon" />
            My Orders
          </button>
          <button
            className={`nav-item ${activeSection === "trends" ? "active" : ""}`}
            onClick={() => setActiveSection("trends")}
          >
            <FaChartLine className="nav-icon" />
            Health Trends
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="nav-item" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-content">
          {renderContent()}
        </div>
      </div>

      {showVitalsModal && (
        <div className="modal-overlay">
          <div className="vitals-modal animate-pop">
            <div className="modal-header">
              <h2><FaPlusCircle /> Log Health Vitals</h2>
              <button className="close-btn" onClick={() => setShowVitalsModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleVitalsSubmit}>
              <div className="modal-body">
                <p className="modal-subtitle">Enter your latest readings to update your health charts.</p>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Systolic BP (top)</label>
                    <input type="number" name="systolic" placeholder="e.g. 120" value={vitalsData.systolic} onChange={handleVitalsChange} required />
                  </div>
                  <div className="form-group">
                    <label>Diastolic BP (bottom)</label>
                    <input type="number" name="diastolic" placeholder="e.g. 80" value={vitalsData.diastolic} onChange={handleVitalsChange} required />
                  </div>
                  <div className="form-group">
                    <label>Glucose (mg/dL)</label>
                    <input type="number" name="glucose" placeholder="e.g. 100" value={vitalsData.glucose} onChange={handleVitalsChange} required />
                  </div>
                  <div className="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" name="weight" placeholder="e.g. 70" value={vitalsData.weight} onChange={handleVitalsChange} required />
                  </div>
                  <div className="form-group">
                    <label>Height (cm)</label>
                    <input type="number" name="height" placeholder="e.g. 175" value={vitalsData.height} onChange={handleVitalsChange} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn secondary" onClick={() => setShowVitalsModal(false)}>Cancel</button>
                <button type="submit" className="btn primary" disabled={isSubmittingVitals}>
                  {isSubmittingVitals ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PatientProfile; 