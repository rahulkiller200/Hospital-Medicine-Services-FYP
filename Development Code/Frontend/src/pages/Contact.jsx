import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function Contact() {
   const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
   const [isLoading, setIsLoading] = useState(false);
   const navigate = useNavigate();

   const handleSubmit = (e) => {
       e.preventDefault();
       setIsLoading(true);
       setTimeout(() => {
           toast.success("Message sent! Our support team will contact you shortly.");
           setFormData({ name: '', email: '', subject: '', message: '' });
           setIsLoading(false);
       }, 1000);
   };

   return (
       <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f7fa 0%, #bbdefb 100%)', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '50px' }}>
         <ToastContainer position="top-right" autoClose={3000} />
         
         {/* Minimal Navigation Bar to return to platform */}
         <nav style={{ padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', boxShadow: '0 2px 15px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
             <h2 style={{ color: '#1a365d', margin: 0, fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => navigate('/home')}>
                 <i className="fas fa-hand-holding-medical"></i> HMS Support
             </h2>
             <div>
                 <button onClick={() => navigate(-1)} style={{ background: '#1a365d', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                     <i className="fas fa-arrow-left"></i> Go Back
                 </button>
             </div>
         </nav>

         <div style={{ maxWidth: '1200px', margin: '50px auto', padding: '0 20px', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
             
             {/* Info Section */}
             <div style={{ flex: '1', minWidth: '300px' }}>
                 <h1 style={{ color: '#1a365d', fontSize: '3rem', marginBottom: '20px' }}>Get in Touch</h1>
                 <p style={{ color: '#4a5568', fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '40px' }}>
                     Whether you are a patient experiencing platform issues, a hospital looking to integrate, or a local pharmacy wanting to join our medicine network, our dedicated support team is available 24/7.
                 </p>
                 
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                         <div style={{ background: '#e3f2fd', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', color: '#1a365d' }}>
                             <i className="fas fa-phone-alt"></i>
                         </div>
                         <div>
                             <h3 style={{ margin: '0 0 5px 0', color: '#1a365d' }}>Emergency Hotline</h3>
                             <p style={{ margin: 0, color: '#e74c3c', fontWeight: 'bold' }}>102 (National) / +1 800-MED-HELP</p>
                         </div>
                     </div>

                     <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                         <div style={{ background: '#e3f2fd', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', color: '#1a365d' }}>
                             <i className="fas fa-envelope"></i>
                         </div>
                         <div>
                             <h3 style={{ margin: '0 0 5px 0', color: '#1a365d' }}>Email Support</h3>
                             <p style={{ margin: 0, color: '#4a5568' }}>support@hms-platform.com</p>
                         </div>
                     </div>

                     <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                         <div style={{ background: '#e3f2fd', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem', color: '#1a365d' }}>
                             <i className="fas fa-map-marker-alt"></i>
                         </div>
                         <div>
                             <h3 style={{ margin: '0 0 5px 0', color: '#1a365d' }}>Headquarters</h3>
                             <p style={{ margin: 0, color: '#4a5568' }}>Global Healthcare District, Building 4</p>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Form Section */}
             <div style={{ flex: '1.5', minWidth: '400px' }}>
                 <div style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(20px)', padding: '50px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.5)' }}>
                     <h2 style={{ margin: '0 0 30px 0', color: '#1a365d' }}>Send us a Message</h2>
                     <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                         <div style={{ display: 'flex', gap: '20px' }}>
                             <div style={{ flex: 1 }}>
                                 <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 'bold', fontSize: '0.9rem' }}>Full Name</label>
                                 <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="John Doe" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', boxSizing: 'border-box' }} />
                             </div>
                             <div style={{ flex: 1 }}>
                                 <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 'bold', fontSize: '0.9rem' }}>Email Address</label>
                                 <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required placeholder="john@example.com" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', boxSizing: 'border-box' }} />
                             </div>
                         </div>
                         
                         <div>
                             <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 'bold', fontSize: '0.9rem' }}>Subject Line</label>
                             <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required placeholder="How can we help?" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', boxSizing: 'border-box' }} />
                         </div>

                         <div>
                             <label style={{ display: 'block', marginBottom: '8px', color: '#2d3748', fontWeight: 'bold', fontSize: '0.9rem' }}>Message Detail</label>
                             <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} required placeholder="Please describe your issue or inquiry in detail..." style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', minHeight: '150px', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
                         </div>

                         <button type="submit" disabled={isLoading} style={{ background: '#1a365d', color: 'white', padding: '18px', borderRadius: '10px', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'transform 0.2s', boxShadow: '0 4px 15px rgba(26, 54, 93, 0.4)' }}>
                             {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i> Transmit Message</>}
                         </button>
                     </form>
                 </div>
             </div>
         </div>
       </div>
   );
}

export default Contact;