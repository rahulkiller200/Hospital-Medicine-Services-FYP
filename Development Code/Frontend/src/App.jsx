import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { io } from 'socket.io-client';

import Index from "./pages/Index.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/signUp.jsx";
import Hospital from "./pages/Hospital.jsx";
import Medicine from "./pages/Medicine.jsx";
import BloodBank from "./pages/BloodBank.jsx";
import Profile from "./pages/Profile.jsx";
import Contact from "./pages/Contact.jsx";
import FAQ from "./pages/FAQ.jsx";
import Emergency from "./pages/Emergency.jsx";
import AdminDashboard from "./pages/dashboard/adminDashboardPages/AdminDashboard.jsx";
import DashboardBloodBank from "./pages/dashboard/DashboardBloodBank.jsx";
import DashboardHospital from "./pages/dashboard/DashboardHospital.jsx";
import DashboardPharmacy from "./pages/dashboard/DashboardPharmacy.jsx";
import PrivateRoute from "./auth-filter/PrivateRoute.jsx";
import OrderMedicine from "./pages/OrderMedicine.jsx";
import Map from "./pages/Map.jsx";
import Chatbot from "./components/Chatbot/Chatbot.jsx";
import QRScanner from "./pages/QRScanner.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import EditMedicalHistoryForm from "./components/Forms/EditMedicalHistoryForm.jsx";
import EditProfileForm from "./components/Forms/EditProfileForm.jsx";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";

const socket = io('http://localhost:3001', { withCredentials: true });

// Wrapper to conditionally hide the button on the home page if desired, 
// but user requested it on ALL pages. Let's show it everywhere, except 
// we won't need useLocation logic if it's strictly on all pages. 
// Just putting it inside Router is fine.

function AppContent() {
  const location = useLocation();
  const isDashboard = location.pathname.toLowerCase().includes('dashboard');

  // Listen for global real-time emergency events
  useEffect(() => {
      socket.on('hospital_updated', (data) => {
        toast.info(data.message, { position: "top-right", autoClose: 5000, theme: "colored" });
      });
      
      socket.on('new_order', (data) => {
        toast.success(data.message, { position: "top-right", autoClose: 5000 });
      });
      
      return () => {
        socket.off('hospital_updated');
        socket.off('new_order');
      };
    }, []);

  return (
    <>
      <ToastContainer />
      {!isDashboard && <Header />}
      
      <main className={!isDashboard ? "main-content-area" : ""}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/emergency" element={<Emergency />} />
          
          {/* Protected Patient Routes */}
          <Route path="/hospital" element={<PrivateRoute element={<Hospital />} />} />
          <Route path="/medicine" element={<PrivateRoute element={<Medicine />} />} />
          <Route path="/verify-medicine" element={<PrivateRoute element={<QRScanner />} />} />
          <Route path="/order-medicine" element={<PrivateRoute element={<OrderMedicine />} />} />
          <Route path="/bloodbank" element={<PrivateRoute element={<BloodBank />} />} />
          <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
          <Route path="/patient/profile/edit" element={<PrivateRoute element={<EditProfileForm />} />} />
          <Route path="/patient/history/edit" element={<PrivateRoute element={<EditMedicalHistoryForm />} />} />
          <Route path="/patient-history/edit" element={<PrivateRoute element={<EditMedicalHistoryForm />} />} />
          <Route path="/Map" element={<PrivateRoute element={<Map />} />} />
          <Route path="/locations" element={<PrivateRoute element={<Map />} />} />
          
          {/* Dashboard Routes based on role */}
          <Route path="/admin-dashboard" element={<PrivateRoute element={<AdminDashboard />} />} />
          <Route path="/bloodbank-dashboard" element={<PrivateRoute element={<DashboardBloodBank />} />} />
          <Route path="/hospital-dashboard" element={<PrivateRoute element={<DashboardHospital />} />} />
          <Route path="/pharmacy-dashboard" element={<PrivateRoute element={<DashboardPharmacy />} />} />
        </Routes>
      </main>

      {!isDashboard && <Footer />}
      <Chatbot />
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;