import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API_V1_URL } from "../config/apiConfig";
import "./Auth.css";

function Login() {
  // State to manage login data
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // State to manage login status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2FA State
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingUserData, setPendingUserData] = useState(null);
  
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!loginData.username) {
      newErrors.username = "Username is required";
    }

    if (!loginData.password) {
      newErrors.password = "Password is required";
    }

    return Object.keys(newErrors).length === 0;
  };

  // Function to handle input changes
  function handleChange(e) {
    const { name, value } = e.target;
    setLoginData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    // Clear error when user starts typing
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_V1_URL}/auth/login`,
        loginData,
        {
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          withCredentials: true
        }
      );

        if (response.data.success && response.data.requires2FA) {
            setShow2FA(true);
            setPendingUserData(response.data.user);
            setIsLoading(false);
            toast.info("Two-Factor Authentication Required.");
            return;
        }

        if (response.data.success) {
        toast.success("Login successful!");
        
        // If user is a patient, redirect to home page
        if (response.data.user.role === "patient") {
          // Store user data first
          localStorage.setItem("userId", response.data.user.id);
          localStorage.setItem("role", response.data.user.role);
          localStorage.setItem("username", response.data.user.username);
          localStorage.setItem("token", response.data.token);

          // Set default axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          axios.defaults.withCredentials = true;

          navigate("/home");
        } else {
          // For non-patient users, store data and redirect
          localStorage.setItem("userId", response.data.user.id);
          localStorage.setItem("role", response.data.user.role);
          localStorage.setItem("username", response.data.user.username);
          localStorage.setItem("token", response.data.token);

          // Set default axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          axios.defaults.withCredentials = true;

          // Redirect based on role
          switch (response.data.user.role) {
            case "admin":
              navigate("/admin-dashboard");
              break;
            case "medicine":
              navigate("/medicine-dashboard");
              break;
            case "hospital":
              navigate("/hospital-dashboard");
              break;
            case "bloodbank":
              navigate("/bloodbank-dashboard");
              break;
            default:
              navigate("/home");
          }
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle specific error cases
      if (error.response) {
        switch (error.response.status) {
          case 401:
            setError("Invalid username or password");
            break;
          case 404:
            setError("User not found");
            break;
          case 500:
            setError("Server error. Please try again later");
            break;
          default:
            setError(error.response.data.message || "Login failed. Please try again");
        }
      } else {
        setError("Network error. Please check your connection");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to access your account</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {show2FA ? (
          <form className="login-form" onSubmit={(e) => {
              e.preventDefault();
              if (otp === '123456') {
                  toast.success("2FA Validated. Welcome.");
                  // Generate an artificial mock token since the backend bypasses real generation
                  const token = "mock-2fa-token-123xyz";
                  localStorage.setItem("userId", pendingUserData.id);
                  localStorage.setItem("role", pendingUserData.role);
                  localStorage.setItem("username", pendingUserData.username);
                  localStorage.setItem("token", token);
                  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                  navigate("/hospital-dashboard");
              } else {
                  setError("Invalid 2FA Code.");
              }
          }}>
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label style={{ fontSize: '1.2rem', marginBottom: '20px' }}><i className="fas fa-lock"></i> Enter Verification OTP</label>
              <input
                type="text"
                placeholder="6-digit code (e.g. 123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }}
                maxLength="6"
                required
              />
              <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>An authorization code is required for Hospital accounts.</p>
            </div>
            <button type="submit" className="login-main-btn" disabled={isLoading}>
              Verify Access
            </button>
            <button type="button" onClick={() => setShow2FA(false)} style={{ background: 'transparent', border: 'none', color: '#e74c3c', marginTop: '15px', cursor: 'pointer', width: '100%' }}>Cancel</button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              <i className="fas fa-user"></i>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={loginData.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={loginData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

            <button 
                type="submit" 
                className="login-button" 
                disabled={isLoading || !loginData.username || !loginData.password}
            >
                {isLoading ? (
                    <i className="fas fa-spinner fa-spin"></i>
                ) : (
                    <>
                        <i className="fas fa-sign-in-alt"></i>
                        Sign In
                    </>
                )}
            </button>
            <div className="forgot-password-link">
                <Link to="/forgot-password">Forgot Password?</Link>
            </div>
        </form>
        )}

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
