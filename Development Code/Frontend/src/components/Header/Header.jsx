import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LanguageSelector from "../LanguageSelector";

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, text: "Your Health Profile score is uncalculated. Please update your BMI.", type: "alert", time: "2m ago", read: false },
        { id: 2, text: "Order #803X has been secured by local Pharmacy.", type: "success", time: "1h ago", read: false },
        { id: 3, text: "Welcome to the HMS platform!", type: "info", time: "2h ago", read: true },
        { id: 4, text: "New blood bank registered in Kathmandu.", type: "info", time: "5h ago", read: true }
    ]);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="notification-bell-wrapper" ref={dropdownRef}>
            <div 
                className="bell-trigger"
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </div>

            {isOpen && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h4>Notifications</h4>
                        <span>{unreadCount} New</span>
                    </div>
                    <div className="notification-list">
                        {notifications.map(n => (
                            <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'} type-${n.type}`}>
                                <span className="notification-text">{n.text}</span>
                                <span className="notification-time"><i className="far fa-clock"></i> {n.time}</span>
                            </div>
                        ))}
                    </div>
                    {unreadCount > 0 && (
                        <button 
                            className="mark-read-btn"
                            onClick={() => {
                                setNotifications(notifications.map(n => ({ ...n, read: true })));
                                setTimeout(() => setIsOpen(false), 300);
                            }}
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const Header = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem("username");
    const userRole = localStorage.getItem("role");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        localStorage.removeItem("username");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        window.location.href = "/login"; // Force full redirect to clear all states
    };

    return (
        <>
            <div className="utility-bar">
                <div className="utility-links">
                    <Link to="/contact">Support</Link>
                    <Link to="/faq">FAQ</Link>
                    <Link to="/emergency">Emergency Contact</Link>
                    <Link to="/locations">Locations</Link>
                    <LanguageSelector />
                </div>
            </div>

            <header className="main-header">
                <div className="logo-container" onClick={() => navigate('/')}>
                    <h2>
                        <i className="fas fa-hand-holding-medical logo-icon"></i> 
                        Hospital & Medicine Services
                    </h2>
                </div>

                <nav className="nav-links">
                    <Link to="/home"><i className="fas fa-home"></i> Home</Link>
                    <Link to="/hospital">Hospitals</Link>
                    <Link to="/medicine">Medicines</Link>
                    <Link to="/bloodbank">Blood Bank</Link>
                    {userRole === 'admin' && <Link to="/admin-dashboard">Admin Dashboard</Link>}
                    {userRole === 'hospital' && <Link to="/hospital-dashboard">Hospital Dashboard</Link>}
                    {userRole === 'pharmacy' && <Link to="/pharmacy-dashboard">Pharmacy Dashboard</Link>}
                    {userRole === 'bloodbank' && <Link to="/bloodbank-dashboard">Blood Bank Dashboard</Link>}
                    {username && userRole === 'patient' && <Link to="/profile">My Profile</Link>}
                </nav>

                <div className="header-actions">
                    {username && userRole !== 'admin' && <NotificationBell />}
                    
                    <div 
                        className="user-account-trigger"
                        onClick={() => navigate(username ? '/profile' : '/login')} 
                    >
                        {username ? (
                            <><i className="fas fa-user-circle"></i> {username}</>
                        ) : (
                            <><i className="fas fa-sign-in-alt"></i> Account Login</>
                        )}
                    </div>

                    {username && (
                        <button className="logout-btn" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    )}

                    <i className="fas fa-search search-trigger"></i>
                </div>
            </header>
        </>
    );
};

export default Header;
