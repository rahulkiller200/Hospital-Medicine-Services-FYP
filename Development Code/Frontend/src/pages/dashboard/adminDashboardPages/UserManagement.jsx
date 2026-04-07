import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaEye, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:3001'; // Update this with your backend URL
axios.defaults.withCredentials = true;

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

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to continue');
      navigate('/login');
      return;
    }

    // Check if user is admin
    const userRole = localStorage.getItem('role');
    if (userRole !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin-dashboard'); 
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('API Response:', response.data);

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setUsers(response.data.data);
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Failed to fetch users. Please try again later.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please login again.';
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/login');
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to view users.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter(user => {
    if (!user) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.username?.toLowerCase().includes(searchLower) || '') ||
      (user.email?.toLowerCase().includes(searchLower) || '')
    );
  });

  const handleView = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      role: user.role || '',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    if (!user) return;
    setSelectedUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      role: user.role || '',
      password: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (userId) => {
    if (!userId) return;
    
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/v1/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };

      if (selectedUser) {
        await axios.put(`/api/v1/users/${selectedUser._id}`, formData, { headers });
        toast.success('User updated successfully');
      } else {
        await axios.post('/api/v1/users', formData, { headers });
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  return (
    <div className="user-management">
      <div className="header">
        <h2>User Management</h2>
        <div className="search-bar">
          <FaSearch />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <button 
          className="add-button" 
          onClick={() => {
            setSelectedUser(null);
            setFormData({
              username: '',
              email: '',
              role: '',
              password: ''
            });
            setIsModalOpen(true);
          }}
        >
          <FaPlus /> Add User
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">
          <FaSpinner className="fa-spin" />
          <span>Loading users...</span>
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td>{user.username || 'N/A'}</td>
                    <td>{user.email || 'N/A'}</td>
                    <td>{user.role || 'N/A'}</td>
                    <td className="actions">
                      <button onClick={() => handleView(user)}>
                        <FaEye />
                      </button>
                      <button onClick={() => handleEdit(user)}>
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(user._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{selectedUser ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="hospital">Hospital</option>
                  <option value="ambulance">Ambulance</option>
                  <option value="bloodbank">Blood Bank</option>
                </select>
              </div>
              {!selectedUser && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required={!selectedUser}
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="submit">Save</button>
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 