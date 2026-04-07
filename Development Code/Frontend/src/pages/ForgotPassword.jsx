import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { API_V1_URL } from "../config/apiConfig";
import "./Auth.css";

function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Verify, 2: Reset
  const [formData, setFormData] = useState({
    email: "",
    lastName: "",
    newPassword: "",
    confirmPassword: "",
    captchaAnswer: ""
  });
  
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, result: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Generate a simple math captcha
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10) + 1;
    const n2 = Math.floor(Math.random() * 10) + 1;
    setCaptcha({ num1: n1, num2: n2, result: n1 + n2 });
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate Captcha
    if (parseInt(formData.captchaAnswer) !== captcha.result) {
      setError("Incorrect security answer. Please try again.");
      generateCaptcha();
      setFormData({ ...formData, captchaAnswer: "" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_V1_URL}/auth/verify-recovery`, {
        email: formData.email,
        lastName: formData.lastName
      });

      if (response.data.success) {
        setUserId(response.data.userId);
        setStep(2);
        toast.info("Identity verified. Please set your new password.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Check your details.");
      generateCaptcha();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.newPassword.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_V1_URL}/auth/reset-password`, {
        userId,
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        toast.success("Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{step === 1 ? "Account Recovery" : "Reset Password"}</h1>
          <p>{step === 1 ? "Verify your identity using your creation details" : "Create a strong new password"}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 1 ? (
          <form className="login-form" onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="email"><i className="fas fa-envelope"></i> Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your registered email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName"><i className="fas fa-key"></i> Last Name (Creation handle)</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label><i className="fas fa-shield-alt"></i> Security Check: {captcha.num1} + {captcha.num2} = ?</label>
              <input
                type="number"
                name="captchaAnswer"
                placeholder="Result"
                value={formData.captchaAnswer}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? <i className="fas fa-spinner fa-spin"></i> : "Verify Identity"}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleReset}>
            <div className="form-group">
              <label htmlFor="newPassword"><i className="fas fa-lock"></i> New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="Choose a strong password"
                value={formData.newPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword"><i className="fas fa-check-circle"></i> Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repeat new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? <i className="fas fa-spinner fa-spin"></i> : "Reset Password"}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p>Remembered your password? <Link to="/login" className="signup-link">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
