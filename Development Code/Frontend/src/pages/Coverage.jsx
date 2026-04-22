import React from 'react';

const Coverage = () => {
  const areas = [
    { name: "Kathmandu District", locations: ["Maharajgunj", "Kantipath", "Thapathali", "Kalimati", "Baneshwor", "Chabahil"] },
    { name: "Lalitpur District", locations: ["Patan", "Jawalakhel", "Kupondole", "Satdobato", "Gwarko"] },
    { name: "Bhaktapur District", locations: ["Suryabinayak", "Madhyapur Thimi", "Sallaghari", "Bhaktapur Durbar Square Area"] }
  ];

  return (
    <div className="coverage-page">
      <div className="service-hero-header">
        <h1>Network Coverage</h1>
        <p>Our digital health infrastructure currently covers 100% of the core Kathmandu Valley districts.</p>
      </div>

      <div className="medical-grid" style={{ paddingBottom: '80px' }}>
        {areas.map((area, index) => (
          <div key={index} className="medical-card" style={{ padding: '30px' }}>
            <h3 style={{ color: 'var(--color-navy)', marginBottom: '15px' }}>
              <i className="fas fa-map-marked-alt" style={{ marginRight: '10px', color: 'var(--color-accent)' }}></i>
              {area.name}
            </h3>
            <div className="card-badges" style={{ justifyContent: 'flex-start' }}>
              {area.locations.map((loc, lIndex) => (
                <span key={lIndex} className="clinical-badge badge-emergency" style={{ background: '#f0f4f8', color: 'var(--color-navy)', border: '1px solid #d1d9e6' }}>
                  {loc}
                </span>
              ))}
            </div>
            <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#666' }}>
              Full access to Medicine Delivery and Hospital Redirects in this district.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coverage;
