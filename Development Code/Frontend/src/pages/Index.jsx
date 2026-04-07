import React from "react";
import { useNavigate } from "react-router-dom";
import MedicalCare from "../assets/image/MedicalCare.png";

function Index() {
  const navigate = useNavigate();
  
  return (
    <div className="index-container">
      <HeroSection navigate={navigate} />
      <ServicesSection navigate={navigate} />
      <HowItWorks />
    </div>
  );
}


function HeroSection({ navigate }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <div className="hero-text">
          <p style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '1px', marginBottom: '10px', textTransform: 'uppercase' }}>
             Professional Medical Assistance in Kathmandu
          </p>
          <h1>Hospital & Medicine Services</h1>
          <p>
            Quickly find available medicine, check hospital bed status, and connect with 
            verified blood banks. We provide real-time healthcare coordinates for immediate 
            medical assistance in Kathmandu.
          </p>
        </div>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => navigate('/medicine')}>
            <i className="fas fa-pills"></i> Find Medicine
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/hospital')}>
            <i className="fas fa-map-marker-alt"></i> Find Hospital Map
          </button>
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ navigate }) {
  const services = [
    {
      title: "Real-time Medicine Tracking",
      description: "Find and contact available medicine instantly in Kathmandu. Track their location and get immediate assistance.",
      icon: "fa-pills",
      route: "/medicine"
    },
    {
      title: "Hospital Availability",
      description: "Locate nearby hospitals, check bed availability, and get real-time updates on medical services.",
      icon: "fa-hospital",
      route: "/hospital"
    },
    {
      title: "Blood Bank Network",
      description: "Connect with blood banks and donors. Request specific blood types and receive notifications.",
      icon: "fa-tint",
      route: "/bloodbank"
    },
    {
      title: "Digital Health Records",
      description: "Store and access your medical history securely. Share health info with healthcare providers.",
      icon: "fa-file-medical",
      route: "/profile"
    }
  ];

  return (
    <section className="content-wrapper">
      <div className="split-section">
        <div className="split-image">
          <img src={MedicalCare} alt="Child being cared for" />
        </div>
        <div className="split-text">
          <h2 className="outfit-font">Unified Healthcare Access in Kathmandu</h2>
          <p>
            We've simplified the emergency healthcare process. Instead of searching for hours, 
            get instant access to medicine counts, hospital availability, and blood bank stocks 
            within your immediate vicinity.
          </p>
          <div className="medical-list-grid" style={{ gridTemplateColumns: '1fr', gap: '20px' }}>
            {services.map((service, idx) => (
              <div key={idx} className="medical-item" style={{ cursor: 'pointer', border: '1px solid #eee' }} onClick={() => navigate(service.route)}>
                <i className={`fas ${service.icon} bullet-icon`}></i>
                <div className="item-content">
                  <h3 style={{ fontSize: '1rem' }}>{service.title}</h3>
                  <p style={{ fontSize: '0.85rem', margin: 0 }}>{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: "fa-map-pin", title: "Share Location", desc: "Enable location to see nearby help" },
    { icon: "fa-search", title: "Select Service", desc: "Choose medicine, hospital or blood" },
    { icon: "fa-link", title: "Get Connected", desc: "Direct link to verified service providers" },
    { icon: "fa-check-circle", title: "Receive Help", desc: "Immediate tracking and assistance" }
  ];

  return (
    <section className="content-wrapper info-section" style={{ borderTop: '1px solid #eee' }}>
      <h2 className="grid-title outfit-font">How it Works</h2>
      <div className="medical-list-grid">
        {steps.map((step, idx) => (
          <div key={idx} className="medical-item" style={{ flexDirection: 'column', textAlign: 'center', backgroundColor: '#f9f9f9', padding: '30px' }}>
            <i className={`fas ${step.icon}`} style={{ fontSize: '2rem', color: 'var(--color-navy)', marginBottom: '15px' }}></i>
            <h3 style={{ marginBottom: '10px' }}>{step.title}</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}


export default Index;