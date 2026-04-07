import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaCamera } from 'react-icons/fa';
import { API_BASE_URL, API_V1_URL } from '../../config/apiConfig';
import '../../pages/Profile.css';

const EditProfileForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        axios.defaults.withCredentials = true;

        const response = await axios.get(`${API_V1_URL}/patients/profile`);
        const { firstName, lastName, email, profilePicture } = response.data.data;

        setFormData(prev => ({
          ...prev,
          firstName,
          lastName,
          email
        }));

        if (profilePicture) {
          setImagePreview(`${API_BASE_URL}${profilePicture}`);
        }
      } catch (err) {
        setError('Failed to fetch user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size too large. Max 2MB allowed.');
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|`~-]).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password && !validatePassword(formData.password)) {
        setError('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character.');
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      
      if (selectedFile) {
        submitData.append('profilePicture', selectedFile);
      }

      const response = await axios.post(`${API_V1_URL}/patients/update`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="update-profile-container">
      <div className="update-profile-header">
        <h2>Edit Profile</h2>
        <p>Update your clinical identity & account settings</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-section profile-pic-upload-section" style={{ textAlign: 'center', marginBottom: '30px' }}>
             <div className="profile-pic-preview-container" style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 15px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #3182ce', background: '#f8fafc' }}>
                 {imagePreview ? (
                     <img src={imagePreview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 ) : (
                     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e0', fontSize: '3rem' }}>
                         <FaUser />
                     </div>
                 )}
                 <label htmlFor="profile-upload" style={{ position: 'absolute', bottom: 0, right: 0, left: 0, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '5px 0', cursor: 'pointer', fontSize: '0.8rem' }}>
                    <FaCamera /> Update
                 </label>
             </div>
             <input 
                id="profile-upload" 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
             />
             <p style={{ fontSize: '0.8rem', color: '#666' }}>Optional: JPG, PNG or WebP (Max 2MB)</p>
        </div>

        <div className="form-section">
          <h3><FaUser /> Personal Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <div className="input-with-icon">
                <FaUser className="input-icon" />
                <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3><FaLock /> Security Settings</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn secondary"
            onClick={() => navigate('/profile')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn primary"
            disabled={loading}
          >
            {loading ? 'Committing Changes...' : 'Save Clinical Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfileForm;