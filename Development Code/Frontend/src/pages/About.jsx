import React from 'react';

const About = () => {
  return (
    <div className="about-page-container">
      <div className="service-hero-header">
        <h1>About HMS</h1>
        <p>Bridging the gap between patients and immediate healthcare coordinates in Nepal.</p>
      </div>

      <div className="medical-grid" style={{ padding: '0 10% 80px', marginTop: '-20px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: 'var(--shadow-card)' }}>
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ color: 'var(--color-navy)', marginBottom: '20px' }}>Our Mission</h2>
            <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444' }}>
              At Hospital & Medicine Services (HMS), our mission is to ensure that no medical emergency goes unanswered due to a lack of information. We strive to provide the citizens of Kathmandu and the surrounding valley with a unified, real-time platform to locate hospitals, secure blood donations, and order essential medicines instantly.
            </p>
          </section>

          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ color: 'var(--color-navy)', marginBottom: '20px' }}>Why We Started</h2>
            <p style={{ lineHeight: '1.8', fontSize: '1.1rem', color: '#444' }}>
              In critical moments, every second counts. Finding an available ICU bed or a specific blood type should not be a matter of luck or multiple phone calls. HMS was built during the Final Year Project initiative to solve these logistical challenges using modern web technology and real-time database synchronization.
            </p>
          </section>

          <div className="card-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div className="stat-item" style={{ textAlign: 'center' }}>
              <span className="stat-value" style={{ fontSize: '2rem' }}>50+</span>
              <span className="stat-label">Hospitals Linked</span>
            </div>
            <div className="stat-item" style={{ textAlign: 'center' }}>
              <span className="stat-value" style={{ fontSize: '2rem' }}>10k+</span>
              <span className="stat-label">Medicine Units</span>
            </div>
            <div className="stat-item" style={{ textAlign: 'center' }}>
              <span className="stat-value" style={{ fontSize: '2rem' }}>24/7</span>
              <span className="stat-label">Emergency Support</span>
            </div>
            <div className="stat-item" style={{ textAlign: 'center' }}>
              <span className="stat-value" style={{ fontSize: '2rem' }}>102</span>
              <span className="stat-label">Direct Hotline</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
