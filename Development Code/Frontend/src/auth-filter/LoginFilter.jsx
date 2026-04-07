import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from '../utils/auth';

// Function to check if the user is logged in
function UserCheck() {
    const userId = localStorage.getItem("userId");
    return userId ? true : false; 
}

function LoginFilter() {
    const [loginStatus, setLoginStatus] = useState(UserCheck());
    const navigate = useNavigate(); 

    useEffect(() => {
        // Check login status immediately
        setLoginStatus(UserCheck());

        // Create an interval to check login status periodically
        const interval = setInterval(() => {
            setLoginStatus(UserCheck());
        }, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        setLoginStatus(false);
        navigate("/login");

    const handleLogin = async () => {
  try {
    const res = await login({ username, password });
    console.log(res);
    window.location.href = '/home';
  } catch (err) {
    console.error(err.response?.data?.message);
  }    
    };

    if (loginStatus) {
        return (
            <div className="auth-buttons">
                <Link to="/profile" className="auth-button profile">
                    <i className="fas fa-user"></i>
                </Link>
                <button onClick={handleLogout} className="auth-button logout">
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Logout</span>
                </button>
            </div>
        );
    }

    return (
        <div className="auth-buttons">
            <Link to="/login" className="auth-button login">
                <i className="fas fa-sign-in-alt"></i>
                <span>Login</span>
            </Link>
            <Link to="/signup" className="auth-button signup">
                <i className="fas fa-user-plus"></i>
                <span>Sign Up</span>
            </Link>
        </div>
    );
}
}
export default LoginFilter;
