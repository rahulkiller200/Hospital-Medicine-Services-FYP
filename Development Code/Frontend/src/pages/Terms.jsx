import React from 'react';

const Terms = () => {
  return (
    <div className="legal-page">
      <div className="service-hero-header">
        <h1>Terms of Service</h1>
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
      </div>
      <div className="medical-grid" style={{ paddingBottom: '80px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', color: '#444', lineHeight: '1.6' }}>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-navy)' }}>1. Service Disclaimer</h2>
            <p>HMS is a coordination platform. While we provide real-time data, we are not responsible for the clinical decisions made by medical professionals or the availability of stock at third-party pharmacies.</p>
          </section>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-navy)' }}>2. Emergency Use</h2>
            <p>In life-threatening situations, always call 102 (Ambulance) or 100 (Police) directly. HMS digital tools are supplementary and should not delay traditional emergency calls.</p>
          </section>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-navy)' }}>3. Account Security</h2>
            <p>Users are responsible for maintaining the confidentiality of their Login and 2FA credentials.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
