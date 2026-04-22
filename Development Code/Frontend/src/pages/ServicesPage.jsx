import React from 'react';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const services = [
    {
      title: "Hospital & Bed Search",
      icon: "fas fa-hospital-symbol",
      desc: "Real-time tracking of ICU, Ventilators, and General beds across all major hospitals in the valley.",
      link: "/hospital"
    },
    {
      title: "Medicine Inventory",
      icon: "fas fa-pills",
      desc: "Browse a database of 1000+ medicines, check stock levels at nearby pharmacies, and order online.",
      link: "/medicine"
    },
    {
      title: "Blood Request Network",
      icon: "fas fa-tint",
      desc: "Instant broadcast of urgent blood requirements to a network of registered donors and blood banks.",
      link: "/bloodbank"
    },
    {
      title: "Emergency Response",
      icon: "fas fa-ambulance",
      desc: "One-click access to emergency hotlines and the nearest specialized trauma centers.",
      link: "/emergency"
    }
  ];

  return (
    <div className="services-page">
      <div className="service-hero-header">
        <h1>Our Healthcare Services</h1>
        <p>Comprehensive digital solutions for real-time medical logistics and patient care.</p>
      </div>

      <div className="medical-grid">
        {services.map((service, index) => (
          <div key={index} className="medical-card" style={{ padding: '30px', textAlign: 'center' }}>
            <div className="service-icon" style={{ fontSize: '3rem', color: 'var(--color-navy)', marginBottom: '20px' }}>
              <i className={service.icon}></i>
            </div>
            <h3 style={{ color: 'var(--color-navy)', marginBottom: '15px' }}>{service.title}</h3>
            <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '25px' }}>{service.desc}</p>
            <Link to={service.link} className="btn-card-action btn-full-map">
              Access Service
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;
