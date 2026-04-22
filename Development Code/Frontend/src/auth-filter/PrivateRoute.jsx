import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { setAuthToken, clearAuthData } from '../utils/auth';
import { API_V1_URL } from '../config/apiConfig';

function PrivateRoute({ element: Element }) {
    const [authState, setAuthState] = useState({
        isLoading: true,
        isAuthenticated: false,
        userRole: null
    });

    useEffect(() => {
        // Function to check authentication with the server
        const checkAuthentication = async () => {            
            try {                
                const token = localStorage.getItem('token');
                
                if (!token) {
                    console.log('No token found');
                    clearUserData();
                    return;
                }

                // Set the token in axios headers using the utility function
                setAuthToken(token);
                
                // Make the request with detailed error handling
                const response = await axios.get(`${API_V1_URL}/users/check-auth`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    withCredentials: true
                });
                
                if (response.data.success) {
                    setAuthState({
                        isLoading: false,
                        isAuthenticated: true,
                        userRole: response.data.user.role
                    });
                    
                    // Update localStorage with latest user data
                    localStorage.setItem("userId", response.data.user.id);
                    localStorage.setItem("role", response.data.user.role);
                    localStorage.setItem("username", response.data.user.username);
                } else {
                    // Unexpected success response with no data
                    console.log('Authentication check returned success but no user data');
                    clearUserData();
                }
            } catch (error) {
                // If the request fails, the user is not authenticated
                console.log('Authentication check failed:', error.message);
                
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.log('Error status:', error.response.status);
                    console.log('Error data:', error.response.data);
                    
                    // If token is invalid or expired, clear auth data
                    if (error.response.status === 401) {
                        clearAuthData();
                    }
                } else if (error.request) {
                    // The request was made but no response was received
                    console.log('Error request:', error.request);
                } else {
                    // Something happened in setting up the request that triggered an Error
                    console.log('Error message:', error.message);
                }
                
                clearUserData();
            }
        };

        const clearUserData = () => {
            // Clear localStorage since the session is invalid
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            localStorage.removeItem("username");
            localStorage.removeItem("token");
            
            setAuthState({
                isLoading: false,
                isAuthenticated: false,
                userRole: null
            });
        };

        checkAuthentication();
    }, []); // Run once when component mounts

    // Show loading state while checking authentication
    if (authState.isLoading) {
        return <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Verifying your session...</p>
        </div>;
    }

    if (!authState.isAuthenticated) {
        console.log("PrivateRoute: Not authenticated, redirecting to login");
        return <Navigate to="/login" />;
    }    
    
    const currentPath = window.location.pathname.toLowerCase();
    
    // Redirect users to their specific dashboards if they try to access general patient routes
    const patientOnlyRoutes = ['/hospital', '/bloodbank', '/medicine', '/map'];
    if (patientOnlyRoutes.includes(currentPath) && authState.userRole !== 'patient') {
        if (authState.userRole === 'hospital') return <Navigate to="/hospital-dashboard" />;
        if (authState.userRole === 'bloodbank') return <Navigate to="/bloodbank-dashboard" />;
        if (authState.userRole === 'pharmacy') return <Navigate to="/pharmacy-dashboard" />;
        if (authState.userRole === 'admin') return <Navigate to="/admin-dashboard" />;
    }
    if (currentPath === '/admin-dashboard' && authState.userRole !== 'admin') {
        return <Navigate to="/login" />;
    }
    if (currentPath === '/medicine-dashboard' && authState.userRole !== 'medicine') {
        return <Navigate to="/login" />;
    }
    if (currentPath === '/hospital-dashboard' && authState.userRole !== 'hospital') {
        return <Navigate to="/login" />;
    }
    if (currentPath === '/bloodbank-dashboard' && authState.userRole !== 'bloodbank') {
        return <Navigate to="/login" />;
    }

    return Element;
}

export default PrivateRoute;
