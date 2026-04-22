import React from 'react';

const Privacy = () => {
  return (
    <div className="legal-page">
      <div className="service-hero-header">
        <h1>Privacy Policy</h1>
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
      </div>
      <div className="medical-grid" style={{ paddingBottom: '80px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', color: '#444', lineHeight: '1.6' }}>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-navy)' }}>1. Data Collection</h2>
            <p>HMS collects personal information such as name, contact details, and location data to provide efficient emergency services and medicine delivery in Kathmandu.</p>
          </section>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-navy)' }}>2. Use of Information</h2>
            <p>Your data is used strictly for medical coordination. Hospital and Blood Bank admins may see your contact info only when you initiate a request or broadcast.</p>
          </section>
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: 'var(--color-navy)' }}>3. Medical Records</h2>
            <p>Medical histories stored on HMS are encrypted and private. They are only accessible by you and authorized attending physicians during a consultation.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
