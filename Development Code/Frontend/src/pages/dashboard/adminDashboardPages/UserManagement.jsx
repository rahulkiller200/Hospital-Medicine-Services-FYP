import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye, FaSpinner, FaUserShield, FaHospital, FaClinicMedical, FaUserCircle, FaUserTag } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { API_V1_URL } from '../../../config/apiConfig';
import './UserManagement.css';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
    password: ''
  });

  // Stats State
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    hospitals: 0,
    others: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const calculateStats = (userList) => {
    const total = userList.length;
    const admins = userList.filter(u => u.role === 'admin').length;
    const hospitals = userList.filter(u => u.role === 'hospital').length;
    const others = total - admins - hospitals;
    setStats({ total, admins, hospitals, others });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_V1_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data && response.data.success) {
        setUsers(response.data.data);
        calculateStats(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      role: user.role,
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_V1_URL}/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('User deleted');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      if (selectedUser) {
        await axios.put(`${API_V1_URL}/users/${selectedUser._id}`, formData, { headers });
        toast.success('User updated');
      } else {
        await axios.post(`${API_V1_URL}/users`, formData, { headers });
        toast.success('User created');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  return (
    <div className="user-management-container">
      {/* Header Section */}
      <div className="um-header">
        <div className="um-title">
          <h2>User Management</h2>
          <p>Manage and monitor all platform accounts from one central hub</p>
        </div>
        <div className="um-actions">
          <div className="um-search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="um-search-input" 
              placeholder="Search by name, email or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="um-add-btn" onClick={() => {
            setSelectedUser(null);
            setFormData({ username: '', email: '', role: '', password: '' });
            setIsModalOpen(true);
          }}>
            <FaPlus /> Add New User
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="um-stats-grid">
        <div className="um-stat-card">
          <div className="um-stat-icon"><FaUserTag /></div>
          <div className="um-stat-info">
            <h4>Total Accounts</h4>
            <p>{stats.total}</p>
          </div>
        </div>
        <div className="um-stat-card" style={{borderLeftColor: '#0369a1'}}>
          <div className="um-stat-icon" style={{color: '#0369a1'}}><FaUserShield /></div>
          <div className="um-stat-info">
            <h4>Admins</h4>
            <p>{stats.admins}</p>
          </div>
        </div>
        <div className="um-stat-card" style={{borderLeftColor: '#15803d'}}>
          <div className="um-stat-icon" style={{color: '#15803d'}}><FaHospital /></div>
          <div className="um-stat-info">
            <h4>Hospitals</h4>
            <p>{stats.hospitals}</p>
          </div>
        </div>
        <div className="um-stat-card" style={{borderLeftColor: '#f26522'}}>
          <div className="um-stat-icon" style={{color: '#f26522'}}><FaClinicMedical /></div>
          <div className="um-stat-info">
            <h4>Providers/Others</h4>
            <p>{stats.others}</p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="um-table-card">
        {loading ? (
          <div style={{padding: '40px', textAlign: 'center'}}>
            <FaSpinner className="fa-spin" style={{fontSize: '2rem', color: 'var(--color-navy)'}} />
            <p style={{marginTop: '10px'}}>Synchronizing user data...</p>
          </div>
        ) : (
          <table className="um-table">
            <thead>
              <tr>
                <th>Account Identity</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Security Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <FaUserCircle style={{fontSize: '1.5rem', color: '#cbd5e1'}} />
                      <span style={{fontWeight: '600'}}>{user.username}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{color: user.isVerified ? '#15803d' : '#94a3b8', fontSize: '0.85rem', fontWeight: '500'}}>
                      {user.isVerified ? '● Verified' : '○ Pending'}
                    </span>
                  </td>
                  <td className="um-actions-cell">
                    <button className="um-action-btn" onClick={() => handleEdit(user)} title="Edit User">
                      <FaEdit />
                    </button>
                    <button className="um-action-btn delete" onClick={() => handleDelete(user._id)} title="Delete User">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="um-modal-overlay">
          <div className="um-modal">
            <h3>{selectedUser ? 'Modify User Profile' : 'Register New User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="um-form-group">
                <label>System Username</label>
                <input 
                  className="um-input"
                  type="text" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required
                />
              </div>
              <div className="um-form-group">
                <label>Official Email</label>
                <input 
                  className="um-input"
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className="um-form-group">
                <label>Account Role</label>
                <select 
                  className="um-input"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="patient">Patient</option>
                  <option value="hospital">Hospital</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="bloodbank">Blood Bank</option>
                  <option value="ambulance">Ambulance</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              {!selectedUser && (
                <div className="um-form-group">
                  <label>Initial Password</label>
                  <input 
                    className="um-input"
                    type="password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              )}
              <div className="um-modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;