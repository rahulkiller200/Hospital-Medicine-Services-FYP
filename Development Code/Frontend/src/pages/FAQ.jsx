import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function FAQ() {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleAccordion = (index) => {
        if (activeIndex === index) {
            setActiveIndex(null);
        } else {
            setActiveIndex(index);
        }
    };

    const faqData = [
        {
            question: "How do I register as a Patient?",
            answer: "Simply navigate to the Sign Up page, select 'Patient' from the Role dropdown menu, and fill in your details. Once registered, you will have immediate access to order medicines, view blood banks, and search for hospitals."
        },
        {
            question: "Is Two-Factor Authentication required?",
            answer: "For Patients, standard login is sufficient. However, for administrative and medical facility accounts (such as Hospitals), our Master Node strictly enforces a mandatory 6-digit 2FA OTP verification for security reasons."
        },
        {
            question: "How can I order medicines online?",
            answer: "After logging in as a Patient, click on the 'Medicines' tab in the navigation bar. You can browse the verified database, add medicines to your cart, set your location via the integrated Map, and check out securely."
        },
        {
            question: "What should I do in an emergency?",
            answer: "If you are experiencing a life-threatening emergency, please dial your national emergency number (e.g., 102) immediately. Alternatively, you can use our built-in Map to locate the nearest emergency-ready Hospital."
        },
        {
            question: "How is my medical history kept secure?",
            answer: "Your privacy is our priority. All medical history records are encrypted in our MongoDB cluster. Only your authenticated Patient account and authorized administrative Master Nodes can access your historical data."
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', fontFamily: '"Inter", "Segoe UI", sans-serif', paddingBottom: '50px' }}>
            {/* Minimal Navigation Bar */}
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

            <div style={{ maxWidth: '800px', margin: '50px auto', padding: '0 20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ color: '#1a365d', fontSize: '3rem', marginBottom: '15px' }}>Frequently Asked Questions</h1>
                    <p style={{ color: '#4a5568', fontSize: '1.2rem' }}>Got questions? We've got answers.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {faqData.map((faq, index) => (
                        <div key={index} style={{ background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.5)' }}>
                            <div 
                                onClick={() => toggleAccordion(index)} 
                                style={{ padding: '20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: activeIndex === index ? '#f8fafc' : 'transparent', transition: 'background 0.3s' }}
                            >
                                <h3 style={{ margin: 0, color: '#2d3748', fontSize: '1.1rem', fontWeight: 'bold' }}>{faq.question}</h3>
                                <div style={{ color: '#1a365d', transition: 'transform 0.3s', transform: activeIndex === index ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                    <i className="fas fa-chevron-down"></i>
                                </div>
                            </div>
                            
                            <div style={{ maxHeight: activeIndex === index ? '200px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease-in-out', backgroundColor: '#fdfdfd' }}>
                                <p style={{ padding: '0 20px 20px 20px', margin: 0, color: '#4a5568', lineHeight: '1.6' }}>
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '50px', padding: '30px', background: 'rgba(255,255,255,0.5)', borderRadius: '15px', border: '1px dashed #cbd5e0' }}>
                    <h3 style={{ color: '#1a365d', marginTop: 0 }}>Still need help?</h3>
                    <p style={{ color: '#4a5568' }}>Our dedicated support team is available 24/7 to assist you.</p>
                    <button onClick={() => navigate('/contact')} style={{ background: '#3182ce', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 4px 10px rgba(49, 130, 206, 0.3)' }}>
                        <i className="fas fa-envelope"></i> Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FAQ;
