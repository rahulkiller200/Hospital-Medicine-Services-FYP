import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaAmbulance, 
  FaHospital, 
  FaTint, 
  FaSignOutAlt, 
  FaUsers, 
  FaSpinner,
  FaChartLine,
  FaHistory,
  FaCog,
  FaExclamationTriangle,
  FaUserCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import UserManagement from './UserManagement';
import HospitalManagement from './HospitalManagement';
import { logout, getUserRole, getUsername } from '../../../utils/auth';
import axios from 'axios';
import { API_V1_URL } from '../../../config/apiConfig';
import '../HospitalDashboard.css'; // Applying the professional theme

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    ambulances: 0,
    hospitals: 0,
    bloodBanks: 0
  });
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [patients, setPatients] = useState([]);
  
  // Settings State
  const [systemConfig, setSystemConfig] = useState({ maintenanceMode: false, hospital2FAEnabled: false });

  const fetchBloodRequests = async () => {
    try {
      const response = await axios.get(`${API_V1_URL}/blood-request/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.data.success) {
        const newRequests = response.data.data;
        const hasHighUrgency = newRequests.some(r => r.urgency === 'High' && r.status === 'Pending');
        if (hasHighUrgency) {
          // Internal check, handled by UI pulsing
        }
        setBloodRequests(newRequests);
      }
    } catch (err) {
      console.error("Failed to fetch blood requests", err);
    }
  };

  useEffect(() => {
    setUserRole(getUserRole());
    setUsername(getUsername());
    fetchStats();
    fetchBloodRequests();

    const interval = setInterval(fetchBloodRequests, 20000); // 20s polling
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error("No authentication token found");

      try {
          const configRes = await axios.get(`${API_V1_URL}/system/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (configRes.data.success) setSystemConfig(configRes.data.settings);
      } catch (e) {
          console.error("Config fetch failed", e);
      }

      const response = await axios.get(`${API_V1_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const allUsers = response.data.data || [];
      const patientsFilter = allUsers.filter(u => u.role === 'patient');
      
      setPatients(patientsFilter);
      
      setStats({
        totalUsers: allUsers.length,
        ambulances: allUsers.filter(u => u.role === 'ambulance').length,
        hospitals: allUsers.filter(u => u.role === 'hospital').length,
        bloodBanks: allUsers.filter(u => u.role === 'bloodbank').length,
        pharmacies: allUsers.filter(u => u.role === 'pharmacy').length,
        patients: patientsFilter.length
      });
    } catch (err) {
      setError('Failed to fetch statistics. Secure connection denied.');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/login';
    }
  };

  const renderDashboardContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'hospitals':
        return <HospitalManagement />;
      case 'analytics':
        return (
          <div className="dashboard-content">
            <h2>Platform Analytics</h2>
            {loading ? <p>Loading Analytics...</p> : (
              <div className="analytics-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                  <h4>User Distribution Pipeline</h4>
                  <div style={{ width: '100%', backgroundColor: '#eee', height: '30px', borderRadius: '5px', overflow: 'hidden', display: 'flex', marginTop: '10px' }}>
                    <div style={{ width: `${(stats.patients / stats.totalUsers) * 100}%`, backgroundColor: '#4CAF50', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px' }} title="Patients"></div>
                    <div style={{ width: `${(stats.hospitals / stats.totalUsers) * 100}%`, backgroundColor: '#2196F3', height: '100%' }} title="Hospitals"></div>
                    <div style={{ width: `${(stats.bloodBanks / stats.totalUsers) * 100}%`, backgroundColor: '#f44336', height: '100%' }} title="Blood Banks"></div>
                    <div style={{ width: `${(stats.pharmacies / stats.totalUsers) * 100}%`, backgroundColor: '#FF9800', height: '100%' }} title="Pharmacies"></div>
                    <div style={{ width: `${(stats.ambulances / stats.totalUsers) * 100}%`, backgroundColor: '#9C27B0', height: '100%' }} title="Ambulance"></div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                    <span style={{ color: '#4CAF50' }}>● Patients ({stats.patients})</span>
                    <span style={{ color: '#2196F3' }}>● Hospitals ({stats.hospitals})</span>
                    <span style={{ color: '#f44336' }}>● Blood Banks ({stats.bloodBanks})</span>
                    <span style={{ color: '#FF9800' }}>● Pharmacies ({stats.pharmacies})</span>
                    <span style={{ color: '#9C27B0' }}>● Ambulances ({stats.ambulances})</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'history':
        return (
          <div className="dashboard-content">
            <h2>Registered Patient Database</h2>
            <div className="users-table" style={{ background: 'white', borderRadius: '10px', padding: '20px', marginTop: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '10px' }}>Username</th>
                    <th style={{ padding: '10px' }}>Email Address</th>
                    <th style={{ padding: '10px' }}>Account Status</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length > 0 ? patients.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{p.username}</td>
                      <td style={{ padding: '10px' }}>{p.email}</td>
                      <td style={{ padding: '10px', color: 'green' }}><i className="fas fa-check-circle"></i> Active</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>No active patients registered securely.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'blood-requests':
        return (
          <div className="dashboard-content animated-fade-in">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Manage Live Blood Requests</h2>
              <div style={{ color: '#666' }}>{bloodRequests.length} Total Requests</div>
            </div>
            <div className="users-table" style={{ background: 'white', borderRadius: '10px', padding: '20px', marginTop: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '12px' }}>Requester</th>
                    <th style={{ padding: '12px' }}>Blood Type</th>
                    <th style={{ padding: '12px' }}>Urgency</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Contact</th>
                    <th style={{ padding: '12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bloodRequests.length > 0 ? bloodRequests.map(r => (
                    <tr key={r._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{r.name}</td>
                      <td style={{ padding: '12px' }}><span style={{ color: '#c0392b', fontWeight: 'bold' }}>{r.bloodType}</span></td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '15px', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold',
                          background: r.urgency === 'High' ? '#fee2e2' : '#fef3c7',
                          color: r.urgency === 'High' ? '#991b1b' : '#92400e'
                        }}>{r.urgency}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: r.status === 'Pending' ? '#3498db' : '#27ae60', fontWeight: 'bold' }}>{r.status}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{r.contact}</td>
                      <td style={{ padding: '12px', color: '#666', fontSize: '0.85rem' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No live blood requests found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="dashboard-content">
            <h2>Master Node Operations</h2>
            <div className="settings-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
              <div className="settings-card" style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                      <h3><i className="fas fa-lock" style={{ color: '#e74c3c' }}></i> Global Maintenance Mode</h3>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>Severs external connections. Restricts access exclusively to Master Node Administrators. Returns 503 HTTP Codes to organic traffic.</p>
                  </div>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                      <input type="checkbox" checked={systemConfig.maintenanceMode} onChange={async (e) => {
                          const newVal = e.target.checked;
                          setSystemConfig({...systemConfig, maintenanceMode: newVal});
                          await axios.put(`${API_V1_URL}/system/settings`, { maintenanceMode: newVal }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                          toast.warning(newVal ? "MAINTENANCE MODE ENGAGED" : "MAINTENANCE MODE LIFTED");
                      }} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: systemConfig.maintenanceMode ? '#e74c3c' : '#ccc', transition: '.4s', borderRadius: '34px' }}>
                          <span style={{ position: 'absolute', content: '""', height: '26px', width: '26px', left: systemConfig.maintenanceMode ? '30px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                      </span>
                  </label>
              </div>

              <div className="settings-card" style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                      <h3><i className="fas fa-shield-alt" style={{ color: '#27ae60' }}></i> Hospital 2FA Enforcement</h3>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>Requires all newly logging-in Hospitals to intercept standard Auth flows with a secondary 6-digit OTP verification handshake.</p>
                  </div>
                  <label className="switch" style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
                      <input type="checkbox" checked={systemConfig.hospital2FAEnabled} onChange={async (e) => {
                          const newVal = e.target.checked;
                          setSystemConfig({...systemConfig, hospital2FAEnabled: newVal});
                          await axios.put(`${API_V1_URL}/system/settings`, { hospital2FAEnabled: newVal }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                          toast.success(newVal ? "HOSPITAL 2FA ENABLED" : "HOSPITAL 2FA DISABLED");
                      }} style={{ opacity: 0, width: 0, height: 0 }} />
                      <span className="slider round" style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: systemConfig.hospital2FAEnabled ? '#27ae60' : '#ccc', transition: '.4s', borderRadius: '34px' }}>
                          <span style={{ position: 'absolute', content: '""', height: '26px', width: '26px', left: systemConfig.hospital2FAEnabled ? '30px' : '4px', bottom: '4px', backgroundColor: 'white', transition: '.4s', borderRadius: '50%' }}></span>
                      </span>
                  </label>
              </div>

              <div className="settings-card" style={{ background: '#fff0f0', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #ffcccc' }}>
                  <div>
                      <h3 style={{ color: '#c0392b' }}><i className="fas fa-microchip"></i> Purge Chatbot AI Array</h3>
                      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>Execute an explosive memory wipe to unbind all cached semantic queries floating in the Chatbot Vector Space.</p>
                  </div>
                  <button onClick={async () => {
                      if (window.confirm("WARNING: Flusing AI array is irreversible. Proceed?")) {
                          try {
                              await axios.post(`${API_V1_URL}/chatbot/wipe`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }});
                              toast.success("AI MEMORY BUFFER ANNIHILATED", { theme: "dark" });
                          } catch(err) {
                              toast.error("Memory Purge Failed.");
                          }
                      }
                  }} style={{ background: '#c0392b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
                      <i className="fas fa-skull"></i> PURGE BUFFER
                  </button>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="dashboard-content">
            <h2>Welcome to the Admin Dashboard</h2>
            {loading ? (
              <div className="loading-spinner">
                <FaSpinner className="fa-spin" />
                <span>Loading statistics...</span>
              </div>
            ) : error ? (
              <div className="error-message">
                {error}
              </div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <FaUsers />
                  <h3>Total Users</h3>
                  <p>{stats.totalUsers}</p>
                </div>
                <div className="stat-card">
                  <FaAmbulance />
                  <h3>Ambulances</h3>
                  <p>{stats.ambulances}</p>
                </div>
                <div className="stat-card">
                  <FaHospital />
                  <h3>Hospitals</h3>
                  <p>{stats.hospitals}</p>
                </div>
                <div className="stat-card">
                  <FaTint />
                  <h3>Blood Banks</h3>
                  <p>{stats.bloodBanks}</p>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="hospital-dashboard-root">
      <aside className="hospital-sidebar">
        <div className="sidebar-brand" style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <FaUserCircle size={40} style={{ color: '#ff6b35' }} />
          <div>
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>ADMIN PANEL</h2>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>MASTER NODE</p>
          </div>
        </div>
        <div className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <FaUser />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <FaUsers />
            <span>User Management</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'hospitals' ? 'active' : ''}`}
            onClick={() => setActiveSection('hospitals')}
          >
            <FaHospital />
            <span>Hospital Management</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveSection('analytics')}
          >
            <FaChartLine />
            <span>Analytics</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'blood-requests' ? 'active' : ''}`}
            onClick={() => setActiveSection('blood-requests')}
            style={{ position: 'relative' }}
          >
            <FaExclamationTriangle />
            <span>Blood Requests</span>
            {bloodRequests.some(r => r.urgency === 'High' && r.status === 'Pending') && (
              <span className="pulse-dot" style={{ position: 'absolute', top: '10px', left: '25px', width: '8px', height: '8px', background: 'red', borderRadius: '50%', boxShadow: '0 0 10px red' }}></span>
            )}
          </button>
          <button
            className={`nav-item ${activeSection === 'history' ? 'active' : ''}`}
            onClick={() => setActiveSection('history')}
          >
            <FaHistory />
            <span>Patient History</span>
          </button>
          <button
            className={`nav-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <FaCog />
            <span>Settings</span>
          </button>
        </div>
        <div className="sidebar-footer">
          <button 
            className="logout-button" 
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <FaSpinner className="fa-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <FaSignOutAlt />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>
      <main className="hospital-main">
        {/* Top Admin Header */}
        <div className="admin-header">
          <div className="header-left">
            <h1 className="active-title">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1).replace('-', ' ')}
            </h1>
            <p className="system-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="header-right">
            <div className="admin-profile-pill">
              <FaUserCircle className="profile-icon" />
              <div className="profile-text">
                <span className="profile-name">{username}</span>
                <span className="profile-status">Master Node</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-view-wrapper">
          {renderDashboardContent()}
        </div>

        {/* Sticky Admin Footer */}
        <footer className="admin-footer">
          <div className="footer-content">
            <div className="footer-left">
              <span>© 2026 HMS Platform. All Rights Reserved.</span>
            </div>
            <div className="footer-right">
              <span className="system-tag">System Version: 2.1.0-Cloud</span>
              <span className="status-indicator">
                <span className="dot"></span> 
                Cloud Engine: Operational
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default AdminDashboard;