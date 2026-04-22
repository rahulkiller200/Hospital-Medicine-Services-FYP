import React from 'react';

const MedicalTeam = () => {
  const departments = [
    { name: "Emergency Medicine", icon: "fas fa-heartbeat", lead: "Dr. Sanduk Ruit (Network Lead)" },
    { name: "Cardiology", icon: "fas fa-lungs", lead: "Dr. Bhagwan Koirala" },
    { name: "Neurology", icon: "fas fa-brain", lead: "Specialist Group" },
    { name: "Pediatrics", icon: "fas fa-baby", lead: "Community Care" },
    { name: "General Surgery", icon: "fas fa-user-md", lead: "Hospital Alliance" },
    { name: "Orthopedics", icon: "fas fa-bone", lead: "Trauma Network" }
  ];

  return (
    <div className="medical-team-page">
      <div className="service-hero-header">
        <h1>Our Medical Expertise</h1>
        <p>Connecting you with specialized medical departments and highly qualified professionals across our hospital network.</p>
      </div>

      <div className="medical-grid" style={{ paddingBottom: '80px' }}>
        {departments.map((dept, index) => (
          <div key={index} className="medical-card" style={{ padding: '30px', borderTop: '5px solid var(--color-accent)' }}>
            <div style={{ fontSize: '2.5rem', color: 'var(--color-navy)', marginBottom: '15px' }}>
              <i className={dept.icon}></i>
            </div>
            <h3 style={{ color: 'var(--color-navy)', marginBottom: '10px' }}>{dept.name}</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>Affiliated Specialist Teams</p>
            <div style={{ 
              padding: '10px', 
              background: 'var(--color-bg-light)', 
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: 'var(--color-navy)'
            }}>
              Consultant: {dept.lead}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalTeam;
